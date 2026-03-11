import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      {/* Hero */}
      <div className="py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.1]">
            Track tasks,
            <br />
            <span className="text-primary dark:text-accent">stay focused.</span>
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 mt-6 leading-relaxed max-w-lg">
            A minimal task manager for people who value clarity. Create, organize, and complete your work without the noise.
          </p>
          <div className="flex gap-4 mt-10">
            <Link
              href="/signup"
              className="bg-primary dark:bg-accent text-white text-sm font-medium px-6 py-3 hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-6 py-3 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      {/* Features */}
      <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-accent mb-3">
            01
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Simple Task Management
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Add tasks with titles, descriptions, and due dates. Mark them done when you&apos;re finished.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-accent mb-3">
            02
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Filter &amp; Focus
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Filter by status to see only what matters. Pending, completed, or everything at once.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary dark:text-accent mb-3">
            03
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Fast &amp; Cached
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Redis-backed caching loads your tasks instantly. Edits invalidate the cache automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
