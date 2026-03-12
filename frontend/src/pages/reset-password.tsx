import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { authAPI } from '../lib/api';

const inputBase =
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent';
const inputLight = 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400';
const inputDark = 'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500';
const inputClasses = `${inputBase} ${inputLight} ${inputDark}`;

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ token: token as string, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Token may have expired.');
    } finally { setLoading(false); }
  };

  const EyeOpen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
  const EyeClosed = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  );

  return (
    <>
      <Head><title>Reset Password — TaskTracker</title></Head>
      <div className="h-screen w-screen overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-[1100px] h-[min(680px,94vh)] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl dark:shadow-black/40 flex overflow-hidden border border-neutral-200/60 dark:border-neutral-700/40">

          {/* ── Left: Image Panel ── */}
          <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden rounded-2xl m-2.5">
            <img src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1200&q=80"
              alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
              <span className="text-white font-bold text-lg tracking-tight">TaskTracker</span>
              <Link href="/" className="text-[11px] text-white/70 hover:text-white bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
                Back to website →
              </Link>
            </div>
            <div className="absolute bottom-7 left-7 right-7 z-10">
              <h2 className="text-[28px] font-bold text-white leading-tight">Almost There,<br />Set a New Password</h2>
              <p className="text-white/50 mt-2 text-sm max-w-xs">Choose a strong password to keep your account secure.</p>
              <div className="flex gap-1.5 mt-4">
                <span className="w-5 h-1 rounded-full bg-white/30" />
                <span className="w-5 h-1 rounded-full bg-white/30" />
                <span className="w-7 h-1 rounded-full bg-white" />
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="flex-1 flex flex-col justify-center px-7 sm:px-10 lg:px-12 py-6">
            <div className="max-w-[360px] mx-auto w-full">
              {!success ? (
                <>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Create new password</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 mb-6">
                    Your new password must be at least 6 characters long.
                  </p>

                  {error && (
                    <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs p-2.5 mb-4">{error}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="New password" className={`${inputClasses} pr-11`} />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                        {showPw ? <EyeClosed /> : <EyeOpen />}
                      </button>
                    </div>

                    <div className="relative">
                      <input type={showCpw ? 'text' : 'password'} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required minLength={6} placeholder="Confirm new password" className={`${inputClasses} pr-11`} />
                      <button type="button" onClick={() => setShowCpw(!showCpw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                        {showCpw ? <EyeClosed /> : <EyeOpen />}
                      </button>
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 mt-6">
                    <Link href="/login" className="text-accent hover:underline font-medium">← Back to Sign In</Link>
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Password Reset!</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 max-w-xs mx-auto">Your password has been changed. You can now sign in with your new password.</p>
                  <Link href="/login"
                    className="inline-block mt-5 bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                    Go to Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
