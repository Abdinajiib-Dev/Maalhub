import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Briefcase, Loader2, ArrowRight, Plus, Filter, Tag } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { PROJECT_CATEGORIES } from '../constants/categories';
import ProjectProgressBar from '../components/ProjectProgressBar';

const Projects = () => {
  const { user, profile } = useAuth();
  const isEntrepreneur = profile?.role === 'entrepreneur';
  const isInvestor = profile?.role === 'investor' || user?.user_metadata?.role === 'investor';

  // Investor preferred categories scope
  const targetIndustries = profile?.target_industries || user?.user_metadata?.target_industries || [];
  const hasAllCategories = !isInvestor || targetIndustries.length === 0 || targetIndustries.some(ind => ['all', 'any'].includes(String(ind).toLowerCase()));

  // Categories visible in filter UI
  const visibleCategories = hasAllCategories
    ? PROJECT_CATEGORIES
    : PROJECT_CATEGORIES.filter(cat =>
        targetIndustries.some(ind => ind.toLowerCase() === cat.name.toLowerCase())
      );

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

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

  // Sync state if URL query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Ensure investor cannot manually filter to a category outside their scope
  useEffect(() => {
    if (!hasAllCategories && targetIndustries.length > 0 && selectedCategory !== 'All') {
      const isAllowed = targetIndustries.some(ind => ind.toLowerCase() === selectedCategory.toLowerCase());
      if (!isAllowed) {
        setSelectedCategory('All');
        searchParams.delete('category');
        setSearchParams(searchParams);
      }
    }
  }, [hasAllCategories, targetIndustries, selectedCategory]);

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  const filteredProjects = projects.filter(project => {
    // 1. Strict category scoping for investors who chose specific categories
    if (!hasAllCategories && targetIndustries.length > 0) {
      const matchesTarget = targetIndustries.some(
        ind => ind.toLowerCase() === (project.industry || '').toLowerCase()
      );
      if (!matchesTarget) return false;
    }

    // 2. Search query match
    const matchesSearch = 
      project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.industry?.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Category selector match
    const matchesCategory = 
      selectedCategory === 'All' || 
      project.industry?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {isEntrepreneur ? "My Startup Projects" : "Explore Investment Opportunities"}
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            {isEntrepreneur 
              ? "View and manage your created startup projects across Agriculture, Business, Hospitality & Tourism, and Education." 
              : "Discover and connect with innovative startups looking for funding in key development sectors."}
          </p>

          {isInvestor && !hasAllCategories && targetIndustries.length > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Personalized feed: Showing projects in <strong>{targetIndustries.join(', ')}</strong>
              </span>
            </div>
          )}

          {isEntrepreneur && (
            <div className="mb-8">
              <Link 
                to="/entrepreneur/create-project" 
                className="inline-flex items-center bg-primary hover:bg-secondary text-white px-6 py-3 rounded-full font-bold shadow-sm transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Project
              </Link>
            </div>
          )}

          {/* Search & Category Filter Controls */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                placeholder={isEntrepreneur ? "Search your projects..." : "Search by project title, business name, or keywords..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Select Dropdown Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto text-sm text-gray-600 font-medium">
                <Filter className="w-4 h-4 text-primary" />
                <span>Filter by Category:</span>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm cursor-pointer"
              >
                <option value="All">
                  {hasAllCategories ? "All Categories" : `All Selected (${targetIndustries.join(', ')})`}
                </option>
                {visibleCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Interactive Category Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedCategory === 'All'
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {hasAllCategories ? "All Projects" : "All Selected"}
              </button>
              {visibleCategories.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isSelected
                        ? `${cat.badgeBg} shadow-sm border-current`
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
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
            <p className="text-gray-500 mb-4">
              {selectedCategory !== 'All' 
                ? `There are currently no active projects listed under ${selectedCategory}.` 
                : !hasAllCategories && targetIndustries.length > 0
                ? `There are currently no active projects matching your selected categories (${targetIndustries.join(', ')}).`
                : "We couldn't find any active projects matching your search criteria."}
            </p>
            {selectedCategory !== 'All' && (
              <button 
                onClick={() => handleCategoryChange('All')} 
                className="text-primary hover:underline text-sm font-semibold"
              >
                Clear category filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const catObj = PROJECT_CATEGORIES.find(c => c.name.toLowerCase() === (project.industry || '').toLowerCase());
              const IconComp = catObj ? catObj.icon : Tag;
              const badgeStyle = catObj ? catObj.badgeBg : 'bg-primary/10 text-primary border-primary/20';

              return (
                <div key={project.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden flex flex-col group">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border mb-3 ${badgeStyle}`}>
                          <IconComp className="w-3.5 h-3.5" />
                          {project.industry || 'General Business'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                          {project.project_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{project.business_name}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {project.project_description || 'No description provided for this project.'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {project.location || 'Location unverified'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        Stage: <span className="font-medium text-gray-900 ml-1">{project.startup_stage || 'Idea'}</span>
                      </div>
                    </div>

                    {/* Progress Bar Display */}
                    <div className="pt-2 border-t border-gray-100">
                      <ProjectProgressBar progress={project.progress_percentage || 0} size="sm" />
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
