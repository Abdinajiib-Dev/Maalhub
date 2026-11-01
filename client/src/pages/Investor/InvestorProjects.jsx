import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Bookmark, 
  Briefcase, 
  Loader2, 
  ArrowRight, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  SlidersHorizontal,
  BookmarkCheck,
  Tag
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDialog } from '../../contexts/DialogContext';
import { PROJECT_CATEGORIES } from '../../constants/categories';
import ProjectProgressBar from '../../components/ProjectProgressBar';

const InvestorProjects = () => {
  const { user, profile } = useAuth();
  const { showAlert, toast } = useDialog();
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [savedProjectIds, setSavedProjectIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'goal-desc' | 'goal-asc' | 'progress-desc'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // 'all' | 'saved'

  // Investor industry scope preferences
  const targetIndustries = useMemo(() => {
    return profile?.target_industries || user?.user_metadata?.target_industries || [];
  }, [profile, user]);

  const hasAllCategories = useMemo(() => {
    if (!targetIndustries || targetIndustries.length === 0) return true;
    return targetIndustries.some(ind => ['all', 'any'].includes(String(ind).toLowerCase()));
  }, [targetIndustries]);

  // Categories visible in filter UI
  const visibleCategories = useMemo(() => {
    if (hasAllCategories) return PROJECT_CATEGORIES;
    return PROJECT_CATEGORIES.filter(cat =>
      targetIndustries.some(ind => ind.toLowerCase() === cat.name.toLowerCase())
    );
  }, [hasAllCategories, targetIndustries]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [projectsData, savedData] = await Promise.all([
        api.getProjects(),
        api.getSavedProjects().catch(() => [])
      ]);

      setProjects(Array.isArray(projectsData) ? projectsData : []);

      const savedIds = new Set();
      if (Array.isArray(savedData)) {
        savedData.forEach(item => {
          if (item?.project_id) savedIds.add(item.project_id);
          else if (item?.project?.id) savedIds.add(item.project.id);
        });
      }
      setSavedProjectIds(savedIds);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync category with URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const tab = searchParams.get('tab');
    if (tab && (tab === 'all' || tab === 'saved')) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'all') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tabName);
    }
    setSearchParams(searchParams);
  };

  const handleToggleSave = async (projectId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (savingId === projectId) return;

    const isCurrentlySaved = savedProjectIds.has(projectId);
    setSavingId(projectId);

    // Optimistic state update
    setSavedProjectIds(prev => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });

    try {
      if (isCurrentlySaved) {
        await api.unsaveProject(projectId);
        toast.success('Project removed from your saved watchlist.');
      } else {
        await api.saveProject(projectId);
        toast.success('Project added to your saved watchlist.');
      }
    } catch (err) {
      // Revert on failure
      setSavedProjectIds(prev => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.add(projectId);
        } else {
          next.delete(projectId);
        }
        return next;
      });
      showAlert({
        title: 'Watchlist Error',
        message: err.message || 'Failed to update watchlist',
        variant: 'error'
      });
    } finally {
      setSavingId(null);
    }
  };

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter(project => {
        // Only active/published projects in discovery feed
        if (project.status && project.status !== 'Published') {
          return false;
        }

        // Saved tab filter
        if (activeTab === 'saved' && !savedProjectIds.has(project.id)) {
          return false;
        }

        // Strict category scoping if investor has chosen specific industries
        if (!hasAllCategories && targetIndustries.length > 0) {
          const matchesTarget = targetIndustries.some(
            ind => ind.toLowerCase() === (project.industry || '').toLowerCase()
          );
          if (!matchesTarget) return false;
        }

        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesSearch =
            project.project_name?.toLowerCase().includes(q) ||
            project.business_name?.toLowerCase().includes(q) ||
            project.industry?.toLowerCase().includes(q) ||
            project.project_description?.toLowerCase().includes(q);
          if (!matchesSearch) return false;
        }

        // Category filter
        if (selectedCategory !== 'All') {
          if (project.industry?.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'goal-desc') {
          return (Number(b.funding_goal) || 0) - (Number(a.funding_goal) || 0);
        }
        if (sortBy === 'goal-asc') {
          return (Number(a.funding_goal) || 0) - (Number(b.funding_goal) || 0);
        }
        if (sortBy === 'progress-desc') {
          return (Number(b.progress_percentage) || 0) - (Number(a.progress_percentage) || 0);
        }
        // Default: newest first
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [projects, savedProjectIds, activeTab, hasAllCategories, targetIndustries, searchTerm, selectedCategory, sortBy]);

  const savedCount = savedProjectIds.size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={13} />
              Venture Discovery Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Explore Investment Opportunities
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Discover verified high-impact Somali startups, evaluate milestone tranches, and connect directly with founders to fund scalable ventures.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-[#FAF9F6] border border-gray-200/70 rounded-xl px-4 py-3 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-gray-900">
                {projects.filter(p => !p.status || p.status === 'Published').length}
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Live Ventures
              </span>
            </div>

            <button
              onClick={() => handleTabChange(activeTab === 'saved' ? 'all' : 'saved')}
              className={`rounded-xl px-4 py-3 text-center min-w-[100px] border transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-[#FAF9F6] border-gray-200/70 text-gray-900 hover:border-primary/40'
              }`}
            >
              <span className="block text-2xl font-black">
                {savedCount}
              </span>
              <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 ${
                activeTab === 'saved' ? 'text-white/90' : 'text-gray-500'
              }`}>
                <Bookmark size={11} className={activeTab === 'saved' ? 'fill-current' : ''} />
                Watchlist
              </span>
            </button>
          </div>
        </div>

        {/* Personalized Industry Scope Banner */}
        {!hasAllCategories && targetIndustries.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>
                Personalized Portfolio Scope: <strong>{targetIndustries.join(', ')}</strong>
              </span>
            </div>
            <Link 
              to="/investor/settings" 
              className="text-primary hover:text-secondary font-semibold hover:underline"
            >
              Update Investment Preferences
            </Link>
          </div>
        )}
      </div>

      {/* Discovery Filters & Search Controls */}
      <div className="space-y-4">
        {/* Top Control Bar: Search + Tabs + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by project title, business name, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active View Tabs & Sort */}
          <div className="flex items-center gap-3 shrink-0">
            {/* View Tabs */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center text-xs font-semibold shadow-xs">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Opportunities
              </button>
              <button
                onClick={() => handleTabChange('saved')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bookmark size={12} className={activeTab === 'saved' ? 'fill-current' : ''} />
                Watchlist ({savedCount})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none text-gray-400">
                <SlidersHorizontal size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-7 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="goal-desc">Funding: High to Low</option>
                <option value="goal-asc">Funding: Low to High</option>
                <option value="progress-desc">Highest Progress %</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedCategory === 'All'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Sectors ({projects.length})
          </button>

          {visibleCategories.map(cat => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const Icon = cat.icon;
            const count = projects.filter(p => (p.industry || '').toLowerCase() === cat.name.toLowerCase()).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={13} className={isSelected ? 'text-white' : 'text-primary'} />
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-9 w-9 text-primary animate-spin mb-4" />
          <h3 className="text-base font-bold text-gray-900">Loading Investment Opportunities...</h3>
          <p className="text-xs text-gray-500 mt-1">Fetching latest verified startup projects</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl">
          <h3 className="text-sm font-bold text-red-800">Error Loading Opportunities</h3>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white p-12 sm:p-16 rounded-2xl border border-gray-100 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
            {activeTab === 'saved' ? (
              <Bookmark className="h-8 w-8 text-gray-400" />
            ) : (
              <Briefcase className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {activeTab === 'saved' ? 'Your Watchlist is Empty' : 'No Projects Found'}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            {activeTab === 'saved'
              ? "You haven't saved any projects yet. Click the bookmark icon on any opportunity card to save it here for quick review."
              : selectedCategory !== 'All'
              ? `There are currently no active ventures listed under "${selectedCategory}".`
              : searchTerm
              ? `No ventures matched your search for "${searchTerm}".`
              : "No ventures currently match your criteria."}
          </p>

          <div className="flex items-center justify-center gap-3">
            {activeTab === 'saved' ? (
              <button
                onClick={() => handleTabChange('all')}
                className="bg-primary hover:bg-secondary text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
              >
                Browse All Opportunities
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  handleCategoryChange('All');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const catObj = PROJECT_CATEGORIES.find(
              c => c.name.toLowerCase() === (project.industry || '').trim().toLowerCase()
            );
            const imgUrl = project.project_image_url || catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
            const isSaved = savedProjectIds.has(project.id);
            const isSavingThis = savingId === project.id;
            const progress = Number(project.progress_percentage || 0);

            const IconComp = catObj ? catObj.icon : Tag;
            const badgeStyle = catObj ? catObj.badgeBg : 'bg-primary/10 text-primary border-primary/20';

            const entrepreneurName = project.entrepreneur?.full_name || 'Anonymous User';
            const entrepreneurAvatar = project.entrepreneur?.profile_photo_url || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent(entrepreneurName || project.business_name || 'User')}&background=8A5F41&color=fff`;

            return (
              <div 
                key={project.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner (Matching Image 2) */}
                  <div className="h-48 bg-gray-100 dark:bg-slate-800 relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={project.project_name || 'Project'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = catObj?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Sector Badge (Top Left) */}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-md bg-white/90 text-primary border-primary/20 dark:bg-slate-900/90 dark:text-amber-200 dark:border-amber-800/40`}>
                      <IconComp className="w-3.5 h-3.5" />
                      {project.industry || 'General Business'}
                    </span>

                    {/* Bookmark Button (Top Right) */}
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(project.id, e)}
                        disabled={isSavingThis}
                        aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
                        className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-gray-700 dark:text-slate-200 hover:text-primary shadow-xs'
                        }`}
                        title={isSaved ? "Remove from Watchlist" : "Save to Watchlist"}
                      >
                        {isSavingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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
                    <p className="text-gray-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed mb-4">
                      {project.project_description || 'No detailed description provided for this venture.'}
                    </p>

                    {/* Financial & Milestone Metrics */}
                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50/70 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700 text-xs mb-3">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                          Funding Goal
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          ${Number(project.funding_goal || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                          Startup Stage
                        </span>
                        <span className="font-extrabold text-gray-900 dark:text-white">
                          {project.startup_stage || 'Growth'}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400">Development</span>
                        <span className="font-bold text-primary dark:text-primary-light">{progress}%</span>
                      </div>
                      <ProjectProgressBar progress={progress} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-700/80 p-3 px-4 flex items-center justify-between gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs font-bold text-primary hover:text-secondary dark:text-primary-light flex items-center gap-1 transition-colors"
                  >
                    View Details
                    <ArrowRight size={13} />
                  </Link>

                  <Link
                    to={`/projects/${project.id}?invest=true`}
                    className="bg-primary hover:bg-secondary text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
                  >
                    Invest Now
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

export default InvestorProjects;
