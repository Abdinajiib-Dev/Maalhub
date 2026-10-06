import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Target, 
  ChevronLeft, 
  Loader2, 
  DollarSign, 
  Send, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Edit3,
  FileText,
  PlusCircle,
  Trash2,
  FileArchive,
  Upload,
  Download
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import ProjectProgressBar from '../components/ProjectProgressBar';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', msg: '' });

  // Phase update loading state (for entrepreneur owners)
  const [phaseActionLoading, setPhaseActionLoading] = useState(null);

  // Progress percentage update state (for entrepreneur owners)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressSuccessMessage, setProgressSuccessMessage] = useState('');
  const [progressErrorMessage, setProgressErrorMessage] = useState('');

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingProgress(true);
    setProgressErrorMessage('');
    setProgressSuccessMessage('');
    try {
      const updatedVal = Math.min(100, Math.max(0, parseInt(newProgress, 10) || 0));
      const res = await api.updateProject(id, { 
        progress_percentage: updatedVal,
        current_progress: `${updatedVal}%`
      });
      setProject(prev => ({ 
        ...prev, 
        ...(res || {}),
        progress_percentage: updatedVal,
        current_progress: `${updatedVal}%`
      }));
      setProgressSuccessMessage(`Progress successfully updated to ${updatedVal}%!`);
      setTimeout(() => {
        setIsProgressModalOpen(false);
        setProgressSuccessMessage('');
      }, 700);
    } catch (err) {
      setProgressErrorMessage(err.message || 'Failed to update progress');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Report state (for entrepreneur owners and investors)
  const [reports, setReports] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    summary: '',
    key_achievements: '',
    next_steps: '',
    phase_id: '',
    report_type: 'Progress',
    progress_percentage: ''
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const fetchReports = async () => {
    try {
      const repData = await api.getProjectReports(id);
      setReports(Array.isArray(repData) ? repData : []);
    } catch (err) {
      // Ignore
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportForm.title || !reportForm.summary) {
      setReportError('Please fill in both the report title and summary.');
      return;
    }
    setIsSubmittingReport(true);
    setReportError('');
    try {
      const newRep = await api.createProjectReport(id, reportForm);
      setReports(prev => [newRep, ...prev]);
      if (reportForm.progress_percentage !== '') {
        const val = Math.min(100, Math.max(0, parseInt(reportForm.progress_percentage) || 0));
        setProject(prev => ({ ...prev, progress_percentage: val }));
      }
      setIsReportModalOpen(false);
      setReportForm({
        title: '',
        summary: '',
        key_achievements: '',
        next_steps: '',
        phase_id: '',
        report_type: 'Progress',
        progress_percentage: ''
      });
    } catch (err) {
      setReportError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.deleteProjectReport(id, reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      alert(`Failed to delete report: ${err.message}`);
    }
  };

  // Phase Evidence Upload Modal State
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidencePhaseId, setEvidencePhaseId] = useState(null);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceSummary, setEvidenceSummary] = useState('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');

  const handleOpenEvidenceModal = (phase) => {
    setEvidencePhaseId(phase.id);
    setEvidenceFile(null);
    setEvidenceSummary('');
    setEvidenceError('');
    setIsEvidenceModalOpen(true);
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceFile) {
      setEvidenceError('Please select a ZIP file or deliverables document as evidence.');
      return;
    }

    setIsSubmittingEvidence(true);
    setEvidenceError('');

    try {
      // 1. Upload ZIP file to Supabase storage
      const { publicUrl, fileName } = await api.uploadPhaseEvidence(id, evidenceFile);

      // 2. Identify target phase
      const targetPhase = (project.phases || []).find(p => p.id === evidencePhaseId);

      // 3. Update phase status to Completed and store evidence details
      await api.updateProjectPhase(id, evidencePhaseId, {
        status: 'Completed',
        evidence_url: publicUrl,
        evidence_name: fileName,
        evidence_submitted_at: new Date().toISOString(),
        create_evidence_report: true,
        report_title: `Phase ${targetPhase?.phase_number || ''} Completion Evidence: ${targetPhase?.title || ''}`,
        report_summary: evidenceSummary || `Entrepreneur uploaded completion evidence file (${fileName}) for investor review.`,
        key_achievements: `Completed Phase ${targetPhase?.phase_number || ''} deliverables and uploaded evidence archive (${fileName}).`,
        next_steps: 'Proceeding to next project phase.'
      });

      // 4. Refresh project data and reports list
      const updatedProject = await api.getProject(id);
      setProject(updatedProject);
      await fetchReports();

      setIsEvidenceModalOpen(false);
      setEvidenceFile(null);
      setEvidenceSummary('');
      setEvidencePhaseId(null);
    } catch (err) {
      console.error(err);
      setEvidenceError(err.message || 'Failed to upload phase evidence');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getProject(id);
        setProject(data);
        await fetchReports();
      } catch (err) {
        setError(err.message || 'Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-8 rounded-xl max-w-lg text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="mb-6">{error || 'Project not found.'}</p>
          <button onClick={() => navigate('/projects')} className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && project.entrepreneur_id === user.id;
  const isInvestor = user && profile?.role === 'investor';
  const phases = Array.isArray(project.phases) ? project.phases : [];

  const openInvestModalForPhase = (phaseId, suggestedAmount) => {
    setSelectedPhaseId(phaseId || '');
    if (suggestedAmount && suggestedAmount > 0) {
      setProposedAmount(suggestedAmount.toString());
    } else {
      setProposedAmount('');
    }
    setSubmitStatus({ type: '', msg: '' });
    setIsModalOpen(true);
  };

  const handleUpdatePhaseStatus = async (phaseId, newStatus) => {
    try {
      setPhaseActionLoading(phaseId);
      await api.updateProjectPhase(id, phaseId, { status: newStatus });
      setProject(prev => ({
        ...prev,
        phases: (prev.phases || []).map(p => p.id === phaseId ? { ...p, status: newStatus } : p)
      }));
    } catch (err) {
      alert(`Failed to update phase status: ${err.message}`);
    } finally {
      setPhaseActionLoading(null);
    }
  };

  const handleInvestmentSubmit = async (e) => {
    e.preventDefault();
    if (!proposedAmount || !message) {
      setSubmitStatus({ type: 'error', msg: 'Please fill in all required fields.' });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', msg: '' });
    
    try {
      await api.createInvestmentRequest({
        project_id: id,
        proposed_amount: parseFloat(proposedAmount),
        message: message,
        phase_id: selectedPhaseId || null
      });
      setSubmitStatus({ type: 'success', msg: 'Investment proposal sent successfully!' });
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitStatus({ type: '', msg: '' });
        setProposedAmount('');
        setMessage('');
        setSelectedPhaseId('');
      }, 2500);
    } catch (err) {
      setSubmitStatus({ type: 'error', msg: err.message || 'Failed to send request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPhase = phases.find(p => p.id === selectedPhaseId);

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Navigation Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          {isOwner && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                Your Project
              </span>
              <Link
                to={`/entrepreneur/edit-project/${id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-primary hover:bg-secondary transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Project
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              {project.industry || 'Various'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              {project.project_name}
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-6">
              {project.business_name}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                {project.location || 'Location unverified'}
              </div>
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-gray-400" />
                Stage: <span className="font-semibold text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-gray-400" />
                Added on: {new Date(project.created_at).toLocaleDateString()}
              </div>
              {phases.length > 0 && (
                <div className="flex items-center text-primary font-medium">
                  <Layers className="w-5 h-5 mr-2 text-primary" />
                  {phases.length} Funding {phases.length === 1 ? 'Phase' : 'Phases'}
                </div>
              )}
            </div>
          </div>

          {/* Funding Card */}
          <div className="w-full lg:w-84 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex-shrink-0">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Funding Goal</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-8 h-8 text-green-500 mr-1" />
              {project.funding_goal?.toLocaleString() || '0'}
            </h2>
            
            {isInvestor ? (
              <button 
                onClick={() => openInvestModalForPhase('', null)}
                className="w-full bg-primary hover:bg-secondary text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-6"
              >
                <Send className="w-5 h-5" />
                Request Investment
              </button>
            ) : !user ? (
              <Link to="/login" className="w-full block text-center bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold transition-all shadow-md mb-6">
                Log in to Invest
              </Link>
            ) : (
              <div className="w-full text-center bg-gray-50 text-gray-500 py-3.5 rounded-xl font-medium border border-gray-100 mb-6">
                {isOwner ? 'You are the Owner' : 'Viewing as Entrepreneur'}
              </div>
            )}

            {/* Project Progress Bar */}
            <div className="pt-4 border-t border-gray-100">
              <ProjectProgressBar progress={project.progress_percentage || 0} size="md" />
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setNewProgress(project.progress_percentage || 0);
                    setIsProgressModalOpen(true);
                  }}
                  className="mt-3 text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1.5 w-full py-2 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Update Progress Percentage
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">

            {/* INVESTMENT PHASES & ROADMAP SECTION */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                    Investment Phases & Roadmap
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Structured funding tranches and deliverables for this venture.
                  </p>
                </div>
              </div>

              {phases.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-gray-600 text-sm">
                    This project raises funding under a single general round of 
                    <span className="font-bold text-gray-900 ml-1">${project.funding_goal?.toLocaleString()}</span>.
                  </p>
                  {isInvestor && (
                    <button
                      onClick={() => openInvestModalForPhase('', project.funding_goal)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                    >
                      Make an investment offer <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {phases.map((phase, idx) => {
                    const currentAmt = Number(phase.current_amount || 0);
                    const targetAmt = Number(phase.target_amount || 1);
                    const percent = Math.min(100, Math.round((currentAmt / targetAmt) * 100));
                    const remainingAmt = Math.max(0, targetAmt - currentAmt);

                    const statusStyles = {
                      Active: {
                        badge: 'bg-blue-50 text-blue-700 border-blue-200',
                        dot: 'bg-blue-500 animate-pulse',
                        bar: 'bg-blue-600',
                      },
                      Funded: {
                        badge: 'bg-green-50 text-green-700 border-green-200',
                        dot: 'bg-green-500',
                        bar: 'bg-green-600',
                      },
                      Completed: {
                        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                        dot: 'bg-emerald-600',
                        bar: 'bg-emerald-600',
                      },
                      Upcoming: {
                        badge: 'bg-gray-100 text-gray-700 border-gray-200',
                        dot: 'bg-gray-400',
                        bar: 'bg-gray-300',
                      },
                    }[phase.status] || {
                      badge: 'bg-gray-100 text-gray-700 border-gray-200',
                      dot: 'bg-gray-400',
                      bar: 'bg-gray-400',
                    };

                    return (
                      <div 
                        key={phase.id || idx} 
                        className={`p-6 rounded-2xl border transition-all ${
                          phase.status === 'Active' 
                            ? 'bg-blue-50/20 border-blue-200 shadow-xs ring-1 ring-blue-100' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Phase Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                              {phase.phase_number || idx + 1}
                            </span>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{phase.title}</h4>
                              {phase.target_date && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                  Target Completion Date: {new Date(phase.target_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles.badge}`}>
                              <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
                              {phase.status}
                            </span>

                            {/* Owner phase status switcher & evidence upload button */}
                            {isOwner && (
                              <div className="flex items-center gap-2">
                                <select
                                  value={phase.status}
                                  disabled={phaseActionLoading === phase.id}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'Completed') {
                                      handleOpenEvidenceModal(phase);
                                    } else {
                                      handleUpdatePhaseStatus(phase.id, val);
                                    }
                                  }}
                                  className="text-xs border border-gray-200 bg-white text-gray-700 rounded-lg px-2 py-1 outline-none font-medium hover:border-gray-300"
                                >
                                  <option value="Upcoming">Upcoming</option>
                                  <option value="Active">Active</option>
                                  <option value="Funded">Funded</option>
                                  <option value="Completed">Completed</option>
                                </select>

                                <button
                                  onClick={() => handleOpenEvidenceModal(phase)}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg transition-colors shadow-2xs"
                                  title="Upload proof ZIP archive for this phase"
                                >
                                  <FileArchive size={14} />
                                  <span>{phase.evidence_url ? 'Update Evidence' : 'Submit Evidence (.zip)'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Phase Description */}
                        {phase.description && (
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed pl-11">
                            {phase.description}
                          </p>
                        )}

                        {/* Phase Evidence ZIP Card (if uploaded) */}
                        {phase.evidence_url && (
                          <div className="pl-11 mb-4">
                            <div className="p-3.5 bg-purple-50/80 border border-purple-200/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                                  <FileArchive size={20} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-900">Phase Completion Evidence</span>
                                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                                  </div>
                                  <p className="text-xs text-gray-600 truncate max-w-[220px] sm:max-w-xs font-medium mt-0.5">
                                    {phase.evidence_name || 'Deliverable ZIP Archive'}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={phase.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition-colors flex-shrink-0"
                              >
                                <Download size={14} />
                                <span>Download Evidence (.zip)</span>
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Financial Progress Bar */}
                        <div className="pl-11 mt-4">
                          <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                            <span>
                              Raised: <strong className="text-gray-900">${currentAmt.toLocaleString()}</strong> of ${targetAmt.toLocaleString()}
                            </span>
                            <span className="text-primary font-bold">{percent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 transition-all duration-500 ${statusStyles.bar}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          {/* Action Button for Investors */}
                          {isInvestor && phase.status !== 'Funded' && phase.status !== 'Completed' && (
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => openInvestModalForPhase(phase.id, remainingAmt > 0 ? remainingAmt : targetAmt)}
                                className="inline-flex items-center gap-2 text-xs font-bold bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg shadow-xs transition"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                Fund This Phase ({remainingAmt > 0 ? `$${remainingAmt.toLocaleString()} remaining` : `$${targetAmt.toLocaleString()}`})
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* PROGRESS REPORTS & ENTREPRENEUR UPDATES SECTION */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Progress Reports & Updates
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Official progress and updates posted by the entrepreneur.
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={() => {
                      setReportError('');
                      setReportForm(prev => ({
                        ...prev,
                        progress_percentage: project?.progress_percentage ?? ''
                      }));
                      setIsReportModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post Progress Report
                  </button>
                )}
              </div>

              {reports.length === 0 ? (
                <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-medium">No progress reports published yet.</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {isOwner 
                      ? 'Share progress, phase completions, and updates with your investors.' 
                      : 'The entrepreneur will share periodic progress reports and key achievements here.'}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Post your first report
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((rep) => (
                    <div key={rep.id} className="p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            rep.report_type === 'Achievements' ? 'bg-amber-100 text-amber-800' :
                            rep.report_type === 'Financial' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rep.report_type === 'Achievements' ? 'Key Achievements' : (rep.report_type || 'Progress')}
                          </span>
                          {rep.phase && (
                            <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                              Phase {rep.phase.phase_number}: {rep.phase.title}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rep.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {isOwner && (
                          <button
                            onClick={() => handleDeleteReport(rep.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2">{rep.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{rep.summary}</p>

                      {rep.key_achievements && (
                        <div className="mt-3 p-3 bg-green-50/70 border border-green-200 rounded-lg text-xs text-green-900">
                          <strong className="block font-bold mb-1 flex items-center gap-1.5 text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Key Achievements:
                          </strong>
                          <span className="whitespace-pre-line">{rep.key_achievements}</span>
                        </div>
                      )}

                      {rep.next_steps && (
                        <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
                          <strong className="block font-bold mb-1 flex items-center gap-1.5 text-blue-800">
                            <ArrowRight className="w-3.5 h-3.5 text-blue-600" /> Next Planned Steps:
                          </strong>
                          <span className="whitespace-pre-line">{rep.next_steps}</span>
                        </div>
                      )}

                      {rep.attachment_url && (
                        <div className="mt-3 p-3 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileArchive className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-gray-800">Attached Deliverables Evidence Archive</span>
                          </div>
                          <a
                            href={rep.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download (.zip)
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Project Overview */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Project Overview</h3>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line font-medium">
                {project.project_description || 'No overview provided.'}
              </p>
            </section>

            {/* Business Details */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Business Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {project.business_description || 'No additional business details provided.'}
              </p>
            </section>

            {/* Problem & Solution */}
            {(project.problem || project.solution) && (
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-8">
                {project.problem && (
                  <div>
                    <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3 text-red-600">?</span>
                      The Problem
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{project.problem}</p>
                  </div>
                )}
                {project.solution && (
                  <div>
                    <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 text-green-600">!</span>
                      Our Solution
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{project.solution}</p>
                  </div>
                )}
              </section>
            )}

          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Entrepreneur Profile */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">About the Entrepreneur</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100">
                  <img 
                    src={project.entrepreneur?.profile_photo_url || `https://ui-avatars.com/api/?name=${project.entrepreneur?.full_name || 'User'}&background=8A5F41&color=fff`} 
                    alt="Entrepreneur Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{project.entrepreneur?.full_name || 'Anonymous User'}</h4>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {project.entrepreneur?.city || ''}, {project.entrepreneur?.country || ''}
                  </p>
                </div>
              </div>
              {project.entrepreneur?.about && (
                <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
                  {project.entrepreneur.about}
                </p>
              )}
            </div>

            {/* Quick Investment Overview */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-2xl border border-primary/20">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-primary" />
                MaalHub Investment Protection
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                By investing in specific phase tranches, your funds align with verified startup progress and key deliverables.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Investment Proposal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gray-900">Request Investment</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <div className="p-6">
              {submitStatus.msg && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${submitStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {submitStatus.msg}
                </div>
              )}
              
              <form onSubmit={handleInvestmentSubmit} className="space-y-5">
                {/* Investment Target (Phase selection) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Investment Target (Tranche)
                  </label>
                  <select
                    value={selectedPhaseId}
                    onChange={(e) => {
                      const newPhaseId = e.target.value;
                      setSelectedPhaseId(newPhaseId);
                      const target = phases.find(p => p.id === newPhaseId);
                      if (target) {
                        const rem = Math.max(0, Number(target.target_amount) - Number(target.current_amount || 0));
                        if (rem > 0) setProposedAmount(rem.toString());
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm text-gray-800 bg-white"
                  >
                    <option value="">Whole Project (Overall Goal: ${project.funding_goal?.toLocaleString()})</option>
                    {phases.map((p) => {
                      const rem = Math.max(0, Number(p.target_amount) - Number(p.current_amount || 0));
                      return (
                        <option key={p.id} value={p.id}>
                          Phase {p.phase_number}: {p.title} (${p.target_amount?.toLocaleString()} - {p.status})
                        </option>
                      );
                    })}
                  </select>
                  
                  {selectedPhase && (
                    <div className="mt-2 p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-blue-900">
                      <strong>Phase {selectedPhase.phase_number}:</strong> {selectedPhase.title}
                      <div className="mt-1 text-blue-700">
                        Target: ${selectedPhase.target_amount?.toLocaleString()} • 
                        Raised: ${Number(selectedPhase.current_amount || 0).toLocaleString()} • 
                        Remaining: ${Math.max(0, Number(selectedPhase.target_amount) - Number(selectedPhase.current_amount || 0)).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Proposed Investment Amount (USD) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input 
                      type="number"
                      min="1"
                      required
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder="e.g. 10000"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Proposal Message *
                  </label>
                  <textarea 
                    rows={4}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    placeholder="Introduce yourself, propose your investment terms, and express interest in this phase..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || submitStatus.type === 'success'}
                    className="bg-primary hover:bg-secondary text-white px-6 py-2.5 text-sm rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Investment Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Update Progress Percentage Modal (Owner Only) */}
      {isProgressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Update Project Progress
              </h3>
              <button 
                onClick={() => setIsProgressModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl p-1 rounded-lg"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateProgressSubmit} className="p-6 space-y-5">
              {progressSuccessMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span>{progressSuccessMessage}</span>
                </div>
              )}

              {progressErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                  {progressErrorMessage}
                </div>
              )}

              {/* Current Progress & Stage Tag */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Project Development Progress</label>
                  <span className="text-xl font-black text-primary">{newProgress}%</span>
                </div>
                
                {/* Milestone Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    newProgress >= 100 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : newProgress >= 75 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : newProgress >= 50 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : newProgress >= 25 
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {newProgress >= 100 ? 'Completed & Scaling' : 
                     newProgress >= 75 ? 'Market Ready / Launching' : 
                     newProgress >= 50 ? 'MVP & Operational Testing' : 
                     newProgress >= 25 ? 'Prototype & Development' : 
                     'Concept & Planning'}
                  </span>
                </div>

                {/* Slider */}
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mb-3"
                />

                {/* Quick Presets */}
                <div className="flex items-center justify-between gap-1.5 mb-3">
                  {[0, 25, 50, 75, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewProgress(val)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                        Number(newProgress) === val 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>

                {/* Exact Value Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Exact %:</span>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                  <span className="text-sm font-bold text-gray-600">%</span>
                </div>
              </div>

              {/* Visual Live Preview */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <ProjectProgressBar progress={newProgress} size="md" />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsProgressModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUpdatingProgress}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 text-sm rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isUpdatingProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Progress Report Modal (Entrepreneur Owner only) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Post Progress Report
                </h3>
                <p className="text-xs text-gray-500 mt-1">Publish an official update visible to all investors.</p>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {reportError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {reportError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Report Title *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Q1 Progress: Product Prototype Complete"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportForm.report_type}
                    onChange={(e) => setReportForm({ ...reportForm, report_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="Progress">Progress Update</option>
                    <option value="Achievements">Key Achievements</option>
                    <option value="Financial">Financial / Tranche Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Investment Phase (Optional)
                  </label>
                  <select
                    value={reportForm.phase_id}
                    onChange={(e) => setReportForm({ ...reportForm, phase_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                  >
                    <option value="">General Project Update</option>
                    {phases.map((ph) => (
                      <option key={ph.id} value={ph.id}>
                        Phase {ph.phase_number}: {ph.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Executive Summary & Detailed Update *
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe your progress, developments, obstacles overcome, and general updates..."
                  value={reportForm.summary}
                  onChange={(e) => setReportForm({ ...reportForm, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Key Achievements
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Completed hardware testing, hired lead engineer, reached 500 waitlist signups..."
                  value={reportForm.key_achievements}
                  onChange={(e) => setReportForm({ ...reportForm, key_achievements: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Next Planned Steps
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Begin customer trials, prepare regulatory filing..."
                  value={reportForm.next_steps}
                  onChange={(e) => setReportForm({ ...reportForm, next_steps: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Update Completion Progress (%)
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder={project?.progress_percentage?.toString() || '0'}
                    value={reportForm.progress_percentage}
                    onChange={(e) => setReportForm({ ...reportForm, progress_percentage: e.target.value })}
                    className="w-24 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-bold text-center"
                  />
                  <span className="text-xs text-gray-500">
                    Optionally adjust the overall project progress percentage with this report.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingReport}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2.5 text-sm rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {isSubmittingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phase Completion Evidence ZIP Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/70">
              <div className="flex items-center gap-2.5">
                <FileArchive className="w-5 h-5 text-purple-700" />
                <h3 className="text-lg font-bold text-gray-900">Submit Phase Deliverables Evidence</h3>
              </div>
              <button 
                onClick={() => setIsEvidenceModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {evidenceError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200 font-medium">
                  {evidenceError}
                </div>
              )}

              <form onSubmit={handleEvidenceSubmit} className="space-y-5">
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <strong>Proof of Completion:</strong> Please upload a compressed archive file (e.g. <code>.zip</code>, <code>.rar</code>, <code>.7z</code>, or PDF report) containing work deliverables, code, receipts, or images confirming phase completion.
                </div>

                {/* ZIP File Upload Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Evidence File (ZIP / Deliverables Archive) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-purple-400 transition-colors bg-gray-50/50">
                    <FileArchive className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-xs font-bold text-purple-700 hover:underline block mb-1">
                        {evidenceFile ? evidenceFile.name : 'Choose Evidence ZIP File'}
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        Supports ZIP, RAR, 7Z, PDF, DOCX (Max 50MB)
                      </span>
                      <input 
                        type="file" 
                        accept=".zip,.rar,.7z,.tar.gz,.pdf,.docx"
                        onChange={(e) => setEvidenceFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Completion Summary */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Evidence Description & Completion Notes
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Describe what is contained in this ZIP evidence file (e.g. software build, architecture design, supplier receipts)..."
                    value={evidenceSummary}
                    onChange={(e) => setEvidenceSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setIsEvidenceModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingEvidence || !evidenceFile}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 text-sm rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingEvidence ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading Evidence...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload & Complete Phase</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
