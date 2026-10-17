import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Loader2, Trash2, Layers, TrendingUp, CheckCircle2, Edit } from 'lucide-react';
import { api } from '../../lib/api';
import ProjectProgressBar from '../../components/ProjectProgressBar';
import { useDialog } from '../../contexts/DialogContext';

const MyProjects = () => {
  const { confirm, showAlert, toast } = useDialog();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage the projects you have published to investors.</p>
        </div>
        <Link 
          to="/entrepreneur/create-project" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center shadow-sm text-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Project
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading your projects...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't created any projects. Start by creating a project to showcase your startup to potential investors.</p>
          <Link 
            to="/entrepreneur/create-project" 
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col relative">
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  project.status === 'Published' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {project.status || 'Draft'}
                </span>
              </div>

              <div className="p-6 flex-grow pt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                  {project.project_name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{project.business_name}</p>
                
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {project.project_description || 'No description provided.'}
                </p>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs">Funding Goal</span>
                    <span className="font-semibold text-gray-900">${project.funding_goal?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Stage</span>
                    <span className="font-semibold text-gray-900">{project.startup_stage || 'Idea'}</span>
                  </div>
                </div>

                {/* Development Progress Bar */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <ProjectProgressBar progress={project.progress_percentage || 0} size="sm" />
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-between items-center">
                <Link to={`/projects/${project.id}`} className="text-sm font-bold text-primary hover:text-secondary transition-colors px-2 py-1.5 rounded-md hover:bg-primary/5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  View & Manage Phases
                </Link>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openProgressModal(project)}
                    className="text-xs font-semibold text-primary hover:text-secondary bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Quickly update progress"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Progress
                  </button>
                  <Link
                    to={`/entrepreneur/edit-project/${project.id}`}
                    className="text-xs font-semibold text-gray-700 hover:text-primary bg-white border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    title="Edit project details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Delete Project">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
