import { supabase } from '../db/supabase.js';

/**
 * Fetch reports for a given project with graceful fallback
 */
export async function getReportsForProject(projectId) {
  try {
    // 1. Try querying project_reports table
    const { data, error } = await supabase
      .from('project_reports')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      // Enrich with phase info if available
      const phaseIds = [...new Set(data.filter(r => r.phase_id).map(r => r.phase_id))];
      let phasesMap = {};
      if (phaseIds.length > 0) {
        try {
          const { data: phasesData } = await supabase
            .from('project_investment_phases')
            .select('id, phase_number, title, status')
            .in('id', phaseIds);
          if (phasesData) {
            phasesMap = Object.fromEntries(phasesData.map(p => [p.id, p]));
          }
        } catch (pErr) {
          // Ignore
        }
      }

      return data.map(r => ({
        ...r,
        phase: r.phase_id ? phasesMap[r.phase_id] || null : null
      }));
    }
  } catch (err) {
    // Fall through to fallback
  }

  // 2. Fallback to project_documents table
  try {
    const { data: docs, error: docErr } = await supabase
      .from('project_documents')
      .select('*')
      .eq('project_id', projectId)
      .eq('file_type', 'progress_report')
      .order('created_at', { ascending: false });

    if (!docErr && Array.isArray(docs)) {
      return docs.map(doc => {
        let meta = {};
        try {
          meta = JSON.parse(doc.file_name);
        } catch (e) {
          meta = { title: doc.file_name, summary: '' };
        }
        return {
          id: doc.id,
          project_id: doc.project_id,
          entrepreneur_id: meta.entrepreneur_id || null,
          phase_id: meta.phase_id || null,
          title: meta.title || 'Project Progress Report',
          summary: meta.summary || '',
          key_achievements: meta.key_achievements || '',
          next_steps: meta.next_steps || '',
          report_type: meta.report_type || 'Progress',
          attachment_url: doc.file_url || null,
          created_at: doc.created_at,
          updated_at: doc.created_at,
          phase: meta.phase || null
        };
      });
    }
  } catch (fallbackErr) {
    console.warn('Reports fallback lookup warning:', fallbackErr.message);
  }

  return [];
}

/**
 * Save a report for a given project with graceful fallback
 */
export async function saveReportForProject(projectId, entrepreneurId, reportData) {
  const { title, summary, key_achievements, next_steps, phase_id, report_type, attachment_url } = reportData;

  // Fetch phase info if phase_id is provided
  let phaseInfo = null;
  if (phase_id) {
    try {
      const { data: pData } = await supabase
        .from('project_investment_phases')
        .select('id, phase_number, title, status')
        .eq('id', phase_id)
        .single();
      if (pData) phaseInfo = pData;
    } catch (e) {
      // Ignore
    }
  }

  // 1. Try inserting into project_reports
  try {
    const { data, error } = await supabase
      .from('project_reports')
      .insert([{
        project_id: projectId,
        entrepreneur_id: entrepreneurId,
        phase_id: phase_id || null,
        title,
        summary,
        key_achievements: key_achievements || null,
        next_steps: next_steps || null,
        report_type: report_type || 'Progress',
        attachment_url: attachment_url || null
      }])
      .select()
      .single();

    if (!error && data) {
      return { ...data, phase: phaseInfo };
    }
  } catch (err) {
    // Fall through to fallback
  }

  // 2. Fallback to project_documents
  const meta = {
    title,
    summary,
    key_achievements: key_achievements || '',
    next_steps: next_steps || '',
    phase_id: phase_id || null,
    report_type: report_type || 'Progress',
    entrepreneur_id: entrepreneurId,
    phase: phaseInfo
  };

  const { data: docData, error: docError } = await supabase
    .from('project_documents')
    .insert([{
      project_id: projectId,
      file_name: JSON.stringify(meta),
      file_url: attachment_url || '',
      file_type: 'progress_report',
      is_public: true
    }])
    .select()
    .single();

  if (docError) throw docError;

  return {
    id: docData.id,
    project_id: docData.project_id,
    entrepreneur_id: entrepreneurId,
    phase_id: phase_id || null,
    title,
    summary,
    key_achievements: key_achievements || '',
    next_steps: next_steps || '',
    report_type: report_type || 'Progress',
    attachment_url: docData.file_url || null,
    created_at: docData.created_at,
    updated_at: docData.created_at,
    phase: phaseInfo
  };
}

/**
 * Delete a report with graceful fallback
 */
export async function deleteReportById(reportId) {
  // Try deleting from project_reports
  try {
    const { error: repErr } = await supabase
      .from('project_reports')
      .delete()
      .eq('id', reportId);
    if (!repErr) return true;
  } catch (e) {
    // Ignore
  }

  // Try deleting from project_documents
  try {
    const { error: docErr } = await supabase
      .from('project_documents')
      .delete()
      .eq('id', reportId);
    if (!docErr) return true;
  } catch (e) {
    // Ignore
  }

  return true;
}
