import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  DollarSign, 
  Briefcase, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Check, 
  XCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useDialog } from '../../contexts/DialogContext';

const ProjectReviewModal = ({ project, onClose, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);
  const { showAlert } = useDialog();

  if (!project) return null;

  // Requirements checklist validation logic
  const requirements = [
    {
      id: 'title',
      label: 'Business & Project Name',
      passed: Boolean(project.project_name && project.project_name.trim().length >= 3),
      detail: project.project_name || 'Missing project name'
    },
    {
      id: 'description',
      label: 'Project Pitch & Description',
      passed: Boolean(project.project_description && project.project_description.trim().length >= 20),
      detail: project.project_description ? `${project.project_description.length} chars` : 'Too short (<20 chars)'
    },
    {
      id: 'funding',
      label: 'Target Funding Goal Defined',
      passed: Boolean(Number(project.funding_goal) > 0),
      detail: project.funding_goal ? `$${Number(project.funding_goal).toLocaleString()}` : '$0 specified'
    },
    {
      id: 'problem_solution',
      label: 'Problem & Solution Definition',
      passed: Boolean(project.problem || project.solution),
      detail: (project.problem && project.solution) ? 'Both provided' : (project.problem || project.solution) ? 'Partially provided' : 'Not provided'
    },
    {
      id: 'entrepreneur',
      label: 'Founder Profile Verification',
      passed: Boolean(project.profiles?.full_name && project.profiles?.email),
      detail: project.profiles?.full_name ? `${project.profiles.full_name}` : 'Missing founder profile'
    }
  ];

  const allPassed = requirements.every(r => r.passed);
  const passedCount = requirements.filter(r => r.passed).length;
  const isPublished = (project.status || '').toLowerCase() === 'published';

  const handleApprove = async () => {
    try {
      setUpdating(true);
      await onUpdateStatus(project.id, 'Published');
      onClose();
    } catch (err) {
      showAlert({
        title: 'Approval Error',
        message: err.message || 'Error approving project',
        variant: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdating(true);
      await onUpdateStatus(project.id, 'Draft');
      onClose();
    } catch (err) {
      showAlert({
        title: 'Status Update Error',
        message: err.message || 'Error moving project to draft',
        variant: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Compact Clean Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900 truncate max-w-[280px] sm:max-w-md">
                  {project.project_name}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isPublished 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {project.status || 'Draft'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                {project.industry || 'General Industry'} • Stage: {project.startup_stage || 'Growth'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Audit Status Bar */}
        <div className={`px-5 py-2.5 border-b text-xs flex items-center justify-between ${
          allPassed 
            ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900' 
            : 'bg-amber-50/80 border-amber-100 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {allPassed ? (
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            )}
            <span className="font-semibold text-xs">
              {allPassed 
                ? 'Passed all platform publication criteria' 
                : `${passedCount} of ${requirements.length} requirements met`}
            </span>
          </div>

          <span className="text-[11px] font-medium opacity-80">
            {isPublished ? 'Live on Platform' : 'Awaiting Approval'}
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-gray-700 flex-1 scrollbar-thin">
          
          {/* Founder & Financial Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Founder Card */}
            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-primary" />
                Entrepreneur
              </span>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs border border-primary/20 flex-shrink-0">
                  {project.profiles?.full_name?.charAt(0) || 'E'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{project.profiles?.full_name || 'N/A'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{project.profiles?.email || 'No email'}</p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {project.location || 'Location unlisted'}
                  </p>
                </div>
              </div>
            </div>

            {/* Funding Goal & Stage Card */}
            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <DollarSign size={12} className="text-emerald-600" />
                Capital & Stage
              </span>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <p className="text-[10px] text-gray-400">Target Funding</p>
                  <p className="text-sm font-extrabold text-gray-900">
                    ${Number(project.funding_goal || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Business Stage</p>
                  <p className="text-xs font-bold text-gray-800">
                    {project.startup_stage || 'Growth'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Pitch Description */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} className="text-primary" />
              Project Pitch
            </span>
            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 text-gray-700 leading-relaxed text-xs max-h-28 overflow-y-auto">
              {project.project_description || 'No pitch description provided.'}
            </div>
          </div>

          {/* Problem & Solution (if available) */}
          {(project.problem || project.solution) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.problem && (
                <div className="bg-red-50/40 rounded-xl p-2.5 border border-red-100/70">
                  <p className="text-[10px] font-bold text-red-900 mb-0.5 uppercase tracking-wider">Problem Statement</p>
                  <p className="text-xs text-red-900/80 line-clamp-2">{project.problem}</p>
                </div>
              )}
              {project.solution && (
                <div className="bg-emerald-50/40 rounded-xl p-2.5 border border-emerald-100/70">
                  <p className="text-[10px] font-bold text-emerald-900 mb-0.5 uppercase tracking-wider">Solution Approach</p>
                  <p className="text-xs text-emerald-900/80 line-clamp-2">{project.solution}</p>
                </div>
              )}
            </div>
          )}

          {/* Requirements Audit Checklist */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-primary" />
                Platform Requirements Audit
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                {passedCount}/{requirements.length} Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {requirements.map((req) => (
                <div 
                  key={req.id} 
                  className={`flex items-start gap-2 p-2 rounded-lg border text-xs transition-colors ${
                    req.passed 
                      ? 'bg-emerald-50/30 border-emerald-100' 
                      : 'bg-amber-50/30 border-amber-100'
                  }`}
                >
                  {req.passed ? (
                    <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-[11px]">{req.label}</p>
                    <p className="text-[10px] text-gray-500 truncate">{req.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Decision Action Banner */}
          <div className="pt-2 border-t border-gray-100">
            {isPublished ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-emerald-900">Project is Currently Live & Public</p>
                  <p className="text-[11px] text-emerald-700">Investors can browse and invest in this startup.</p>
                </div>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={updating}
                  className="w-full sm:w-auto px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Unpublish to Draft'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200/80 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-900">Moderation Verification Action</p>
                  <p className="text-[11px] text-gray-500">Approve to make instantly visible to all platform investors.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={updating}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Keep as Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={updating}
                    className="flex-1 sm:flex-none px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Approve & Publish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
          <Link
            to={`/projects/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            <span>Open public project page</span>
            <ExternalLink size={12} />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectReviewModal;
