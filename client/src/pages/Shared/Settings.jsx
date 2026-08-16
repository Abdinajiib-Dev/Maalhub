import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Camera, User, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setProfilePhotoUrl(profile.profile_photo_url || '');
    }
  }, [profile]);

  if (!profile) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setProfileError('');
      
      const publicUrl = await api.uploadAvatar(user.id, file);
      setProfilePhotoUrl(publicUrl);
    } catch (err) {
      console.error(err);
      setProfileError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      setProfileError('');
      setProfileSuccess(false);

      await api.updateProfile({
        full_name: fullName,
        city,
        country,
        profile_photo_url: profilePhotoUrl
      });
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      
      // We don't forcefully reload the page so they can see the success message,
      // but in a real app we might update the AuthContext state directly.
      // For now, refreshing the browser will fetch the new data.
    } catch (err) {
      console.error(err);
      setProfileError('Failed to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    try {
      setIsSavingPassword(true);
      setPasswordError('');
      setPasswordSuccess(false);

      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || 'Failed to send password reset link.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 w-full max-w-[1000px] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar Nav / Mobile Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1.5 sm:p-2 flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center md:justify-start gap-2.5 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 md:flex-none ${
                activeTab === 'profile'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={18} className={activeTab === 'profile' ? 'text-primary' : 'text-gray-400'} />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center justify-center md:justify-start gap-2.5 px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 md:flex-none ${
                activeTab === 'security'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Lock size={18} className={activeTab === 'security' ? 'text-primary' : 'text-gray-400'} />
              Security
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Profile Information</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Update your personal details and public profile picture.</p>
              </div>
              
              <div className="p-4 sm:p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 border-b border-gray-50 text-center sm:text-left">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative group">
                        {profilePhotoUrl ? (
                          <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="text-gray-400" size={32} />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="text-white" size={24} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                      </div>
                      {isUploading && (
                        <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                          <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-1">Profile Photo</h3>
                      <p className="text-xs text-gray-500 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                      <label className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer transition-colors inline-block shadow-xs">
                        {isUploading ? 'Uploading...' : 'Upload New'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                      </label>
                    </div>
                  </div>

                  {profileError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircle2 size={16} /> Profile updated successfully!
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input 
                        type="text" 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSavingProfile || isUploading}
                      className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-medium text-sm rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                    >
                      {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Security Settings</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your password and account security.</p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="max-w-md">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    We will send a password reset link to <span className="font-medium text-gray-900">{profile.email}</span>. Click the link in the email to securely choose a new password.
                  </p>

                  {passwordError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-6">
                      <CheckCircle2 size={16} /> Password reset link sent to your email!
                    </div>
                  )}

                  <button 
                    onClick={handleSendResetLink}
                    disabled={isSavingPassword}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                  >
                    {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} className="text-gray-400" />}
                    Send Password Reset Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
