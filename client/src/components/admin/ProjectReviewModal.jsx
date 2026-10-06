import React, { useState } from 'react';
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
  XCircle
} from 'lucide-react';

const ProjectReviewModal = ({ project, onClose, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);

  if (!project) return null;

  // Requirements checklist validation logic
  const requirements = [
    {
      id: 'title',
      label: 'Project & Business Name',
      passed: Boolean(project.project_name && project.project_name.trim().length >= 3),
      detail: project.project_name || 'Missing project name'
    },
    {
      id: 'description',
      label: 'Comprehensive Description',
      passed: Boolean(project.project_description && project.project_description.trim().length >= 20),
      detail: project.project_description ? `${project.project_description.length} characters` : 'Description too short'
    },
    {
      id: 'funding',
      label: 'Funding Goal Defined',
      passed: Boolean(Number(project.funding_goal) > 0),
      detail: project.funding_goal ? `$${Number(project.funding_goal).toLocaleString()}` : 'Funding goal is $0'
    },
    {
      id: 'problem_solution',
      label: 'Problem & Solution Statement',
      passed: Boolean(project.problem || project.solution),
      detail: (project.problem && project.solution) ? 'Both provided' : (project.problem || project.solution) ? 'Partially provided' : 'Not provided'
    },
    {
      id: 'entrepreneur',
      label: 'Entrepreneur Identity',
      passed: Boolean(project.profiles?.full_name && project.profiles?.email),
      detail: project.profiles?.full_name ? `${project.profiles.full_name} (${project.profiles.email || 'No email'})` : 'Missing profile info'
    }
  ];

  const allPassed = requirements.every(r => r.passed);
  const passedCount = requirements.filter(r => r.passed).length;

  const handleApprove = async () => {
    try {
      setUpdating(true);
      await onUpdateStatus(project.id, 'Published');
      onClose();
    } catch (err) {
      alert(`Error approving project: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    try {
      setUpdating(true);
      // Update status to Draft (rejected / needs revision)
      await onUpdateStatus(project.id, 'Draft');
      onClose();
    } catch (err) {
      alert(`Error rejecting project: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{project.project_name}</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  project.status === 'Published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  project.status === 'Pending' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {project.status || 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin Requirements Review & Listing Verification Console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 flex-1">
          
          {/* Top Banner Status */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
            project.status === 'Published' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              {project.status === 'Published' ? (
                <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {project.status === 'Published' 
                    ? 'This project is Live & Published across MaalHub.' 
                    : 'Action Required: This project requires Admin inspection before publication.'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  {project.status === 'Published' 
                    ? 'Investors can view details and send investment requests.' 
                    : `Passed ${passedCount} of ${requirements.length} platform requirements checks.`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Project Overview */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Entrepreneur Identity Card */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/70 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <User size={15} className="text-primary" />
                  Entrepreneur Info
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-extrabold flex items-center justify-center border border-primary/20 text-base">
                    {project.profiles?.full_name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{project.profiles?.full_name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{project.profiles?.email || 'No email provided'}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {project.location || 'Location not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <DollarSign size={14} className="text-emerald-600" />
                    Funding Target
                  </p>
                  <p className="text-base font-extrabold text-gray-900">
                    ${Number(project.funding_goal || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Briefcase size={14} className="text-blue-600" />
                    Industry & Stage
                  </p>
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {project.industry || 'General'}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Stage: {project.startup_stage || 'Growth'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FileText size={15} className="text-primary" />
                  Project Overview
                </h4>
                <div className="bg-white rounded-xl p-4 border border-gray-200/80 text-xs text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                  {project.project_description || 'No description provided.'}
                </div>
              </div>

              {/* Problem & Solution */}
              {(project.problem || project.solution) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.problem && (
                    <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                      <p className="text-xs font-bold text-red-900 mb-1">Problem</p>
                      <p className="text-xs text-red-800 line-clamp-3">{project.problem}</p>
                    </div>
                  )}
                  {project.solution && (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-900 mb-1">Solution</p>
                      <p className="text-xs text-emerald-800 line-clamp-3">{project.solution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Automated Checklist & Actions */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Requirements Audit Checklist */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-primary" />
                    Requirements Audit
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {passedCount}/{requirements.length} Passed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                      {req.passed ? (
                        <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800">{req.label}</p>
                        <p className="text-[11px] text-slate-500 truncate">{req.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Box */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Admin Decision
                </h4>

                {project.status === 'Published' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                      ✓ This project is currently Published and active on the platform.
                    </div>
                    <button
                      onClick={() => onUpdateStatus(project.id, 'Draft')}
                      disabled={updating}
                      className="w-full py-2.5 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Unpublish & Return to Draft
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      disabled={updating}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {updating ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Check size={16} />
                          <span>Approve & Publish Project</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReject}
                      disabled={updating}
                      className="w-full py-2.5 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={15} />
                      <span>Keep as Draft (Needs Revision)</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectReviewModal;
