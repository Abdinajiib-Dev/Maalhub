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
  ArrowRight
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
        setRequests(reqs.filter(r => r.entrepreneur_id === user.id));
        
        const myProjects = await api.getMyProjects();
        setProjects(myProjects || []);
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

  return (
    <div className="px-8 py-8 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Entrepreneur'}!
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Manage your projects and investment opportunities<br/>from your dashboard.</p>
        </div>
        <Link to="/entrepreneur/create-project" className="bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={18} />
          Create New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Funding Requested</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">${totalFundingGoal.toLocaleString()}</h3>
          <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-auto pt-4 border-t border-gray-50">
            <span>Across all projects</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Card 3 */}
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

        {/* Card 4 */}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - My Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Projects</h2>
            <button className="text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-md transition-colors">View All</button>
          </div>
          
          <div className="space-y-6">
            {projects.slice(0, 3).map((project) => {
              const percentage = project.funding_goal ? Math.min(Math.round((0 / project.funding_goal) * 100), 100) : 0;
              return (
                <div key={project.id} className="flex flex-col sm:flex-row gap-5 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                    {project.project_image_url ? (
                      <img src={project.project_image_url} alt={project.project_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><FolderOpen size={28}/></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col justify-between pt-1 pb-1">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{project.project_name}</h3>
                        <p className="text-xs text-gray-500">{project.industry}</p>
                      </div>
                      <p className="text-xs text-gray-400">Created on {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    
                    <div className="w-full sm:w-56 flex flex-col justify-between pt-1 pb-1">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-900 mb-2">
                          <span>$0 / ${Number(project.funding_goal).toLocaleString()}</span>
                          <span className="text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          project.status === 'Published' ? 'bg-[#D4EDDA] text-[#155724]' :
                          project.status === 'Draft' ? 'bg-[#FAF0E6] text-primary' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status === 'Published' ? 'Active' : project.status}
                        </span>
                        
                        <div className="flex gap-2">
                          <Link to={`/projects/${project.id}`} className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">View</Link>
                          <button className="px-3 py-1.5 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">You haven't created any projects yet.</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/entrepreneur/projects" className="text-sm font-bold text-primary hover:text-secondary flex items-center justify-center gap-2">
              View All Projects <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Column - Investment Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Investment Requests</h2>
            <button className="text-sm font-medium text-gray-500 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-md transition-colors">View All</button>
          </div>

          <div className="space-y-6">
            {requests.slice(0, 3).map((request) => {
              const initials = request.investor?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'IN';
              return (
                <div key={request.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-full bg-[#FAF0E6] text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex flex-col justify-start">
                      <h4 className="font-bold text-gray-900 text-sm truncate mb-1">{request.investor?.full_name}</h4>
                      <p className="text-xs text-gray-500 truncate">Interested in {request.project?.project_name}</p>
                    </div>
                    
                    <div className="flex flex-col items-end min-w-[140px]">
                      <div className="w-full flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-900 text-sm">${Number(request.proposed_amount).toLocaleString()}</span>
                        <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          request.status === 'Pending' ? 'bg-[#FFF3CD] text-[#856404]' :
                          request.status === 'Accepted' ? 'bg-[#D4EDDA] text-[#155724]' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="w-full text-left text-xs text-gray-400 mb-3">
                        {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      
                      <div className="flex gap-2 w-full justify-end">
                         <button className="px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">View</button>
                         {request.status === 'Pending' ? (
                            <button onClick={() => handleRequestAction(request.id, 'Accepted')} className="px-3 py-1.5 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors">Respond</button>
                         ) : (
                            <button className="px-3 py-1.5 text-[11px] font-medium text-white bg-primary hover:bg-secondary rounded-md transition-colors">Details</button>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {requests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No investment requests yet.</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link to="/entrepreneur/requests" className="text-sm font-bold text-primary hover:text-secondary flex items-center justify-center gap-2">
              View All Requests <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Get your project in front of the right investors.</h3>
            <p className="text-sm text-gray-500">The more details you provide, the better your chances of getting funded.</p>
          </div>
        </div>
        <button className="px-6 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap">
          Improve My Project
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
