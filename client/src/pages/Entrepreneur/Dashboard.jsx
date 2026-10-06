import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FolderOpen, 
  DollarSign, 
  Users, 
  CheckCircle,
  Plus,
  ArrowRight,
  Briefcase,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const reqs = await api.getInvestmentRequests();
        const validReqs = Array.isArray(reqs) ? reqs.filter(r => r && (r.entrepreneur_id === user?.id)) : [];
        setRequests(validReqs);
        
        const myProjects = await api.getMyProjects();
        setProjects(Array.isArray(myProjects) ? myProjects : []);
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

  const handleRequestAction = async (id, status) => {
    try {
      await api.updateRequestStatus(id, status);
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;
  }

  const totalFundingGoal = projects.reduce((sum, p) => sum + Number(p.funding_goal), 0);
  const acceptedInvestments = requests.filter(r => r.status === 'Accepted').length;

  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  const rawRole = profile?.role || user?.user_metadata?.role || 'entrepreneur';
  const userRoleDisplay = rawRole ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase() : 'Entrepreneur';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span>Welcome back, {userName}!</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30 shadow-xs align-middle">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {rawRole.toLowerCase() === 'investor' ? (
                <TrendingUp size={13} className="text-primary" />
              ) : (
                <Briefcase size={13} className="text-primary" />
              )}
              <span className="capitalize tracking-wide font-medium">{userRoleDisplay}</span>
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm leading-normal">
            Manage your projects and investment opportunities from your dashboard.
          </p>
        </div>
        <Link 
          to="/entrepreneur/create-project" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
        >
          <Plus size={18} />
          Create New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <FolderOpen size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">My Projects</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{projects.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Active projects</span>
            <ArrowRight size={14} />
          </div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Users size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Investment Requests</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{requests.length}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Pending responses</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <CheckCircle size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Accepted Investments</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">{acceptedInvestments}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Total accepted</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Funding Requested</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">${totalFundingGoal.toLocaleString()}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Across all projects</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - My Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Projects</h2>
                <p className="text-xs text-gray-500 mt-0.5">Active venture campaigns and funding progress</p>
              </div>
              <Link to="/entrepreneur/projects" className="text-xs font-semibold text-primary hover:text-secondary bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                View All ({projects.length})
              </Link>
            </div>
            
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => {
                const raisedAmount = requests
                  .filter(r => r.project_id === project.id && r.status === 'Accepted')
                  .reduce((sum, r) => sum + Number(r.proposed_amount || 0), 0);
                const percentage = project.funding_goal ? Math.min(Math.round((raisedAmount / project.funding_goal) * 100), 100) : 0;
                return (
                  <div key={project.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all flex flex-col gap-3">
                    {/* Top Row: Thumbnail + Title + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                          {project.project_image_url ? (
                            <img src={project.project_image_url} alt={project.project_name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderOpen size={22} className="text-gray-400"/>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/projects/${project.id}`} className="font-bold text-gray-900 text-sm hover:text-primary transition-colors block truncate">
                            {project.project_name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-600 truncate">{project.industry}</span>
                            <span>•</span>
                            <span className="text-gray-400 whitespace-nowrap">
                              {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        project.status === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        project.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {project.status === 'Published' ? 'Active' : project.status}
                      </span>
                    </div>

                    {/* Middle Row: Funding Progress Bar */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-500 font-medium">
                          Raised: <strong className="text-gray-900 font-bold">${raisedAmount.toLocaleString()}</strong>
                          <span className="text-gray-400 mx-1">/</span>
                          ${Number(project.funding_goal || 0).toLocaleString()}
                        </span>
                        <span className="font-bold text-primary">{percentage}% Funded</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>

                    {/* Bottom Row: Development Progress & Actions */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="text-gray-400">Dev Progress:</span>
                        <span className="font-bold text-gray-800">{project.progress_percentage || 0}%</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${project.id}`} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors shadow-2xs">
                          View
                        </Link>
                        <Link to={`/entrepreneur/edit-project/${project.id}`} className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <FolderOpen size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">You haven't created any projects yet.</p>
                  <Link to="/entrepreneur/create-project" className="inline-block mt-3 text-xs font-bold text-primary hover:underline">
                    + Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/entrepreneur/projects" className="text-sm font-bold text-primary hover:text-secondary inline-flex items-center justify-center gap-1.5">
              <span>View All Projects</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Right Column - Investment Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Investment Requests</h2>
                <p className="text-xs text-gray-500 mt-0.5">Incoming proposals from investors</p>
              </div>
              <Link to="/entrepreneur/requests" className="text-xs font-semibold text-primary hover:text-secondary bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                View All ({requests.length})
              </Link>
            </div>

            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => {
                const initials = request.investor?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IN';
                return (
                  <div key={request.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-xs transition-all flex flex-col gap-3">
                    {/* Top Row: Avatar + Name + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{request.investor?.full_name}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            Interested in <span className="font-semibold text-gray-700">{request.project?.project_name}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                        request.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        request.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    {/* Middle Row: Offer Amount & Date */}
                    <div className="flex justify-between items-center bg-white p-2.5 px-3 rounded-lg border border-gray-100 shadow-2xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Offer Amount</span>
                        <span className="font-bold text-gray-900 text-sm">${Number(request.proposed_amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Submitted</span>
                        <span className="text-gray-600 text-xs font-medium">
                          {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      <Link to="/entrepreneur/requests" className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors shadow-2xs">
                        View
                      </Link>
                      {request.status === 'Pending' ? (
                        <button onClick={() => handleRequestAction(request.id, 'Accepted')} className="px-3.5 py-1.5 text-xs font-bold text-white bg-primary hover:bg-secondary rounded-lg transition-colors cursor-pointer shadow-xs">
                          Respond
                        </button>
                      ) : (
                        <Link to="/entrepreneur/requests" className="px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Users size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">No investment requests yet.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/entrepreneur/requests" className="text-sm font-bold text-primary hover:text-secondary inline-flex items-center justify-center gap-1.5">
              <span>View All Requests</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-6 sm:mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Get your project in front of the right investors.</h3>
            <p className="text-sm text-gray-500">The more details you provide, the better your chances of getting funded.</p>
          </div>
        </div>
        <Link to="/entrepreneur/projects" className="w-full sm:w-auto text-center px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap">
          Improve My Project
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
