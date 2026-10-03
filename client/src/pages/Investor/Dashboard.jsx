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
<<<<<<< HEAD
  Briefcase
=======
  Layers,
  FileText,
  CheckCircle2
>>>>>>> ba338bb (Save local changes and remove fly.io)
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

  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const rawRole = profile?.role || user?.user_metadata?.role || 'investor';
  const userRoleDisplay = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Investor';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span>Welcome back, {userName}!</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300/80 shadow-xs align-middle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {rawRole.toLowerCase() === 'investor' ? (
                <TrendingUp size={13} className="text-emerald-700" />
              ) : (
                <Briefcase size={13} className="text-emerald-700" />
              )}
              <span className="capitalize tracking-wide font-medium">{userRoleDisplay}</span>
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm leading-normal">
            Manage your portfolio and discover new opportunities from your dashboard.
          </p>
        </div>
        <Link 
          to="/projects" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
        >
          Discover Projects
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {/* Card 1 */}
        <Link to="/investor/investments" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group hover:border-gray-200 transition-all">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Investments</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{acceptedInvestments.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Portfolio deals</span>
            <ArrowRight size={14} />
          </div>
        </Link>
        
        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
<<<<<<< HEAD
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Active Offers</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeRequests.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Pending & Accepted</span>
=======
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Invested</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">${totalInvestedCapital.toLocaleString()}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Committed capital</span>
>>>>>>> ba338bb (Save local changes and remove fly.io)
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3 */}
<<<<<<< HEAD
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
=======
        <Link to="/investor/requests" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group hover:border-gray-200 transition-all">
>>>>>>> ba338bb (Save local changes and remove fly.io)
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <CheckCircle size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Offers</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{requests.filter(r => r.status === 'Pending').length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Awaiting response</span>
            <ArrowRight size={14} />
          </div>
<<<<<<< HEAD
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
=======
        </Link>

        {/* Card 4 */}
        <Link to="/investor/investments" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group hover:border-gray-200 transition-all">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <FileText size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Founder Reports</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{totalReportsCount}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Progress updates</span>
            <ArrowRight size={14} />
          </div>
        </Link>
>>>>>>> ba338bb (Save local changes and remove fly.io)
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - My Investments (Progress, Phases & Reports) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Investments</h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {myInvestments.length}
              </span>
            </div>
            <Link to="/investor/investments" className="text-xs sm:text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
              View All
            </Link>
          </div>
          
          <div className="space-y-6">
            {myInvestments.slice(0, 3).map((inv) => {
              const project = inv.project || {};
              const latestReport = Array.isArray(inv.reports) && inv.reports.length > 0 ? inv.reports[0] : null;

              return (
                <div key={inv.id} className="flex flex-col sm:flex-row gap-4 sm:gap-5 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                    {project.project_image_url ? (
                      <img src={project.project_image_url} alt={project.project_name || 'Project'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><FolderOpen size={28}/></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate mr-2">
                          {project.project_name || 'Untitled Project'}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          inv.status === 'Accepted' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>{project.industry || 'General'}</span>
                        {inv.phase && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-blue-600">Phase {inv.phase.phase_number}</span>
                          </>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <ProjectProgressBar progress={project.progress_percentage || 0} size="sm" />
                      </div>

                      {/* Latest Report Preview */}
                      {latestReport ? (
                        <div className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg truncate flex items-center gap-1.5">
                          <FileText size={12} className="text-primary flex-shrink-0" />
                          <span className="truncate"><strong>Update:</strong> {latestReport.title}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">
                          No founder reports posted yet
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-50">
                      <span className="text-xs font-bold text-gray-900">
                        ${Number(inv.proposed_amount).toLocaleString()}
                      </span>
                      <Link 
                        to="/investor/investments" 
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        Track Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {myInvestments.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-2">You haven't backed any ventures yet.</p>
                <Link to="/projects" className="text-xs font-bold text-primary hover:underline">
                  Discover investment opportunities →
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/investor/investments" className="text-sm font-bold text-primary hover:text-secondary flex items-center justify-center gap-2">
              View All Investments, Phases & Reports <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Column - My Investment Offers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Investment Offers</h2>
            <Link to="/investor/requests" className="text-xs sm:text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-md transition-colors">
              View All
            </Link>
          </div>

          <div className="space-y-6">
            {requests.slice(0, 3).map((request) => {
              const initials = request.entrepreneur?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'EN';
              return (
                <div key={request.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-full bg-[#FAF0E6] text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col justify-start">
                      <h4 className="font-bold text-gray-900 text-sm truncate mb-1">{request.entrepreneur?.full_name}</h4>
                      <p className="text-xs text-gray-500 truncate">Offer for {request.project?.project_name}</p>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end w-full sm:w-auto min-w-[140px]">
                      <div className="w-full flex justify-between items-center sm:justify-end sm:gap-3 mb-1">
                        <span className="font-bold text-gray-900 text-sm">${Number(request.proposed_amount).toLocaleString()}</span>
                        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          request.status === 'Pending' ? 'bg-[#FFF3CD] text-[#856404]' :
                          request.status === 'Accepted' ? 'bg-[#D4EDDA] text-[#155724]' :
                          request.status === 'Withdrawn' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="w-full text-left sm:text-right text-xs text-gray-400 mb-3">
                        {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="flex gap-2 w-full justify-start sm:justify-end">
                         <Link to={`/projects/${request.project_id}`} className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-center">View</Link>
                         {request.status === 'Pending' && (
                            <button onClick={() => handleWithdrawRequest(request.id)} className="px-3 py-1.5 text-[11px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors text-center">Withdraw</button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No investment offers yet.</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/investor/requests" className="text-sm font-bold text-primary hover:text-secondary flex items-center justify-center gap-2">
              View All Offers <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Ready to invest in the next big thing?</h3>
            <p className="text-sm text-gray-500">Browse through hundreds of vetted projects and find your perfect match.</p>
          </div>
        </div>
        <Link to="/projects" className="w-full sm:w-auto text-center px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap">
          Discover Projects
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
