import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => 
    project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Investment Opportunities</h1>
          <p className="text-gray-500 text-lg mb-8">
            Discover and connect with innovative startups looking for funding and mentorship.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
              placeholder="Search by project name, company, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center max-w-2xl mx-auto">
            <p className="font-medium">{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">We couldn't find any active projects matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden flex flex-col group">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                        {project.industry || 'Various'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {project.project_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{project.business_name}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {project.project_description || 'No description provided for this project.'}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {project.location || 'Location unverified'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                      Stage: <span className="font-medium text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Funding Goal</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${project.funding_goal?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="flex items-center text-primary font-medium text-sm hover:underline"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
