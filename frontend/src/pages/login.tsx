import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

const inputClasses =
  'w-full px-4 py-3 text-sm bg-neutral-900/50 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-accent transition-colors';

const labelClasses = 'block text-xs font-medium text-neutral-500 mb-2';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    router.push('/dashboard');
  };

  if (authLoading) return null;

  return (
    <>
      <Head>
        <title>Sign In — TaskTracker</title>
      </Head>
      <div className="min-h-screen flex bg-neutral-950">
        {/* Left Panel — Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-end p-12">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"
            alt="Mountain landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/30" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Stay Focused,<br />
              Stay Productive
            </h2>
            <p className="text-neutral-400 mt-4 text-sm max-w-xs">
              Organize your work. Track your progress. Achieve your goals.
            </p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="text-lg font-bold text-accent">
                TaskTracker
              </Link>
              <Link
                href="/"
                className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                ← Back to website
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-neutral-500 text-sm mb-8">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 text-accent text-sm p-3 mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className={labelClasses}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClasses}
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-accent text-white text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-neutral-950 px-4 text-xs text-neutral-600">
                    or
                  </span>
                </div>
              </div>

              {/* Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full border border-neutral-800 text-neutral-300 text-sm font-medium py-3 rounded-lg hover:border-neutral-600 hover:text-white transition-colors"
              >
                Use Demo Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
