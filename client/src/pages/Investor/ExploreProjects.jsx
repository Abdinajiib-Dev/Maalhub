import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowRight, Loader2, Trash2, Tag } from 'lucide-react';
import { api } from '../../lib/api';
import { useDialog } from '../../contexts/DialogContext';
import { PROJECT_CATEGORIES } from '../../constants/categories';

const ExploreProjects = () => {
  const { confirm, showAlert, toast } = useDialog();
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedProjects();
      setSavedProjects(Array.isArray(data) ? data.filter(s => s && s.project) : []);
    } catch (err) {
      setError(err.message || 'Failed to load saved projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedProjects();
  }, []);

  const handleUnsave = async (projectId) => {
    const ok = await confirm({
      title: 'Remove Saved Project',
      message: 'Remove this project from your saved list?',
      confirmText: 'Remove',
      variant: 'warning'
    });
    if (!ok) return;

    try {
      await api.unsaveProject(projectId);
      toast.success('Project removed from saved list.');
      fetchSavedProjects();
    } catch (err) {
      showAlert({
        title: 'Error Removing Project',
        message: err.message || 'Error removing saved project',
        variant: 'error'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Bookmark className="text-primary" size={28} />
            Saved Watchlist
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
            Manage your watchlist of curated investment opportunities.
          </p>
        </div>
        <Link 
          to="/investor/projects" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-xs text-center text-sm"
        >
          Discover New Projects
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Loading your saved projects...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-4 rounded-xl">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      ) : savedProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 sm:p-16 rounded-2xl border border-gray-100 dark:border-slate-800 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-700">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
            You haven't saved any projects yet. Browse the project feed and bookmark projects that catch your eye to review them later.
          </p>
          <Link 
            to="/investor/projects" 
            className="inline-flex items-center gap-1.5 text-primary hover:text-secondary font-bold text-sm hover:underline"
          >
            Start exploring projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProjects.map((item) => {
            const project = item.project || {};
            const catObj = PROJECT_CATEGORIES.find(
              c => c.name.toLowerCase() === (project.industry || '').trim().toLowerCase()
            );
            const IconComp = catObj ? catObj.icon : Tag;
            const projectImageUrl = project.project_image_url || catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

            const entrepreneurName = project.entrepreneur?.full_name || 'Anonymous User';
            const entrepreneurAvatar = project.entrepreneur?.profile_photo_url || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneurName || project.business_name || 'User')}&background=8A5F41&color=fff`;

            return (
              <div 
                key={item.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner (Matching Image 2) */}
                  <div className="h-48 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                    <img 
                      src={projectImageUrl} 
                      alt={project.project_name || 'Project'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Category Badge (Top-Left) */}
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-md bg-white/90 text-primary border-primary/20 dark:bg-slate-900/90 dark:text-amber-200 dark:border-amber-800/40">
                      <IconComp className="w-3.5 h-3.5" />
                      {project.industry || 'General Business'}
                    </span>

                    {/* Remove Action Button (Top-Right) */}
                    <button 
                      onClick={() => handleUnsave(item.project_id)} 
                      className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-gray-700 dark:text-slate-200 rounded-xl backdrop-blur-md shadow-xs transition-colors cursor-pointer" 
                      title="Remove from saved watchlist"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card Body (Matching Image 2) */}
                  <div className="p-5">
                    {/* Project Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {project.project_name}
                    </h3>

                    {/* User Profile and Business Name */}
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
                    <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed">
                      {project.project_description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Footer (Matching Image 2) */}
                <div className="bg-gray-50 dark:bg-slate-800/80 px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Funding Goal</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${Number(project.funding_goal || 0).toLocaleString()}
                    </p>
                  </div>
                  <Link 
                    to={`/projects/${item.project_id}`} 
                    className="flex items-center text-primary dark:text-amber-400 font-semibold text-sm hover:underline"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExploreProjects;

