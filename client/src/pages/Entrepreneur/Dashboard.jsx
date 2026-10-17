import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDialog } from '../../contexts/DialogContext';
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
  const { showAlert, toast } = useDialog();
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
      toast.success(`Request ${status.toLowerCase()} successfully.`);
    } catch (err) {
      showAlert({
        title: 'Action Failed',
        message: err.message || 'Error updating investment request',
        variant: 'error'
      });
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
      {/* 1. Welcome Section Box */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex flex-wrap items-center gap-3">
            <span>Welcome back, {userName}!</span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {rawRole.toLowerCase() === 'investor' ? (
                <TrendingUp size={13} className="text-primary" />
              ) : (
                <Briefcase size={13} className="text-primary" />
              )}
              <span className="capitalize tracking-wide font-medium">{userRoleDisplay}</span>
            </span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
            Manage your projects and investment opportunities from your dashboard.
          </p>
        </div>
        <Link 
          to="/entrepreneur/create-project" 
          className="w-full sm:w-auto bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all text-center whitespace-nowrap"
        >
          <Plus size={18} />
          Create New Project
        </Link>
      </div>

      {/* 2. Stats Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: My Projects */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-2xs">
              <FolderOpen size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">My Projects</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{projects.length}</h3>
          </div>
          <div className="w-full flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
            <span>Active projects</span>
            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        {/* Card 2: Investment Requests */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-2xs">
              <Users size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Investment Requests</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{requests.length}</h3>
          </div>
          <div className="w-full flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
            <span>Pending responses</span>
            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Accepted Investments */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-2xs">
              <CheckCircle size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Accepted Investments</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">{acceptedInvestments}</h3>
          </div>
          <div className="w-full flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
            <span>Total accepted</span>
            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Total Funding Requested */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-2xs">
              <DollarSign size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Funding Requested</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">${totalFundingGoal.toLocaleString()}</h3>
          </div>
          <div className="w-full flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100 font-medium">
            <span>Across all projects</span>
            <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Main Content Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column Box - My Projects */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">My Projects</h2>
              <Link to="/entrepreneur/projects" className="text-xs font-semibold text-primary hover:text-secondary border border-primary/20 bg-primary/5 px-3.5 py-1.5 rounded-lg transition-colors shrink-0">
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
                  <div key={project.id} className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 hover:border-gray-200/80 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 min-w-0">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-2xs border border-gray-200/60">
                      {project.project_image_url ? (
                        <img src={project.project_image_url} alt={project.project_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FolderOpen size={26}/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 min-w-0">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate mb-0.5">{project.project_name}</h3>
                          <p className="text-xs font-medium text-gray-500 truncate">{project.industry}</p>
                        </div>
                        <span className={`self-start shrink-0 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          project.status === 'Published' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          project.status === 'Draft' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {project.status === 'Published' ? 'Active / Published' : project.status === 'Draft' ? 'Pending Review' : project.status}
                        </span>
                      </div>
                      
                      <div className="w-full">
                        <div className="flex justify-between text-xs font-bold text-gray-900 mb-1.5 gap-2">
                          <span className="truncate">${raisedAmount.toLocaleString()} / ${Number(project.funding_goal || 0).toLocaleString()}</span>
                          <span className="text-gray-500 shrink-0">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/40 gap-2 min-w-0">
                        <span className="text-[11px] text-gray-400 font-medium truncate min-w-0">
                          Created {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        
                        <div className="flex gap-2 shrink-0">
                          <Link to={`/projects/${project.id}`} className="px-3 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-2xs whitespace-nowrap">View</Link>
                          <Link to={`/entrepreneur/edit-project/${project.id}`} className="px-3 py-1 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors shadow-2xs whitespace-nowrap">Edit</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
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
            <Link to="/entrepreneur/projects" className="text-sm font-bold text-primary hover:text-secondary inline-flex items-center gap-2 group">
              View All Projects <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column Box - Investment Requests */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Investment Requests</h2>
              <Link to="/entrepreneur/requests" className="text-xs font-semibold text-primary hover:text-secondary border border-primary/20 bg-primary/5 px-3.5 py-1.5 rounded-lg transition-colors">
                View All ({requests.length})
              </Link>
            </div>

            <div className="space-y-4">
              {requests.slice(0, 3).map((request) => {
                const initials = request.investor?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IN';
                return (
                  <div key={request.id} className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 hover:border-gray-200/80 transition-all flex flex-col sm:flex-row gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm truncate mb-0.5">{request.investor?.full_name}</h4>
                          <p className="text-xs text-gray-500 truncate">Interested in {request.project?.project_name}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="font-extrabold text-gray-900 text-sm">${Number(request.proposed_amount).toLocaleString()}</span>
                          <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                            request.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            request.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200/40">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        
                        <div className="flex gap-2">
                          <Link to="/entrepreneur/requests" className="px-3 py-1 text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-2xs">View</Link>
                          {request.status === 'Pending' ? (
                            <button onClick={() => handleRequestAction(request.id, 'Accepted')} className="px-3 py-1 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors shadow-2xs">Respond</button>
                          ) : (
                            <Link to="/entrepreneur/requests" className="px-3 py-1 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors shadow-2xs">Details</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-sm bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <Users size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">No investment requests yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link to="/entrepreneur/requests" className="text-sm font-bold text-primary hover:text-secondary inline-flex items-center gap-2 group">
              View All Requests <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Bottom Banner Box */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-0.5">Get your project in front of the right investors.</h3>
            <p className="text-sm text-gray-500">The more details you provide, the better your chances of getting funded.</p>
          </div>
        </div>
        <Link to="/entrepreneur/projects" className="w-full sm:w-auto text-center px-6 py-2.5 text-sm font-medium text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          Improve My Project
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
