'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { getAvatarUrl } from '@/lib/utils';
import { Loader2, Upload, Save, Lock } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = e => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(profileData).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) return toast.error('Passwords do not match');
    if (pwData.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      toast.success('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Profile Settings</h1>
        <p className="text-surface-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleProfileUpdate} className="card p-6 space-y-5">
        <h2 className="font-semibold text-surface-900">Personal Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src={avatarPreview || getAvatarUrl(user?.avatar, user?.username || 'u')}
              alt="Avatar" width={80} height={80}
              className="w-full h-full object-cover" unoptimized
            />
          </div>
          <label className="btn-secondary cursor-pointer text-sm">
            <Upload className="w-4 h-4" /> Change photo
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Display Name</label>
            <input type="text" className="input"
              value={profileData.displayName}
              onChange={e => setProfileData(p => ({ ...p, displayName: e.target.value }))}
              maxLength={60} />
          </div>
          <div>
            <label className="label">Username</label>
            <input type="text" className="input bg-surface-50 text-surface-500 cursor-not-allowed"
              value={user?.username || ''} readOnly />
            <p className="text-xs text-surface-400 mt-1">Cannot be changed</p>
          </div>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3}
            placeholder="Tell your community a bit about yourself..."
            value={profileData.bio}
            onChange={e => setProfileData(p => ({ ...p, bio: e.target.value }))}
            maxLength={500} />
          <p className="text-xs text-surface-400 mt-1">{profileData.bio.length}/500</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" placeholder="Hyderabad, India"
              value={profileData.location}
              onChange={e => setProfileData(p => ({ ...p, location: e.target.value }))}
              maxLength={100} />
          </div>
          <div>
            <label className="label">Website</label>
            <input type="url" className="input" placeholder="https://yourwebsite.com"
              value={profileData.website}
              onChange={e => setProfileData(p => ({ ...p, website: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="card p-6 space-y-5">
        <h2 className="font-semibold text-surface-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-surface-400" /> Change Password
        </h2>

        <div>
          <label className="label">Current Password</label>
          <input type="password" className="input"
            value={pwData.currentPassword}
            onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
            required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input"
              value={pwData.newPassword}
              onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
              minLength={6} required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input"
              value={pwData.confirmPassword}
              onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
              required />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="card p-6 border-red-100">
        <h2 className="font-semibold text-red-600 mb-3">Danger Zone</h2>
        <p className="text-sm text-surface-500 mb-4">These actions are irreversible. Proceed with caution.</p>
        <button className="text-sm font-medium text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
