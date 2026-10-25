import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Artificial Intelligence & Data Science',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const AVATAR_OPTIONS = [
  { id: 'avatar-1', label: 'Indigo', bg: 'bg-indigo-600' },
  { id: 'avatar-2', label: 'Emerald', bg: 'bg-emerald-600' },
  { id: 'avatar-3', label: 'Violet', bg: 'bg-purple-600' },
  { id: 'avatar-4', label: 'Amber', bg: 'bg-amber-600' },
  { id: 'avatar-5', label: 'Rose', bg: 'bg-rose-600' },
  { id: 'avatar-6', label: 'Cyan', bg: 'bg-cyan-600' },
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || DEPARTMENTS[0],
    year: user?.year || YEARS[0],
    semester: user?.semester || 1,
    bio: user?.bio || '',
    avatar: user?.avatar || 'avatar-1',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ message: '', type: '' });
  const [passwordFeedback, setPasswordFeedback] = useState({ message: '', type: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileFeedback({ message: '', type: '' });

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data?.success) {
        updateUser(res.data.data);
        setProfileFeedback({ message: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => setProfileFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileFeedback({
        message: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ message: '', type: '' });

    if (passwordData.newPassword.length < 6) {
      setPasswordFeedback({
        message: 'New password must be at least 6 characters long.',
        type: 'error',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({
        message: 'New passwords do not match.',
        type: 'error',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        setPasswordFeedback({ message: 'Password changed successfully!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordFeedback({
        message: err.response?.data?.message || 'Failed to change password.',
        type: 'error',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const selectedAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === profileData.avatar) || AVATAR_OPTIONS[0];

  const initials = profileData.name
    ? profileData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ED';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 py-10 sm:py-14 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Manage your student details, academic information, and security preferences.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Academic Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* TAB 1: Academic Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 sm:p-9 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            {profileFeedback.message && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex items-center gap-2 text-sm font-semibold ${
                  profileFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
                }`}
              >
                {profileFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Profile Avatar Color
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-xs ${selectedAvatarObj.bg}`}
                  >
                    {initials}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setProfileData({ ...profileData, avatar: opt.id })}
                        className={`w-8 h-8 rounded-xl ${opt.bg} transition-all cursor-pointer ${
                          profileData.avatar === opt.id
                            ? 'ring-2 ring-zinc-950 dark:ring-white ring-offset-2 dark:ring-offset-zinc-900 scale-110'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title={opt.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium transition-colors"
                  />
                </div>

                {/* Email Address (read-only) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Department</label>
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Year of Study
                  </label>
                  <select
                    value={profileData.year}
                    onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">Semester</label>
                  <select
                    value={profileData.semester}
                    onChange={(e) =>
                      setProfileData({ ...profileData, semester: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Academic Bio / Interests
                </label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="E.g., Interested in Operating Systems, Cloud Architecture, and Database Systems..."
                  className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm resize-none bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm shadow-xs transition cursor-pointer disabled:opacity-75"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-7 sm:p-9 border border-zinc-200 dark:border-zinc-800 shadow-xs max-w-2xl transition-colors">
            {passwordFeedback.message && (
              <div
                className={`mb-6 p-4 rounded-2xl border flex items-center gap-2 text-sm font-semibold ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter a secure new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-type your new password"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 text-sm font-medium transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm shadow-xs transition cursor-pointer disabled:opacity-75"
                >
                  {changingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
