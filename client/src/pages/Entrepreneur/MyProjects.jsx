import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Briefcase, 
  Loader2, 
  Trash2, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Edit, 
  Play, 
  Pause, 
  Sparkles,
  ExternalLink,
  DollarSign,
  Tag
} from 'lucide-react';
import { api } from '../../lib/api';
import ProjectProgressBar from '../../components/ProjectProgressBar';
import { useDialog } from '../../contexts/DialogContext';
import { useAuth } from '../../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../../constants/categories';

const MyProjects = () => {
  const { user, profile } = useAuth();
  const { confirm, showAlert, toast } = useDialog();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusActionId, setStatusActionId] = useState(null);

  // Quick progress update modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProgress, setNewProgress] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressSuccessMessage, setProgressSuccessMessage] = useState('');
  const [progressErrorMessage, setProgressErrorMessage] = useState('');

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  // Workspace Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const published = projects.filter(p => p.status === 'Published').length;
    const paused = projects.filter(p => p.status === 'Paused' || p.status === 'Draft' || !p.status).length;
    const totalFunding = projects.reduce((sum, p) => sum + (Number(p.funding_goal) || 0), 0);
    return { total, published, paused, totalFunding };
  }, [projects]);

  // Publish / Pause Toggle Handler
  const handleToggleStatus = async (project, targetStatus) => {
    const isPublishing = targetStatus === 'Published';
    const ok = await confirm({
      title: isPublishing ? 'Publish Venture' : 'Pause Venture Listing',
      message: isPublishing
        ? `Are you sure you want to publish "${project.project_name}"? It will become visible on the public discovery feed for all registered investors.`
        : `Are you sure you want to pause "${project.project_name}"? It will be temporarily hidden from investor discovery.`,
      confirmText: isPublishing ? 'Publish Listing' : 'Pause Listing',
      variant: isPublishing ? 'primary' : 'warning'
    });

    if (!ok) return;

    try {
      setStatusActionId(project.id);
      const res = await api.updateProject(project.id, { status: targetStatus });
      setProjects(prev =>
        prev.map(p =>
          p.id === project.id
            ? { ...p, ...(res || {}), status: targetStatus }
            : p
        )
      );
      toast.success(
        isPublishing
          ? 'Project published! It is now live in the investor discovery feed.'
          : 'Project listing paused.'
      );
    } catch (err) {
      showAlert({
        title: 'Status Update Failed',
        message: err.message || 'Failed to update project status',
        variant: 'error'
      });
    } finally {
      setStatusActionId(null);
    }
  };

  const openProgressModal = (project) => {
    setSelectedProject(project);
    setNewProgress(project.progress_percentage ?? 0);
    setProgressSuccessMessage('');
    setProgressErrorMessage('');
  };

  const closeProgressModal = () => {
    setSelectedProject(null);
    setProgressSuccessMessage('');
    setProgressErrorMessage('');
  };

  const handleUpdateProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsUpdatingProgress(true);
    setProgressErrorMessage('');
    setProgressSuccessMessage('');

    try {
      const updatedVal = Math.min(100, Math.max(0, parseInt(newProgress, 10) || 0));
      const res = await api.updateProject(selectedProject.id, {
        progress_percentage: updatedVal,
        current_progress: `${updatedVal}%`
      });

      setProjects(prev =>
        prev.map(p =>
          p.id === selectedProject.id
            ? { ...p, ...(res || {}), progress_percentage: updatedVal, current_progress: `${updatedVal}%` }
            : p
        )
      );

      setProgressSuccessMessage(`Updated to ${updatedVal}%!`);
      setTimeout(() => {
        closeProgressModal();
      }, 700);
    } catch (err) {
      setProgressErrorMessage(err.message || 'Failed to update progress');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete Project',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      await api.deleteProject(id);
      toast.success('Project deleted successfully.');
      fetchMyProjects();
    } catch (err) {
      showAlert({
        title: 'Delete Failed',
        message: err.message || 'Failed to delete project',
        variant: 'error'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* Workspace Header & Action */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              Venture Management Workstation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Ventures & Projects
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Manage your business profile, control listing visibility (publish or pause), update milestone tranches, and engage with interested investors.
            </p>
          </div>

          <Link 
            to="/entrepreneur/create-project" 
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm text-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </Link>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3 sm:p-4 text-center">
            <span className="block text-xl sm:text-2xl font-black text-gray-900">{metrics.total}</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Ventures</span>
          </div>

          <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3 sm:p-4 text-center">
            <span className="block text-xl sm:text-2xl font-black text-emerald-700">{metrics.published}</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live & Published</span>
          </div>

          <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3 sm:p-4 text-center">
            <span className="block text-xl sm:text-2xl font-black text-gray-700">{metrics.paused}</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Paused / Draft</span>
          </div>

          <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl p-3 sm:p-4 text-center">
            <span className="block text-xl sm:text-2xl font-black text-primary">${metrics.totalFunding.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Target Capital</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-medium text-sm">Loading your ventures...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
          <p className="text-red-700 font-medium text-sm">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-2xl border border-gray-100 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No projects created yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Get started by creating your startup project profile to showcase your business to verified investors.
          </p>
          <Link 
            to="/entrepreneur/create-project" 
            className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isPublished = project.status === 'Published';
            const isUpdatingThisStatus = statusActionId === project.id;
            const progress = Number(project.progress_percentage || 0);

            const catObj = PROJECT_CATEGORIES.find(c => c.name.toLowerCase() === (project.industry || '').trim().toLowerCase());
            const IconComp = catObj ? catObj.icon : Tag;
            const badgeStyle = catObj ? catObj.badgeBg : 'bg-primary/10 text-primary border-primary/20';
            const projectImageUrl = project.project_image_url || catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

            const entrepreneurName = project.entrepreneur?.full_name || profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User';
            const entrepreneurAvatar = project.entrepreneur?.profile_photo_url || profile?.profile_photo_url || user?.user_metadata?.profile_photo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneurName || project.business_name || 'User')}&background=8A5F41&color=fff`;

            return (
              <div 
                key={project.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Project Type Image Banner (Matching Image 2) */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <img 
                      src={projectImageUrl} 
                      alt={project.project_name || project.industry} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Category Badge (Top-Left) */}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-md bg-white/90 text-primary border-primary/20 dark:bg-slate-900/90 dark:text-amber-200 dark:border-amber-800/40`}>
                      <IconComp className="w-3.5 h-3.5" />
                      {project.industry || 'General Business'}
                    </span>

                    {/* Status Badge (Top-Right) */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm backdrop-blur-md ${
                      isPublished 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/50' 
                        : 'bg-black/60 text-white border-white/20'
                    }`}>
                      {project.status || 'Draft'}
                    </span>
                  </div>

                  <div className="p-5">
                    {/* Project Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {project.project_name}
                    </h3>

                    {/* User Profile Row: Avatar + Name + Business (Matching Image 2) */}
                    <div className="flex items-center gap-2 mb-3">
                      <img 
                        src={entrepreneurAvatar}
                        alt={entrepreneurName} 
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneurName || project.business_name || 'User')}&background=8A5F41&color=fff`;
                        }}
                      />
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200 truncate">
                        {entrepreneurName}
                      </span>
                      {project.business_name && project.business_name.trim() !== entrepreneurName.trim() && (
                        <span className="text-xs text-gray-400 dark:text-slate-400 truncate">
                          • {project.business_name}
                        </span>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed mb-4">
                      {project.project_description || 'No description provided.'}
                    </p>

                    {/* Metrics: Funding Goal & Startup Stage */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700 text-xs mb-3">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Funding Goal</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">${Number(project.funding_goal || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">Startup Stage</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{project.startup_stage || 'Idea'}</span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400">Milestone Progress</span>
                        <span className="font-bold text-primary dark:text-primary-light">{progress}%</span>
                      </div>
                      <ProjectProgressBar progress={progress} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700/80 p-3 px-4 flex flex-col gap-2.5">
                  {/* Top action row */}
                  <div className="flex items-center justify-between gap-2">
                    <Link 
                      to={`/projects/${project.id}`} 
                      className="text-xs font-bold text-primary hover:text-secondary dark:text-primary-light transition-colors flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Phases & Pitch
                    </Link>

                    {/* Publish / Pause Toggle Button */}
                    <button
                      type="button"
                      disabled={isUpdatingThisStatus}
                      onClick={() => handleToggleStatus(project, isPublished ? 'Paused' : 'Published')}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 border ${
                        isPublished
                          ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                      title={isPublished ? "Pause listing" : "Publish listing to investors"}
                    >
                      {isUpdatingThisStatus ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPublished ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Publish
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary management buttons */}
                  <div className="flex items-center justify-end space-x-1.5 pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => openProgressModal(project)}
                      className="text-xs font-semibold text-primary hover:text-secondary dark:text-primary-light bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Quickly update progress"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Progress
                    </button>
                    <Link
                      to={`/entrepreneur/edit-project/${project.id}`}
                      className="text-xs font-semibold text-gray-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      title="Edit project details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)} 
                      className="p-1.5 text-gray-400 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer" 
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Progress Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Update Project Progress
                </h3>
                <p className="text-xs text-gray-500 truncate max-w-xs">{selectedProject.project_name}</p>
              </div>
              <button 
                onClick={closeProgressModal} 
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">Completion Percentage</label>
                  <span className="text-xl font-black text-primary">{newProgress}%</span>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {newProgress >= 100 ? 'Completed & Scaling' : 
                     newProgress >= 75 ? 'Market Ready / Launching' : 
                     newProgress >= 50 ? 'MVP & Operational Testing' : 
                     newProgress >= 25 ? 'Prototype & Development' : 
                     'Concept & Planning'}
                  </span>
                </div>

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
                  onClick={closeProgressModal}
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
    </div>
  );
};

export default MyProjects;
