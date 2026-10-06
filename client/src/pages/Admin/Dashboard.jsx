import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  ArrowRight,
  UserCheck,
  Briefcase,
  AlertCircle,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
        setError(err.message || 'Failed to fetch admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Super Admin';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto space-y-6 sm:space-y-8">
      {/* 1. Header Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Shield size={14} />
            <span>System Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Overview of overall platform analytics, registered users, and active project listings.
          </p>
        </div>
        <div className="flex gap-3 z-10 w-full sm:w-auto">
          <Link
            to="/admin/users"
            className="flex-1 sm:flex-none bg-primary hover:bg-secondary text-white px-5 py-2.5 rounded-xl font-medium text-sm text-center shadow-xs transition-colors"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/projects"
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm text-center border border-slate-700 transition-colors"
          >
            Moderate Projects
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Top Executive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Users</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{stats?.totalUsers || 0}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-emerald-600">{stats?.entrepreneurs || 0} Entrepreneurs</span>
              <span>•</span>
              <span className="font-semibold text-purple-600">{stats?.investors || 0} Investors</span>
            </div>
          </div>
          <Link to="/admin/users" className="mt-4 w-full flex justify-between items-center text-xs text-primary font-semibold pt-3 border-t border-gray-100">
            <span>View All Accounts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 2: Total Projects */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <FolderOpen size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Projects</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{stats?.totalProjects || 0}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-emerald-600">{stats?.publishedProjects || 0} Active</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{stats?.draftProjects || 0} Drafts</span>
            </div>
          </div>
          <Link to="/admin/projects" className="mt-4 w-full flex justify-between items-center text-xs text-primary font-semibold pt-3 border-t border-gray-100">
            <span>Moderate Listings</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Card 3: Investment Offers */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deals & Offers</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{stats?.totalRequests || 0}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-emerald-600">{stats?.acceptedRequests || 0} Completed</span>
            </div>
          </div>
          <div className="mt-4 w-full flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span>System Pipeline</span>
            <Activity size={14} />
          </div>
        </div>

        {/* Card 4: Proposed Capital */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4">
              <DollarSign size={24} />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Proposed Capital</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">${(stats?.totalProposedCapital || 0).toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-emerald-600">${(stats?.totalAcceptedCapital || 0).toLocaleString()} Funded</span>
            </div>
          </div>
          <div className="mt-4 w-full flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span>Platform Volume</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* 3. Detailed Quick Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* User Roles Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserCheck className="text-primary" size={20} />
                User Account Distribution
              </h2>
              <Link to="/admin/users" className="text-xs font-semibold text-primary hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">Entrepreneurs</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.entrepreneurs || 0}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-semibold text-gray-800">Investors</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.investors || 0}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-gray-800">Admins & Super Admins</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.admins || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Status Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="text-primary" size={20} />
                Project Publication Status
              </h2>
              <Link to="/admin/projects" className="text-xs font-semibold text-primary hover:underline">
                Review All
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">Published / Active</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.publishedProjects || 0}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold text-gray-800">Drafts</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.draftProjects || 0}</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-gray-800">Pending Review</span>
                </div>
                <span className="font-extrabold text-gray-900 text-sm">{stats?.pendingProjects || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
