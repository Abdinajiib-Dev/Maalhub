import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getMyProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message || 'Failed to load your projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        await api.deleteProject(id);
        fetchMyProjects();
      } catch (err) {
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">Manage the projects you have published to investors.</p>
        </div>
        <Link 
          to="/entrepreneur/create-project" 
          className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-sm"
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
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-between items-center">
                <Link to={`/projects/${project.id}`} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                  View Public Page
                </Link>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Project">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
