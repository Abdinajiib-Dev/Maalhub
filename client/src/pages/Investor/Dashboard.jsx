import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bookmark,
  DollarSign,
  TrendingUp,
  CheckCircle,
  FolderOpen,
  ArrowRight,
  Briefcase,
  Layers,
  FileText,
  CheckCircle2
} from 'lucide-react';
import ProjectProgressBar from '../../components/ProjectProgressBar';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [savedProjects, setSavedProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [saved, reqs, invs] = await Promise.all([
          api.getSavedProjects().catch(() => []),
          api.getInvestmentRequests().catch(() => []),
          api.getMyInvestments().catch(() => [])
        ]);

        const validSaved = Array.isArray(saved) ? saved.filter(s => s && s.project) : [];
        setSavedProjects(validSaved);

        const validReqs = Array.isArray(reqs) ? reqs.filter(r => r && (r.investor_id === user?.id)) : [];
        setRequests(validReqs);

        setMyInvestments(Array.isArray(invs) ? invs : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleWithdrawRequest = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this investment offer?')) return;
    try {
      await api.updateRequestStatus(id, 'Withdrawn');
      setRequests(requests.map(req => req.id === id ? { ...req, status: 'Withdrawn' } : req));
    } catch (err) {
      alert(`Error withdrawing request: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  }

  const activeRequests = requests.filter(r => r.status === 'Pending' || r.status === 'Accepted');
  const acceptedInvestments = myInvestments.filter(i => i.status === 'Accepted');
  const totalInvestedCapital = acceptedInvestments.reduce((sum, i) => sum + Number(i.proposed_amount || 0), 0);
  const totalReportsCount = myInvestments.reduce((sum, i) => sum + (Array.isArray(i.reports) ? i.reports.length : 0), 0);
  const totalOffered = activeRequests.reduce((sum, r) => sum + Number(r.proposed_amount || 0), 0);

  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const rawRole = profile?.role || user?.user_metadata?.role || 'investor';
  const userRoleDisplay = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Investor';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
      {/* 1. Welcome Section Box */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex flex-wrap items-center gap-3">
            <span>Welcome back, {userName}!</span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {rawRole.toLowerCase() === 'investor' ? (
                <TrendingUp size={13} className="text-emerald-700" />
              ) : (
                <Briefcase size={13} className="text-emerald-700" />
              )}
              <span className="capitalize tracking-wide font-medium">{userRoleDisplay}</span>
            </span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
            Manage your portfolio and discover new opportunities from your dashboard.
          </p>
        </div>
        <Link
          to="/projects"
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all text-center whitespace-nowrap"
        >
          Discover Projects
        </Link>
      </div>

      {/* 2. Stats Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Bookmark size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Saved Projects</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{savedProjects.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Watchlist</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Offers</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeRequests.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Pending & Accepted</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <CheckCircle size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Completed Deals</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {requests.filter(r => r.status === 'Accepted').length}
          </h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Successful deals</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Proposed</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">${totalOffered.toLocaleString()}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Active capital</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* 3. Main Content Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Saved Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Saved Projects</h2>
            <Link to="/investor/projects" className="text-xs sm:text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-6">
            {savedProjects.slice(0, 3).map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-5 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                  {item.project?.project_image_url ? (
                    <img src={item.project.project_image_url} alt={item.project.project_name || 'Project'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><FolderOpen size={28} /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{item.project?.project_name || 'Untitled Project'}</h3>
                      <p className="text-xs text-gray-500">{item.project?.industry || 'N/A'}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 sm:mt-0">
                      Saved on {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-full sm:w-32 flex flex-col justify-end py-0.5">
                    <div className="flex gap-2 justify-start sm:justify-end mt-2 sm:mt-0">
                      <Link to={`/projects/${item.project_id}`} className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">View</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {savedProjects.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">You haven't saved any projects yet.</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/investor/projects" className="text-sm font-bold text-primary hover:text-secondary flex items-center justify-center gap-2">
              View All Saved Projects <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Column Box - My Investment Offers */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">My Investment Offers</h2>
              <Link to="/investor/requests" className="text-xs font-semibold text-primary hover:text-secondary border border-primary/20 bg-primary/5 px-3.5 py-1.5 rounded-lg transition-colors shrink-0">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => {
                const initials = request.entrepreneur?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EN';
                return (
                  <div key={request.id} className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 hover:border-gray-200/80 transition-all flex flex-col sm:flex-row gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate mb-0.5">{request.entrepreneur?.full_name}</h4>
                          <p className="text-xs text-gray-500 truncate">Offer for {request.project?.project_name}</p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <span className="font-extrabold text-gray-900 text-sm">${Number(request.proposed_amount).toLocaleString()}</span>
                          <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${request.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            request.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              request.status === 'Withdrawn' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/40 gap-2 min-w-0">
                        <span className="text-[11px] text-gray-400 font-medium truncate min-w-0">
                          {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>

                        <div className="flex gap-2 shrink-0">
                          <Link to={`/projects/${request.project_id}`} className="px-3 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-2xs whitespace-nowrap">View</Link>
                          {request.status === 'Pending' && (
                            <button onClick={() => handleWithdrawRequest(request.id)} className="px-3 py-1 text-[11px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors shadow-2xs whitespace-nowrap">Withdraw</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  No investment offers yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/investor/requests" className="text-sm font-bold text-primary hover:text-secondary inline-flex items-center gap-2 group">
              View All Offers <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Banner Box */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-0.5">Ready to invest in the next big thing?</h3>
            <p className="text-sm text-gray-500">Browse through hundreds of vetted projects and find your perfect match.</p>
          </div>
        </div>
        <Link to="/projects" className="w-full sm:w-auto text-center px-6 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          Discover Projects
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
