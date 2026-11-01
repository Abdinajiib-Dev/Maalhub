import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  ExternalLink,
  Building,
  MapPin,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  Filter,
  CheckCircle,
  Search,
  Eye
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import ProjectProgressBar from '../../components/ProjectProgressBar';

const MyInvestments = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter tab: 'all' | 'accepted' | 'pending'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected report for full reading modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Expanded report cards mapping: { [projectId]: boolean }
  const [expandedReports, setExpandedReports] = useState({});

  const toggleReports = (id) => {
    setExpandedReports(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getMyInvestments();
      setInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  // Filtered investments
  const filteredInvestments = investments.filter(inv => {
    if (activeFilter === 'accepted' && inv.status !== 'Accepted') return false;
    if (activeFilter === 'pending' && inv.status !== 'Pending') return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const projName = inv.project?.project_name?.toLowerCase() || '';
      const bizName = inv.project?.business_name?.toLowerCase() || '';
      const ind = inv.project?.industry?.toLowerCase() || '';
      return projName.includes(q) || bizName.includes(q) || ind.includes(q);
    }
    return true;
  });

  // Calculations for summary metric cards
  const acceptedInvestments = investments.filter(inv => inv.status === 'Accepted');
  const totalCapitalCommitted = acceptedInvestments.reduce((sum, inv) => sum + Number(inv.proposed_amount || 0), 0);
  const totalReportsCount = investments.reduce((sum, inv) => sum + (Array.isArray(inv.reports) ? inv.reports.length : 0), 0);
  const activePhasesCount = investments.filter(inv => inv.phase && inv.phase.status === 'Active').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center shadow-xs">
              <TrendingUp size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                My Investments
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">
                Track project execution progress, investment phases, and entrepreneur reports.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/projects"
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2 text-sm text-center"
        >
          Discover New Projects
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Portfolio Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-gray-200 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Total Invested</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
            ${totalCapitalCommitted.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
            <span>In {acceptedInvestments.length} confirmed {acceptedInvestments.length === 1 ? 'deal' : 'deals'}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-gray-200 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Ventures Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center">
              <Building size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
            {investments.length}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {acceptedInvestments.length} active • {investments.length - acceptedInvestments.length} pending
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-gray-200 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Active Phases</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center">
              <Layers size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
            {activePhasesCount}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Funding tranches in progress
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-gray-200 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">Progress Reports</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">
            {totalReportsCount}
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Updates from entrepreneurs
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Ventures ({investments.length})
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'accepted'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Active Deals ({acceptedInvestments.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending Offers ({investments.filter(i => i.status === 'Pending').length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by venture or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl text-xs focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-800 outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Loading your investment portfolio...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300 font-bold text-sm mb-1">Failed to load investments</p>
          <p className="text-red-600 dark:text-red-400 text-xs mb-4">{error}</p>
          <button 
            onClick={fetchInvestments}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
          >
            Try Again
          </button>
        </div>
      ) : filteredInvestments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No investments found</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm mb-6">
            {investments.length === 0 
              ? "You haven't made any investment proposals yet. Explore promising startups and make your first investment offer!"
              : "No investments match the selected filter criteria."}
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            Explore Available Projects <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInvestments.map((inv) => {
            const project = inv.project || {};
            const entrepreneur = inv.entrepreneur || {};
            const backedPhase = inv.phase;
            const allPhases = Array.isArray(inv.all_phases) ? inv.all_phases : [];
            const reports = Array.isArray(inv.reports) ? inv.reports : [];
            const hasReports = reports.length > 0;
            const isReportsOpen = expandedReports[inv.id] !== false; // default open if not toggled off

            const statusColors = {
              Accepted: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
              Pending: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
              Rejected: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
              Withdrawn: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'
            }[inv.status] || 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700';

            return (
              <div 
                key={inv.id} 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs hover:border-gray-300 dark:hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* 1. Venture Header & Quick Details */}
                <div className="p-6 bg-slate-50/70 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden flex-shrink-0 shadow-xs">
                      {project.project_image_url ? (
                        <img 
                          src={project.project_image_url} 
                          alt={project.project_name || 'Project'} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800">
                          <FolderOpen size={30} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200">
                          {project.industry || 'General'}
                        </span>
                        <span className="text-[11px] font-medium text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800/90 border border-gray-200/60 dark:border-slate-700 px-2.5 py-0.5 rounded-full">
                          Stage: {project.startup_stage || 'Growth'}
                        </span>
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors}`}>
                          {inv.status === 'Accepted' ? 'Active Investment' : `Offer: ${inv.status}`}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                        {project.project_name || 'Untitled Project'}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                        <Building size={14} className="text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-700 dark:text-slate-300 font-semibold">{project.business_name}</span>
                        {project.location && (
                          <>
                            <span className="text-gray-300 dark:text-slate-600">•</span>
                            <MapPin size={13} className="text-gray-400 dark:text-slate-500" />
                            <span>{project.location}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Entrepreneur Pill */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-stretch lg:self-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-slate-400 tracking-wider">
                        My Committed Capital
                      </span>
                      <span className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                        <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400 -mr-0.5" />
                        {Number(inv.proposed_amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-700 flex-shrink-0">
                        <img 
                          src={entrepreneur.profile_photo_url || `https://ui-avatars.com/api/?name=${entrepreneur.full_name || 'Entrepreneur'}&background=8A5F41&color=fff`} 
                          alt="Entrepreneur" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px]">
                          {entrepreneur.full_name || 'Entrepreneur'}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-slate-400">Founder</span>
                      </div>
                    </div>

                    <Link 
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary dark:text-amber-200 px-3 py-2 bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Eye size={14} />
                      View Details
                    </Link>
                  </div>
                </div>

                {/* 2. THE THREE PILLARS CONTAINER */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* PILLAR 1: OVERALL PROJECT PROGRESS (5 cols) */}
                  <div className="lg:col-span-5 bg-gray-50/90 dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-amber-200 flex items-center justify-center font-bold text-xs">
                            1
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            Project Progress
                          </h4>
                        </div>
                        <span className="text-xs font-black text-primary dark:text-amber-200 bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full">
                          {project.progress_percentage || 0}% Complete
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
                        Overall startup progress track reported by the founding team.
                      </p>

                      {/* Visual Progress Bar Component */}
                      <ProjectProgressBar progress={project.progress_percentage || 0} size="md" showLabel={false} />

                      {/* Phase timeline highlights */}
                      <div className="mt-5 space-y-2.5 pt-4 border-t border-gray-200/60 dark:border-slate-700/60 text-xs">
                        <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className={project.progress_percentage >= 25 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-slate-600'} />
                            Foundation & Prototyping
                          </span>
                          <span className="font-semibold text-gray-500 dark:text-slate-400">{project.progress_percentage >= 25 ? 'Done' : 'In Progress'}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className={project.progress_percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-slate-600'} />
                            Market Deployment & Operations
                          </span>
                          <span className="font-semibold text-gray-500 dark:text-slate-400">{project.progress_percentage >= 60 ? 'Done' : project.progress_percentage >= 25 ? 'In Progress' : 'Pending'}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className={project.progress_percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-slate-600'} />
                            Scaling & Financial Independence
                          </span>
                          <span className="font-semibold text-gray-500 dark:text-slate-400">{project.progress_percentage >= 100 ? 'Completed' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-slate-700/50 flex justify-between items-center text-[11px] text-gray-500 dark:text-slate-400">
                      <span>Total Goal: ${project.funding_goal?.toLocaleString() || 0}</span>
                      <span>Created {new Date(project.created_at || inv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* PILLAR 2: INVESTMENT PHASE & TRANCHE DETAILS (7 cols) */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-gray-200 dark:border-slate-700/60 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                            2
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <Layers size={16} className="text-blue-600 dark:text-blue-400" />
                            Investment Phase & Tranches
                          </h4>
                        </div>
                        {backedPhase && (
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            backedPhase.status === 'Active' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                            backedPhase.status === 'Funded' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                            backedPhase.status === 'Completed' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                            'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                          }`}>
                            Phase Status: {backedPhase.status}
                          </span>
                        )}
                      </div>

                      {/* If the investor is tied to a specific phase */}
                      {backedPhase ? (
                        <div className="p-4 bg-blue-50/40 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/60 mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Backed Funding Tranche
                              </span>
                              <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                                Phase {backedPhase.phase_number}: {backedPhase.title}
                              </h5>
                            </div>
                            {backedPhase.target_date && (
                              <span className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400 dark:text-slate-500" />
                                Target: {new Date(backedPhase.target_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {backedPhase.description && (
                            <p className="text-xs text-gray-600 dark:text-slate-300 mb-3 leading-relaxed">
                              {backedPhase.description}
                            </p>
                          )}

                          {/* Phase Funding Progress Bar */}
                          <div>
                            <div className="flex justify-between items-center text-xs font-semibold mb-1">
                              <span className="text-gray-600 dark:text-slate-300">
                                Phase Funding: <strong className="text-gray-900 dark:text-white">${Number(backedPhase.current_amount || 0).toLocaleString()}</strong> of ${Number(backedPhase.target_amount || 1).toLocaleString()}
                              </span>
                              <span className="text-blue-700 dark:text-blue-400 font-bold">
                                {Math.min(100, Math.round(((Number(backedPhase.current_amount || 0)) / (Number(backedPhase.target_amount || 1))) * 100))}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.round(((Number(backedPhase.current_amount || 0)) / (Number(backedPhase.target_amount || 1))) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800 mb-4">
                          <p className="text-xs font-medium text-gray-700 dark:text-slate-300">
                            General venture funding round of <strong className="text-gray-900 dark:text-white">${project.funding_goal?.toLocaleString()}</strong>.
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-slate-400 mt-1">
                            This project does not segregate capital into structured tranches, or your offer applies to the global venture round.
                          </p>
                        </div>
                      )}

                      {/* Overview of all tranches if multi-phase project */}
                      {allPhases.length > 1 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">
                            All Roadmap Phases ({allPhases.length})
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {allPhases.map((ph) => (
                              <div 
                                key={ph.id}
                                className={`p-2 rounded-lg border text-xs ${
                                  backedPhase?.id === ph.id 
                                    ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 font-semibold text-blue-900 dark:text-blue-200 ring-1 ring-blue-200 dark:ring-blue-900' 
                                    : 'bg-gray-50 dark:bg-slate-900/70 border-gray-200 dark:border-slate-700/80 text-gray-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-bold text-gray-900 dark:text-white">Phase {ph.phase_number}</span>
                                  <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-slate-400">{ph.status}</span>
                                </div>
                                <div className="truncate text-[11px]">{ph.title}</div>
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">${Number(ph.target_amount).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
                      <span>Investment Status: <strong className="text-gray-900 dark:text-white">{inv.status}</strong></span>
                      <Link 
                        to={`/projects/${project.id}`} 
                        className="text-primary hover:text-secondary dark:text-primary-light font-semibold flex items-center gap-1"
                      >
                        Explore all phase details <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 3. PILLAR 3: ENTREPRENEUR REPORTS FEED & ACCORDION */}
                <div className="px-6 pb-6">
                  <div className="bg-[#FAF9F6] dark:bg-slate-900/80 rounded-2xl border border-gray-200/80 dark:border-slate-800 p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText size={16} className="text-amber-700 dark:text-amber-400" />
                            Reports from Entrepreneur ({reports.length})
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Updates, operational progress, and briefs submitted by the founder.
                          </p>
                        </div>
                      </div>

                      {hasReports && (
                        <button
                          onClick={() => toggleReports(inv.id)}
                          className="text-xs font-bold text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light flex items-center gap-1 py-1 px-2.5 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-2xs"
                        >
                          {isReportsOpen ? 'Hide Reports' : 'Show Reports'}
                          {isReportsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                    </div>

                    {!hasReports ? (
                      <div className="py-6 text-center bg-white dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-200 dark:border-slate-700/80">
                        <FileText size={28} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-600 dark:text-slate-300">No progress reports published yet by the founder.</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                          When the entrepreneur submits progress or financial updates, they will appear here in real-time.
                        </p>
                      </div>
                    ) : isReportsOpen ? (
                      <div className="space-y-3">
                        {reports.map((rep) => (
                          <div 
                            key={rep.id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-2xs hover:shadow-xs hover:border-gray-300 dark:hover:border-slate-600 transition-all cursor-pointer"
                            onClick={() => setSelectedReport(rep)}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  rep.report_type === 'Achievements' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                                  rep.report_type === 'Financial' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                                  'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                }`}>
                                  {rep.report_type === 'Achievements' ? 'Key Achievements' : (rep.report_type || 'Progress Update')}
                                </span>
                                {rep.phase && (
                                  <span className="text-[10px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-2 py-0.5 rounded-full">
                                    Phase {rep.phase.phase_number}: {rep.phase.title}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400 dark:text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(rep.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <h5 className="text-base font-bold text-gray-900 dark:text-white mb-1 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center justify-between">
                              <span>{rep.title}</span>
                              <ChevronRight size={16} className="text-gray-400 dark:text-slate-500" />
                            </h5>

                            <p className="text-xs text-gray-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                              {rep.summary}
                            </p>

                            {/* Snapshot of Key Achievements */}
                            {rep.key_achievements && (
                              <div className="p-2.5 bg-green-50/60 dark:bg-emerald-950/40 border border-green-100 dark:border-emerald-900/60 rounded-lg text-xs text-green-900 dark:text-emerald-200 flex items-start gap-2">
                                <CheckCircle2 size={14} className="text-green-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{rep.key_achievements}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-slate-400 text-center py-2">
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'} available. Click "Show Reports" above to view.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULL REPORT DETAIL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedReport.report_type === 'Achievements' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' :
                    selectedReport.report_type === 'Financial' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                    'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  }`}>
                    {selectedReport.report_type === 'Achievements' ? 'Key Achievements' : (selectedReport.report_type || 'Progress Update')}
                  </span>
                  {selectedReport.phase && (
                    <span className="text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 px-2 py-0.5 rounded-full">
                      Phase {selectedReport.phase.phase_number}: {selectedReport.phase.title}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-slate-400 flex items-center gap-1 ml-2">
                    <Calendar size={13} />
                    {new Date(selectedReport.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1.5 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-2">
                  Executive Summary & Operational Update
                </h4>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line text-sm">
                  {selectedReport.summary}
                </div>
              </div>

              {/* Key Achievements */}
              {selectedReport.key_achievements && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    Key Achievements
                  </h4>
                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-950 dark:text-emerald-200 leading-relaxed whitespace-pre-line">
                    {selectedReport.key_achievements}
                  </div>
                </div>
              )}

              {/* Next Planned Steps */}
              {selectedReport.next_steps && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                    <ArrowRight size={16} className="text-blue-600 dark:text-blue-400" />
                    Next Deliverables & Roadmap
                  </h4>
                  <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-blue-950 dark:text-blue-200 leading-relaxed whitespace-pre-line">
                    {selectedReport.next_steps}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInvestments;
