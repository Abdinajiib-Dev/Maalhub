import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProjectReviewModal from '../../components/admin/ProjectReviewModal';
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  X,
  Layers,
  Sparkles,
  Building2
} from 'lucide-react';

import { useDialog } from '../../contexts/DialogContext';

const ProjectsModeration = () => {
  const { confirm, showAlert, toast } = useDialog();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [inspectingProject, setInspectingProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin projects:', err);
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      setUpdatingId(projectId);
      await api.updateProjectStatusAdmin(projectId, newStatus);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      if (inspectingProject && inspectingProject.id === projectId) {
        setInspectingProject(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Project status updated to ${newStatus}`);
    } catch (err) {
      showAlert({
        title: 'Status Update Failed',
        message: err.message || 'Failed to update project status',
        variant: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    const ok = await confirm({
      title: 'Delete Project Listing',
      message: `Are you sure you want to delete project "${projectName}"? This action cannot be undone.`,
      confirmText: 'Delete Project',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      setUpdatingId(projectId);
      await api.deleteProjectAdmin(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (inspectingProject && inspectingProject.id === projectId) {
        setInspectingProject(null);
      }
      toast.success(`Project "${projectName}" was deleted.`);
    } catch (err) {
      showAlert({
        title: 'Delete Project Failed',
        message: err.message || 'Failed to delete project',
        variant: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics counts
  const totalCount = projects.length;
  const pendingCount = projects.filter(p => {
    const s = (p.status || 'Draft').toLowerCase();
    return s === 'draft' || s === 'pending';
  }).length;
  const publishedCount = projects.filter(p => (p.status || '').toLowerCase() === 'published').length;
  const pausedOrOtherCount = projects.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'paused' || s === 'closed';
  }).length;

  const filteredProjects = projects.filter(p => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || 
      (p.project_name || '').toLowerCase().includes(query) ||
      (p.industry || '').toLowerCase().includes(query) ||
      (p.profiles?.full_name || '').toLowerCase().includes(query) ||
      (p.profiles?.email || '').toLowerCase().includes(query);

    let matchesStatus = true;
    if (statusFilter === 'pending') {
      const s = (p.status || 'Draft').toLowerCase();
      matchesStatus = s === 'draft' || s === 'pending';
    } else if (statusFilter !== 'all') {
      matchesStatus = (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeConfig = (status) => {
    const s = (status || 'Draft').toLowerCase();
    if (s === 'published') {
      return {
        label: 'Published',
        bg: 'bg-primary/10 text-primary border-primary/20',
        dot: 'bg-primary'
      };
    }
    if (s === 'paused') {
      return {
        label: 'Paused',
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400'
      };
    }
    if (s === 'closed') {
      return {
        label: 'Closed',
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400'
      };
    }
    // Draft or pending
    return {
      label: s === 'pending' ? 'Pending' : 'Draft',
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      dot: 'bg-stone-400'
    };
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Sleek Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 mb-1.5">
            <ShieldCheck size={12} />
            <span>Moderation Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Project Moderation
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
            Audit startup listings, verify requirements, and manage live visibility across MaalHub.
          </p>
        </div>

        <button
          onClick={fetchProjects}
          disabled={loading}
          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-primary' : 'text-gray-500'} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* 2. Interactive KPI Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: All Projects */}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">All Listings</span>
            <FolderKanban size={16} className={statusFilter === 'all' ? 'text-primary' : 'text-gray-400'} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{totalCount}</span>
            <span className="text-[11px] text-gray-400">Total in DB</span>
          </div>
        </button>

        {/* Card 2: Needs Review */}
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === 'pending'
              ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-300'
              : 'bg-white border-gray-200 hover:border-amber-200 hover:bg-amber-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Needs Review
            </span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-900">{pendingCount}</span>
            <span className="text-[11px] font-medium text-amber-700/80">Pending action</span>
          </div>
        </button>

        {/* Card 3: Published */}
        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'published'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-300'
              : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Live & Active</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-950">{publishedCount}</span>
            <span className="text-[11px] font-medium text-emerald-700/80">Investor visible</span>
          </div>
        </button>

        {/* Card 4: Drafts & Others */}
        <button
          type="button"
          onClick={() => setStatusFilter('draft')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'draft' || statusFilter === 'paused'
              ? 'bg-slate-100 border-slate-400 shadow-xs ring-1 ring-slate-300'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">Draft / Paused</span>
            <Layers size={16} className="text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{pausedOrOtherCount}</span>
            <span className="text-[11px] text-gray-500">Unpublished</span>
          </div>
        </button>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-3 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, industries, founders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All', count: totalCount },
            { id: 'pending', label: 'Needs Review', count: pendingCount, highlight: pendingCount > 0 },
            { id: 'published', label: 'Published', count: publishedCount },
            { id: 'draft', label: 'Draft', count: projects.filter(p => (p.status || 'Draft').toLowerCase() === 'draft').length },
            { id: 'paused', label: 'Paused', count: projects.filter(p => (p.status || '').toLowerCase() === 'paused').length },
          ].map(s => {
            const isActive = statusFilter === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-2xs'
                    : s.highlight
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                }`}
              >
                <span>{s.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : s.highlight
                    ? 'bg-amber-200/80 text-amber-900'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Streamlined Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-primary border-t-transparent mx-auto mb-2.5" />
            <p className="text-xs font-medium text-gray-600">Loading project submissions...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <FolderKanban size={22} />
            </div>
            <h4 className="text-sm font-bold text-gray-800 mb-1">No matching projects found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your search query or status filter to see other listings.'
                : 'There are currently no startup projects registered on the platform.'}
            </p>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Project Details</th>
                  <th className="py-3 px-4">Founder</th>
                  <th className="py-3 px-4">Funding Goal</th>
                  <th className="py-3 px-4">Status Control</th>
                  <th className="py-3 px-4 sm:px-5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredProjects.map(project => {
                  const statusConf = getStatusBadgeConfig(project.status);
                  const isUpdating = updatingId === project.id;
                  const isPending = (project.status || 'Draft').toLowerCase() === 'draft' || (project.status || '').toLowerCase() === 'pending';

                  return (
                    <tr 
                      key={project.id} 
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isPending ? 'bg-amber-50/15' : ''
                      }`}
                    >
                      {/* Project Column */}
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          {/* Compact Thumbnail (36x36) */}
                          <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200/70">
                            {project.project_image_url ? (
                              <img 
                                src={project.project_image_url} 
                                alt={project.project_name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-50">
                                <Building2 size={16} />
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0 max-w-[240px] sm:max-w-[320px]">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900 text-xs truncate">
                                {project.project_name}
                              </p>
                              {isPending && (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Awaiting Review" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                              <span className="truncate">{project.industry || 'General Industry'}</span>
                              <span>•</span>
                              <span>{project.startup_stage || 'Growth'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Founder Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {project.profiles?.full_name?.charAt(0).toUpperCase() || 'F'}
                          </div>
                          <div className="min-w-0 max-w-[150px]">
                            <p className="font-medium text-gray-800 text-xs truncate">
                              {project.profiles?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {project.profiles?.email || 'No email registered'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Funding Goal */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 text-xs">
                          ${Number(project.funding_goal || 0).toLocaleString()}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {project.location || 'Location unlisted'}
                        </div>
                      </td>

                      {/* Status Dropdown Pill */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={project.status || 'Draft'}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(project.id, e.target.value)}
                            className={`appearance-none pl-5 pr-6 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              statusConf.bg
                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft (Pending)</option>
                            <option value="Paused">Paused</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${statusConf.dot} pointer-events-none`} />
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4 sm:px-5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {/* Inspect / Review Button */}
                          <button
                            onClick={() => setInspectingProject(project)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                              isPending
                                ? 'bg-primary text-white hover:bg-secondary shadow-2xs ring-1 ring-primary/20'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20'
                            }`}
                            title="Inspect requirements & verify"
                          >
                            <ShieldCheck size={13} />
                            <span>Inspect</span>
                          </button>

                          {/* Quick Public View */}
                          <Link
                            to={`/projects/${project.id}`}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/70"
                            title="View Public Page"
                          >
                            <Eye size={13} />
                          </Link>

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDeleteProject(project.id, project.project_name)}
                            disabled={isUpdating}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer disabled:opacity-40"
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Inspection Modal */}
      {inspectingProject && (
        <ProjectReviewModal
          project={inspectingProject}
          onClose={() => setInspectingProject(null)}
          onUpdateStatus={handleStatusChange}
        />
      )}

    </div>
  );
};

export default ProjectsModeration;
