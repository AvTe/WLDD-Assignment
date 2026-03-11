import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <>
      <Head>
        <title>TaskTracker — Think, plan, and track</title>
      </Head>

      <div className="h-screen flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        {/* Header */}
        <header className="shrink-0 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-2 gap-[3px]">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-neutral-900 rounded-full" />
                </div>
              </div>
              <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                TaskTracker
              </span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'About', 'How it works', 'Pricing'].map((item) => (
                <span
                  key={item}
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-default transition-colors duration-200 relative group"
                >
                  {item}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-primary dark:bg-accent group-hover:w-full transition-all duration-300" />
                </span>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors duration-200 hover:rotate-12 transform"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>

              <Link
                href="/login"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium px-5 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 hover:border-neutral-900 dark:hover:border-white transition-all duration-300"
              >
                Get demo
              </Link>
            </div>
          </div>
        </header>

        {/* Content — vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Logo icon */}
          <div className="w-14 h-14 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center mb-10 hover:scale-110 hover:rotate-6 transition-transform duration-300">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2.5 h-2.5 bg-primary dark:bg-primary rounded-full" />
              <div className="w-2.5 h-2.5 bg-primary dark:bg-primary rounded-full" />
              <div className="w-2.5 h-2.5 bg-primary dark:bg-primary rounded-full" />
              <div className="w-2.5 h-2.5 bg-neutral-900 dark:bg-neutral-900 rounded-full" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.1]">
            Think, plan, and track
          </h1>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-400 dark:text-neutral-600 leading-[1.1] mt-1">
            all in one place
          </h2>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 mt-6 max-w-md">
            Efficiently manage your tasks and boost productivity.
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="mt-8 bg-primary dark:bg-accent text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-300"
          >
            Get free demo
          </Link>

          {/* Floating cards */}
          <div className="relative w-full max-w-5xl mt-16">
            {/* Left card */}
            <div className="absolute left-0 -top-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 w-60 hidden lg:block shadow-sm hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Today&apos;s tasks</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[11px] text-neutral-700 dark:text-neutral-300">Complete proposal</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">60%</span>
                </div>
                <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/5 bg-blue-500 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] text-neutral-700 dark:text-neutral-300">Setup CI/CD</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">100%</span>
                </div>
                <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-accent rounded-full" />
                </div>
              </div>
            </div>

            {/* Right card */}
            <div className="absolute right-0 -top-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 w-56 hidden lg:block shadow-sm hover:-translate-y-2 hover:shadow-md transition-all duration-300">
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Quick Stats</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">Completed</span>
                  <span className="text-[11px] font-bold text-emerald-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">In Progress</span>
                  <span className="text-[11px] font-bold text-amber-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">Overdue</span>
                  <span className="text-[11px] font-bold text-red-500">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
