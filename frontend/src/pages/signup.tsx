import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

const inputBase =
  'w-full px-4 py-2.5 text-sm rounded-xl transition-all focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent';
const inputLight = 'bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400';
const inputDark = 'dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500';
const inputClasses = `${inputBase} ${inputLight} ${inputDark}`;

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreed) { setError('Please agree to the Terms & Conditions'); return; }
    setLoading(true);
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    try {
      await signup(fullName, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try { await googleLogin(); router.push('/dashboard'); }
    catch (err: any) { setError(err.message || 'Google sign-up failed.'); }
    finally { setLoading(false); }
  };

  if (authLoading) return null;

  return (
    <>
      <Head><title>Create Account — TaskTracker</title></Head>
      <div className="h-screen w-screen overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-[1100px] h-[min(680px,94vh)] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl dark:shadow-black/40 flex overflow-hidden border border-neutral-200/60 dark:border-neutral-700/40">

          {/* ── Left: Image Panel ── */}
          <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden rounded-2xl m-2.5">
            <img src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80"
              alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
              <span className="text-white font-bold text-lg tracking-tight">TaskTracker</span>
              <Link href="/" className="text-[11px] text-white/70 hover:text-white bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
                Back to website →
              </Link>
            </div>
            <div className="absolute bottom-7 left-7 right-7 z-10">
              <h2 className="text-[28px] font-bold text-white leading-tight">Capturing Moments,<br />Creating Memories</h2>
              <p className="text-white/50 mt-2 text-sm max-w-xs">Join thousands organizing their work with TaskTracker.</p>
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
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Create an account</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 mb-5">
                Already have an account?{' '}
                <Link href="/login" className="text-accent hover:underline font-medium">Log in</Link>
              </p>

              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs p-2.5 mb-3">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required minLength={2} maxLength={50} placeholder="First name" className={inputClasses} />
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inputClasses} />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" className={inputClasses} />
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Enter your password" className={`${inputClasses} pr-11`} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 dark:border-neutral-600 text-accent focus:ring-accent/30 bg-white dark:bg-neutral-800 accent-accent" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    I agree to the <span className="text-accent underline">Terms &amp; Conditions</span>
                  </span>
                </label>

                <button type="submit" disabled={loading}
                  className="w-full bg-accent text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40">
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-700" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-neutral-400 dark:text-neutral-500">Or register with</span>
                </div>
              </div>

              {/* Social — side by side */}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={handleGoogle} disabled={loading}
                  className="flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button type="button" disabled
                  className="flex items-center justify-center gap-2 border border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 text-sm font-medium py-2.5 rounded-xl cursor-not-allowed">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.254-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.646.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  GitHub
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
