import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { authAPI } from '../lib/api';

const inputBase =
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent';
const inputLight = 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400';
const inputDark = 'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500';
const inputClasses = `${inputBase} ${inputLight} ${inputDark}`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setSuccess(true);
      if (res.data.resetToken) {
        setResetLink(`/reset-password?token=${res.data.resetToken}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>Forgot Password — TaskTracker</title></Head>
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
              <h2 className="text-[28px] font-bold text-white leading-tight">Don&apos;t Worry,<br />We Got You</h2>
              <p className="text-white/50 mt-2 text-sm max-w-xs">Everyone forgets sometimes. We&apos;ll help you get back on track.</p>
              <div className="flex gap-1.5 mt-4">
                <span className="w-5 h-1 rounded-full bg-white/30" />
                <span className="w-7 h-1 rounded-full bg-white" />
                <span className="w-5 h-1 rounded-full bg-white/30" />
              </div>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className="flex-1 flex flex-col justify-center px-7 sm:px-10 lg:px-12 py-6">
            <div className="max-w-[360px] mx-auto w-full">
              {!success ? (
                <>
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Reset your password</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 mb-6">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>

                  {error && (
                    <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs p-2.5 mb-4">{error}</div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" className={inputClasses} />

                    <button type="submit" disabled={loading}
                      className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 mt-6">
                    Remember your password?{' '}
                    <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link>
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
                  <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Check your email</h1>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 max-w-xs mx-auto">We&apos;ve sent a password reset link to <strong className="text-neutral-700 dark:text-neutral-300">{email}</strong>.</p>

                  {resetLink && (
                    <Link href={resetLink}
                      className="inline-block mt-5 bg-accent text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
                      Reset Password (Dev)
                    </Link>
                  )}

                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-6">
                    <Link href="/login" className="text-accent hover:underline font-medium">← Back to Sign In</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
