import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../lib/api';
import Sidebar from '../components/Sidebar';

const inputClasses =
  'w-full px-4 py-3 text-sm bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-accent transition-colors';

const labelClasses = 'block text-xs font-medium text-neutral-500 mb-2';

export default function Settings() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  // Profile form
  const [name, setName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const isGoogleUser = !!(user as any)?.avatar && !(user as any)?.hasPassword;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    setProfileLoading(true);

    try {
      const res = await authAPI.updateSettings({ name });
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <>
      <Head>
        <title>Settings — TaskTracker</title>
      </Head>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
        <Sidebar pendingCount={0} completedCount={0} />

        <main className="flex-1 ml-64">
          <div className="max-w-2xl mx-auto px-6 py-12">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8 tracking-tight">
              Settings
            </h1>

            {/* Profile Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
                Profile
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-5 mb-8">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-accent/10 flex items-center justify-center text-2xl font-bold text-primary dark:text-accent border-2 border-neutral-200 dark:border-neutral-700">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-lg font-medium text-neutral-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-sm text-neutral-500">{user.email}</p>
                  {user.avatar && (
                    <span className="inline-flex items-center gap-1.5 mt-2 text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Connected with Google
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                {profileMsg && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400 text-sm p-3 mb-4">
                    {profileMsg}
                  </div>
                )}
                {profileError && (
                  <div className="rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm p-3 mb-4">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={50}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className={`${inputClasses} opacity-50 cursor-not-allowed`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="mt-6 bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Change Password
              </h2>

              {isGoogleUser ? (
                <p className="text-sm text-neutral-500 mt-4">
                  You signed in with Google. Password management is handled by your Google account.
                </p>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="mt-6">
                  {passwordMsg && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400 text-sm p-3 mb-4">
                      {passwordMsg}
                    </div>
                  )}
                  {passwordError && (
                    <div className="rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm p-3 mb-4">
                      {passwordError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className={labelClasses}>Current password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className={inputClasses}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>New password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className={inputClasses}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Confirm new password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className={inputClasses}
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="mt-6 bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
