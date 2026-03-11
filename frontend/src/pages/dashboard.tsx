import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { taskAPI, Task, CreateTaskData, UpdateTaskData } from '../lib/api';
import TaskForm from '../components/TaskForm';
import Sidebar from '../components/Sidebar';

const INITIAL_DEMO_TASKS: Task[] = [
  {
    _id: 'd1',
    title: 'Review design mockups',
    description: 'Review and provide feedback on the new dashboard design',
    status: 'completed',
    dueDate: '2026-03-08T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    _id: 'd2',
    title: 'Complete project proposal',
    description: 'Draft and finalize the Q2 project proposal document',
    status: 'pending',
    dueDate: '2026-03-15T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-02T14:30:00.000Z',
  },
  {
    _id: 'd3',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'pending',
    dueDate: '2026-03-20T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-05T09:15:00.000Z',
  },
  {
    _id: 'd4',
    title: 'Write unit tests',
    description: 'Achieve 80%+ code coverage on backend API routes',
    status: 'completed',
    dueDate: '2026-03-09T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-03T16:45:00.000Z',
  },
  {
    _id: 'd5',
    title: 'Update API documentation',
    description: 'Document all REST endpoints with request/response examples',
    status: 'pending',
    dueDate: '2026-03-12T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-07T11:00:00.000Z',
  },
  {
    _id: 'd6',
    title: 'Deploy to staging',
    description: 'Push latest build to staging environment for QA',
    status: 'pending',
    dueDate: '2026-03-18T00:00:00.000Z',
    owner: 'demo-user',
    createdAt: '2026-03-09T08:30:00.000Z',
  },
];

/* ─── Helper Components ─── */

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary dark:bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  if (diffDays === 0) return { text: 'Today', isOverdue: false };
  if (diffDays === 1) return { text: 'Tomorrow', isOverdue: false };
  return { text: `${diffDays} days left`, isOverdue: false };
}

/* ─── Dashboard ─── */

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const isDemoMode = token === 'demo-token';

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [demoTasks, setDemoTasks] = useState<Task[]>(INITIAL_DEMO_TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchTasks = useCallback(async () => {
    if (isDemoMode) {
      setAllTasks(demoTasks);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await taskAPI.getAll();
      setAllTasks(res.data.tasks);
      setError('');
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoTasks]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user, fetchTasks]);

  /* Derived data */
  const pendingTasks = useMemo(() => allTasks.filter((t) => t.status === 'pending'), [allTasks]);
  const completedTasks = useMemo(() => allTasks.filter((t) => t.status === 'completed'), [allTasks]);
  const overdueTasks = useMemo(
    () => pendingTasks.filter((t) => new Date(t.dueDate) < new Date()),
    [pendingTasks]
  );
  const recentActivity = useMemo(
    () => [...allTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [allTasks]
  );

  /* Handlers */
  const handleCreate = async (data: CreateTaskData | UpdateTaskData) => {
    if (isDemoMode) {
      const newTask: Task = {
        _id: `d${Date.now()}`,
        title: (data as CreateTaskData).title,
        description: (data as CreateTaskData).description || '',
        status: 'pending',
        dueDate: (data as CreateTaskData).dueDate,
        owner: 'demo-user',
        createdAt: new Date().toISOString(),
      };
      setDemoTasks((prev) => [newTask, ...prev]);
      setShowCreateForm(false);
      return;
    }
    await taskAPI.create(data as CreateTaskData);
    setShowCreateForm(false);
    await fetchTasks();
  };

  const handleUpdate = async (data: CreateTaskData | UpdateTaskData) => {
    if (!editingTask) return;
    if (isDemoMode) {
      setDemoTasks((prev) => prev.map((t) => (t._id === editingTask._id ? { ...t, ...data } : t)));
      setEditingTask(null);
      return;
    }
    await taskAPI.update(editingTask._id, data as UpdateTaskData);
    setEditingTask(null);
    await fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    if (isDemoMode) {
      setDemoTasks((prev) => prev.filter((t) => t._id !== id));
      return;
    }
    const prev = [...allTasks];
    setAllTasks(allTasks.filter((t) => t._id !== id));
    try { await taskAPI.delete(id); } catch { setAllTasks(prev); setError('Failed to delete task'); }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (isDemoMode) {
      setDemoTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
      return;
    }
    const prev = [...allTasks];
    setAllTasks(allTasks.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    try { await taskAPI.update(task._id, { status: newStatus }); } catch { setAllTasks(prev); }
  };

  if (authLoading || !user) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <Head><title>Dashboard — TaskTracker</title></Head>

      <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Sidebar */}
        <Sidebar pendingCount={pendingTasks.length} completedCount={completedTasks.length} />

        {/* Main content */}
        <main className="flex-1 ml-64 min-h-screen">
          {/* Top bar */}
          <div className="sticky top-0 z-20 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-600">{today}</p>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {greeting}, {user.name?.split(' ')[0]}
                </h1>
              </div>
              <button
                onClick={() => { setShowCreateForm(!showCreateForm); setEditingTask(null); }}
                className={`text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                  showCreateForm
                    ? 'border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    : 'bg-primary dark:bg-accent text-white hover:opacity-90'
                }`}
              >
                {showCreateForm ? (
                  'Cancel'
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add New
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Demo Banner */}
            {isDemoMode && (
              <div className="border border-accent/20 bg-accent/5 text-accent text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                Demo mode — data is stored locally and resets on page refresh.
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="border border-accent/30 bg-accent/5 text-accent text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
              <TaskForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
            )}
            {editingTask && (
              <TaskForm onSubmit={handleUpdate} initialData={editingTask} onCancel={() => setEditingTask(null)} isEdit />
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Tasks"
                value={allTasks.length}
                color="bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>}
              />
              <StatCard
                label="In Progress"
                value={pendingTasks.length}
                color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              />
              <StatCard
                label="Completed"
                value={completedTasks.length}
                color="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
              />
              <StatCard
                label="Overdue"
                value={overdueTasks.length}
                color="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
              />
            </div>

            {/* Progress */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Completion Progress</h2>
                <span className="text-xs text-neutral-400">{completedTasks.length} of {allTasks.length} done</span>
              </div>
              <ProgressBar value={completedTasks.length} max={allTasks.length} />
            </div>

            {/* Two column layout: Tasks + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Pending Tasks Table */}
              <div className="lg:col-span-2 space-y-6">
                {/* Pending Tasks */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">To Do</h2>
                      <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        {pendingTasks.length} tasks
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="px-6 py-12 text-center text-neutral-400 text-sm">Loading...</div>
                  ) : pendingTasks.length === 0 ? (
                    <div className="px-6 py-12 text-center text-neutral-400 dark:text-neutral-600 text-sm">
                      All caught up! No pending tasks.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {/* Table header */}
                      <div className="grid grid-cols-12 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                        <div className="col-span-5">Name</div>
                        <div className="col-span-3">Due Date</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      {pendingTasks.map((task) => {
                        const due = formatDueDate(task.dueDate);
                        return (
                          <div key={task._id} className="grid grid-cols-12 items-center px-6 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                            <div className="col-span-5 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-neutral-400 dark:text-neutral-600 truncate mt-0.5">{task.description}</p>
                              )}
                            </div>
                            <div className="col-span-3">
                              <span className={`text-xs ${due.isOverdue ? 'text-red-500 font-medium' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                {due.text}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[11px] uppercase tracking-wider font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                Pending
                              </span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleToggleStatus(task)}
                                className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                                title="Mark complete"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              </button>
                              <button
                                onClick={() => { setEditingTask(task); setShowCreateForm(false); }}
                                className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                title="Edit"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button
                                onClick={() => handleDelete(task._id)}
                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Completed</h2>
                      <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        {completedTasks.length} tasks
                      </span>
                    </div>
                  </div>

                  {completedTasks.length === 0 ? (
                    <div className="px-6 py-10 text-center text-neutral-400 dark:text-neutral-600 text-sm">
                      No completed tasks yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {completedTasks.map((task) => (
                        <div key={task._id} className="flex items-center justify-between px-6 py-3.5 group hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <p className="text-sm text-neutral-400 dark:text-neutral-600 line-through truncate">{task.title}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => handleToggleStatus(task)}
                              className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline px-2 py-1"
                            >
                              Undo
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Activity + Quick Stats */}
              <div className="space-y-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recent Activity</h2>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {recentActivity.length === 0 ? (
                      <div className="px-5 py-8 text-center text-neutral-400 text-xs">No activity yet</div>
                    ) : recentActivity.map((task) => (
                      <div key={task._id} className="px-5 py-3 flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">
                            {task.status === 'completed' ? 'Completed' : 'Created'} · {formatRelativeDate(task.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task Breakdown */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Task Breakdown</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Pending</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{pendingTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Completed</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{completedTasks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">Overdue</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{overdueTasks.length}</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Upcoming Deadlines</h2>
                  </div>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {pendingTasks
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 4)
                      .map((task) => {
                        const due = formatDueDate(task.dueDate);
                        return (
                          <div key={task._id} className="px-5 py-3 flex items-center justify-between">
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1 mr-3">{task.title}</p>
                            <span className={`text-[11px] font-medium shrink-0 ${
                              due.isOverdue ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'
                            }`}>
                              {due.text}
                            </span>
                          </div>
                        );
                      })}
                    {pendingTasks.length === 0 && (
                      <div className="px-5 py-8 text-center text-neutral-400 text-xs">No upcoming deadlines</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
