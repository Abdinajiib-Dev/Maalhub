import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import ProjectReviewModal from '../../components/admin/ProjectReviewModal';
import { 
  FolderOpen, 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  ShieldCheck
} from 'lucide-react';

const ProjectsModeration = () => {
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
      setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
      if (inspectingProject && inspectingProject.id === projectId) {
        setInspectingProject({ ...inspectingProject, status: newStatus });
      }
    } catch (err) {
      alert(`Failed to update project status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) return;
    try {
      setUpdatingId(projectId);
      await api.deleteProjectAdmin(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      if (inspectingProject && inspectingProject.id === projectId) {
        setInspectingProject(null);
      }
    } catch (err) {
      alert(`Failed to delete project: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.industry || '').toLowerCase().includes(search.toLowerCase()) ||
                          (p.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = (p.status || 'Draft').toLowerCase() === 'draft' || (p.status || '').toLowerCase() === 'pending';
    } else if (statusFilter !== 'all') {
      matchesStatus = (p.status || '').toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = projects.filter(p => (p.status || 'Draft').toLowerCase() === 'draft' || (p.status || '').toLowerCase() === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="text-primary" size={28} />
            Project Moderation Console
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review requirements, approve, modify, or remove project listings across MaalHub.
          </p>
        </div>
        <button
          onClick={fetchProjects}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by project name, industry, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending', label: `Pending Review (${pendingCount})` },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Draft' },
            { id: 'paused', label: 'Paused' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-3"></div>
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No matching projects found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Entrepreneur</th>
                  <th className="py-3.5 px-6">Funding Goal</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProjects.map(project => {
                  const isPending = (project.status || 'Draft') !== 'Published';
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200/60">
                            {project.project_image_url ? (
                              <img src={project.project_image_url} alt={project.project_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400"><FolderOpen size={22} /></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{project.project_name}</p>
                            <p className="text-xs text-gray-500 truncate">{project.industry || 'General'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-800 text-xs truncate">{project.profiles?.full_name || 'N/A'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{project.profiles?.email || ''}</p>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 text-xs">
                        ${Number(project.funding_goal || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={project.status || 'Draft'}
                          disabled={updatingId === project.id}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                            project.status === 'Published' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            project.status === 'Paused' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Published">Published</option>
                          <option value="Draft">Draft (Pending)</option>
                          <option value="Paused">Paused</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setInspectingProject(project)}
                            className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold border border-primary/20 cursor-pointer"
                            title="Review Requirements & Approve"
                          >
                            <ShieldCheck size={15} />
                            <span>Inspect</span>
                          </button>

                          <Link
                            to={`/projects/${project.id}`}
                            className="p-1.5 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-gray-200"
                            title="View Details"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </Link>

                          <button
                            onClick={() => handleDeleteProject(project.id, project.project_name)}
                            disabled={updatingId === project.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
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

      {/* Project Review Inspector Modal */}
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
