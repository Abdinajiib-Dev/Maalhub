import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, MapPin, Calendar, Briefcase, Building, TrendingUp, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

const Profile = () => {
  const { profile, user } = useAuth();
  const [roleDetails, setRoleDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleDetails = async () => {
      try {
        setLoading(true);
        // The getProfile function in api.js fetches profile with roleDetails
        const data = await api.getUserProfile(user.id);
        setRoleDetails(data?.roleDetails || null);
      } catch (err) {
        console.error("Failed to fetch role details", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && profile?.role !== 'super_admin' && profile?.role !== 'admin') {
      fetchRoleDetails();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  if (!profile) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const userRole = (profile.role || '').toLowerCase();
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';
  const isEntrepreneur = userRole === 'entrepreneur';
  const isInvestor = userRole === 'investor';
  const basePath = isAdmin ? '/admin' : isEntrepreneur ? '/entrepreneur' : '/investor';

  const formatRoleLabel = (role) => {
    if (!role) return 'Member';
    const norm = role.toLowerCase();
    if (norm === 'super_admin') return 'Super Admin';
    if (norm === 'admin') return 'Administrator';
    if (norm === 'entrepreneur') return 'Entrepreneur';
    if (norm === 'investor') return 'Investor';
    return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your personal and professional information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Basic Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#FAF0E6] border-4 border-white shadow-md flex items-center justify-center text-primary text-3xl sm:text-4xl font-bold mb-4 overflow-hidden relative group cursor-pointer">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                getInitials(profile.full_name)
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Update Photo</span>
              </div>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{profile.full_name}</h2>
            <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-1.5 font-medium">
              {isAdmin ? (
                <ShieldCheck size={15} className="text-primary" />
              ) : isEntrepreneur ? (
                <Building size={15} className="text-primary" />
              ) : (
                <TrendingUp size={15} className="text-primary" />
              )}
              {formatRoleLabel(profile.role)}
            </p>
            
            {isAdmin ? (
              <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-6 bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shadow-xs">
                <ShieldCheck size={14} />
                {userRole === 'super_admin' ? 'Super Admin' : 'Administrator'}
              </span>
            ) : isEntrepreneur ? (
              <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-6 bg-primary/10 text-primary border border-primary/20 shadow-xs">
                Startup Founder
              </span>
            ) : (
              <span className="px-3.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-6 bg-primary/10 text-primary border border-primary/20 shadow-xs">
                Verified Investor
              </span>
            )}
            
            <Link 
              to={`${basePath}/settings`} 
              className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm py-2 rounded-lg transition-colors text-center shadow-xs block"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Demographics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Email Address</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Location</p>
                  <p className="text-sm text-gray-900 font-medium truncate">{profile.city || 'Not specified'}, {profile.country || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Date of Birth</p>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Specific Privileges & Access Card */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                Administrative Privileges & Access
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary flex-shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">System Access Level</p>
                    <p className="text-sm text-gray-900 font-semibold truncate">
                      {userRole === 'super_admin' ? 'Full Super Admin Control' : 'Administrator Control'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700 flex-shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Account Status</p>
                    <p className="text-sm text-gray-900 font-semibold truncate flex items-center gap-1">
                      Active Administrator
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700 flex-shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Platform Permissions</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      User role administration, project moderation & publication management, system statistics oversight, and administrative support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Entrepreneur / Investor Role Specific Details */}
          {!isAdmin && !loading && roleDetails && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">
                {isEntrepreneur ? 'Business Profile' : 'Investment Preferences'}
              </h3>
              
              {isEntrepreneur ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Building size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Startup Name</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{roleDetails.startup_company_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Industry</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{roleDetails.industry}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <TrendingUp size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Startup Stage</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{roleDetails.startup_stage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary flex-shrink-0">
                      <Briefcase size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Investor Type</p>
                      <p className="text-sm text-gray-900 font-medium truncate">{roleDetails.investor_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary flex-shrink-0">
                      <TrendingUp size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Investment Range</p>
                      <p className="text-sm text-gray-900 font-medium truncate">
                        ${Number(roleDetails.minimum_investment || 0).toLocaleString()} - ${Number(roleDetails.maximum_investment || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary flex-shrink-0">
                      <Layers size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 mb-0.5">Preferred Categories</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {roleDetails.target_industries && roleDetails.target_industries.length > 0 ? (
                          roleDetails.target_industries.map((ind, idx) => (
                            <span key={idx} className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              {ind}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-900 font-medium">All Categories</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
