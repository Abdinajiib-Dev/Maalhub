import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { 
  Users, 
  Search, 
  Trash2, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useDialog } from '../../contexts/DialogContext';

const UsersManagement = () => {
  const { confirm, showAlert, toast } = useDialog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await api.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      showAlert({
        title: 'Role Update Failed',
        message: err.message || 'Failed to update user role',
        variant: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerificationChange = async (userId, newStatus) => {
    try {
      setUpdatingId(userId);
      await api.updateUserVerification(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, verification_status: newStatus } : u));
    } catch (err) {
      alert(`Failed to update verification status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const ok = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to delete profile for "${userName}"? This cannot be undone.`,
      confirmText: 'Delete User',
      variant: 'danger'
    });
    if (!ok) return;

    try {
      setUpdatingId(userId);
      await api.deleteUserAdmin(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success(`User "${userName}" was deleted.`);
    } catch (err) {
      showAlert({
        title: 'Delete User Failed',
        message: err.message || 'Failed to delete user account',
        variant: 'error'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || (user.role || '').toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-primary" size={28} />
            User Account Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage user roles, privileges, and system profiles across MaalHub.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-2xs"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'entrepreneur', 'investor', 'admin', 'super_admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto mb-3"></div>
            Loading profiles...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No matching user accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">ID Document</th>
                  <th className="py-3.5 px-6">Verification</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(user => {
                  const roleLower = (user.role || 'entrepreneur').toLowerCase();
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={roleLower}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100 focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value="entrepreneur">Entrepreneur</option>
                          <option value="investor">Investor</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      <td className="py-4 px-6">
                        {user.id_document_type ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-800">
                              <span>
                                {user.id_document_type === 'Passport' ? '🛂' : user.id_document_type === 'National ID' ? '🪪' : '📜'}
                              </span>
                              <span>{user.id_document_type}</span>
                            </div>
                            {user.id_document_number && (
                              <p className="text-[11px] text-gray-500 font-mono">
                                #{user.id_document_number}
                              </p>
                            )}
                            {user.id_document_url ? (
                              <a
                                href={user.id_document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                              >
                                <ExternalLink size={12} />
                                View Document
                              </a>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No file attached</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={(user.verification_status || 'pending').toLowerCase()}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleVerificationChange(user.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                            user.verification_status === 'verified'
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : user.verification_status === 'rejected'
                              ? 'bg-red-50/70 text-red-700 border-red-200'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="verified">✅ Verified</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-gray-600 text-xs">
                        {user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city || 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-gray-500 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.full_name || user.email)}
                          disabled={updatingId === user.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                          title="Delete User Profile"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
