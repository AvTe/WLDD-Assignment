import React, { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '../lib/api';
import DatePicker from './DatePicker';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  initialData?: Task | null;
  isEdit?: boolean;
}

const inputBase =
  'w-full px-3.5 py-2.5 text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent transition-all';

const labelCls =
  'block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AddTaskModal: React.FC<AddTaskModalProps> = ({ open, onClose, onSubmit, initialData, isEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
    } else {
      setTitle(''); setDescription(''); setStatus('pending'); setDueDate(''); setColor(COLORS[0]);
    }
    setError('');
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!dueDate) { setError('Due date is required'); return; }
    setError(''); setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: new Date(dueDate).toISOString(),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[480px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl dark:shadow-black/50 border border-neutral-200/60 dark:border-neutral-700/40 mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs p-2.5 mb-4">{error}</div>
          )}

          {/* Title */}
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Title *</span>
            </div>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" maxLength={200} className={inputBase} autoFocus />
          </div>

          {/* Status toggle */}
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</span>
            </div>
            <div className="flex gap-2">
              {(['pending', 'completed'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
                    status === s
                      ? s === 'pending'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Due Date *</span>
            </div>
            <DatePicker value={dueDate} onChange={setDueDate} required />
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
                <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Description</span>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description…" maxLength={2000} rows={3}
              className={`${inputBase} resize-none`} />
          </div>

          {/* Color */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-neutral-400 dark:text-neutral-500 shrink-0">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Color</span>
            </div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button type="button" onClick={onClose}
              className="text-sm font-medium px-5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="text-sm font-semibold px-5 py-2 rounded-xl bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-40">
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
