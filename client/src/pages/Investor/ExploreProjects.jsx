import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, FolderOpen, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

const ExploreProjects = () => {
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedProjects();
      setSavedProjects(data || []);
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
    if (!window.confirm('Remove this project from your saved list?')) return;
    try {
      await api.unsaveProject(projectId);
      fetchSavedProjects();
    } catch (err) {
      alert(`Error removing project: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="text-primary" size={28} />
            Saved Projects
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your watchlist of interesting investment opportunities.</p>
        </div>
        <Link 
          to="/projects" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center shadow-sm text-center"
        >
          Discover New Projects
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Loading your saved projects...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      ) : savedProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't saved any projects yet. Browse the project feed and save projects that catch your eye to review them later.</p>
          <Link 
            to="/projects" 
            className="inline-flex items-center text-primary font-medium hover:underline"
          >
            Start exploring projects
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProjects.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col relative group">
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {item.project.project_image_url ? (
                  <img src={item.project.project_image_url} alt={item.project.project_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#FAF9F6]"><FolderOpen size={40}/></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full mb-2">
                    {item.project.industry || 'Various'}
                  </span>
                  <h3 className="text-lg font-bold text-white line-clamp-1">
                    {item.project.project_name}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-grow">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.project.project_description || 'No description provided.'}
                </p>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="block text-gray-500 text-[11px] uppercase tracking-wider">Funding Goal</span>
                    <span className="font-semibold text-gray-900">${item.project.funding_goal?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 text-[11px] uppercase tracking-wider">Saved On</span>
                    <span className="font-semibold text-gray-900">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-between items-center">
                <Link to={`/projects/${item.project_id}`} className="text-sm font-medium text-primary hover:text-secondary transition-colors px-3 py-1.5 rounded-md hover:bg-primary/5">
                  View Details
                </Link>
                <button 
                  onClick={() => handleUnsave(item.project_id)} 
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2 text-xs font-medium" 
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreProjects;
