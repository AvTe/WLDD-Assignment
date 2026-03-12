import React, { useState } from 'react';
import { Task, UpdateTaskData } from '../lib/api';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function dueInfo(d: string) {
  const date = new Date(d); const now = new Date();
  date.setHours(0,0,0,0); now.setHours(0,0,0,0);
  const diff = Math.round((date.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, cls: 'text-red-500' };
  if (diff === 0) return { text: 'Due today', cls: 'text-amber-500' };
  if (diff === 1) return { text: 'Due tomorrow', cls: 'text-emerald-500' };
  return { text: `${diff} days left`, cls: 'text-neutral-500 dark:text-neutral-400' };
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose, onEdit, onDelete, onToggleStatus }) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'details'>('details');

  if (!task) return null;

  const due = dueInfo(task.dueDate);
  const isPending = task.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-[560px] max-h-[88vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl dark:shadow-black/50 border border-neutral-200/60 dark:border-neutral-700/40 mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">{task.title}</h2>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-neutral-500 dark:text-neutral-400">Created</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium ml-auto">{fmtDateTime(task.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-neutral-500 dark:text-neutral-400">Status</span>
            <span className={`ml-auto text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isPending
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>{task.status}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-neutral-500 dark:text-neutral-400">Due Date</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium ml-auto">{fmtDate(task.dueDate)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-neutral-500 dark:text-neutral-400">Deadline</span>
            <span className={`font-medium ml-auto ${due.cls}`}>{due.text}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-100 dark:border-neutral-800" />

        {/* Tabs */}
        <div className="px-6 pt-3 flex gap-1">
          {(['details', 'activity'] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {activeTab === 'details' && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Description</h3>
              {task.description ? (
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-sm text-neutral-400 dark:text-neutral-600 italic">No description provided.</p>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-neutral-200 dark:bg-neutral-700" />

                <div className="relative pb-4">
                  <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-accent bg-white dark:bg-neutral-900" />
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Task <strong>&ldquo;{task.title}&rdquo;</strong> was created
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">{fmtDateTime(task.createdAt)}</p>
                </div>

                {task.status === 'completed' && (
                  <div className="relative pb-4">
                    <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white dark:bg-neutral-900" />
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Status changed to <span className="font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">Recently</p>
                  </div>
                )}

                {new Date(task.dueDate) < new Date() && task.status === 'pending' && (
                  <div className="relative pb-4">
                    <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full border-2 border-red-500 bg-white dark:bg-neutral-900" />
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Task became <span className="font-semibold text-red-500">overdue</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-0.5">{fmtDate(task.dueDate)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80">
          <button type="button" onClick={() => onToggleStatus(task)}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-colors ${
              isPending
                ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                : 'border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}>
            {isPending ? 'Mark Complete' : 'Mark Pending'}
          </button>
          <button type="button" onClick={() => onEdit(task)}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            Edit
          </button>
          <div className="flex-1" />
          <button type="button" onClick={() => { onDelete(task._id); onClose(); }}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
