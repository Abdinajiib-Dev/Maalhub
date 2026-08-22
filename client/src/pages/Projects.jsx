import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Loader2, ArrowRight, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

  const handleMessageOwner = async (project) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const targetUserId = project.entrepreneur_id || project.entrepreneur?.id || 'user-abdinajiib-101';
    const targetUserName = project.entrepreneur?.full_name || project.business_name || 'Project Owner';
    
    try {
      await api.startConversation(targetUserId).catch(() => {});
    } catch (e) {}

    navigate('/messages', {
      state: {
        targetUserId,
        targetUserName
      }
    });
  };

  const filteredProjects = projects.filter(project => 
    project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Explore Investment Opportunities</h1>
          <p className="text-gray-500 text-base mb-6">
            Discover and connect with innovative startups looking for funding and mentorship.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-2xs"
              placeholder="Search by project name, company, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-5 rounded-xl text-center max-w-2xl mx-auto text-sm font-medium">
            <p>{error}</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No projects found</h3>
            <p className="text-gray-500 text-sm">We couldn't find any active projects matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-2xs hover:shadow-md transition-all border border-gray-200/80 overflow-hidden flex flex-col group hover:-translate-y-0.5">
                <div className="p-4 sm:p-5 flex-grow">
                  <div className="mb-2">
                    <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-semibold rounded-full mb-1.5">
                      {project.industry || 'Various'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {project.project_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{project.business_name}</p>
                  </div>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                    {project.project_description || 'No description provided for this project.'}
                  </p>

                  <div className="space-y-1.5 mb-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{project.location || 'Location unverified'}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                      Stage: <span className="font-medium text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/90 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Funding Goal</p>
                    <p className="text-base font-bold text-gray-900">
                      ${project.funding_goal?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleMessageOwner(project)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-secondary transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Send message to project owner"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Message
                    </button>
                    <Link 
                      to={`/projects/${project.id}`} 
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
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
