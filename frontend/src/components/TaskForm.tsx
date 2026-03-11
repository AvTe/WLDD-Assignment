import React, { useState, useEffect } from 'react';
import { Task, CreateTaskData, UpdateTaskData } from '../lib/api';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>;
  initialData?: Task | null;
  onCancel?: () => void;
  isEdit?: boolean;
}

const inputClasses =
  'w-full px-3 py-2.5 text-sm bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-primary dark:focus:border-accent transition-colors';

const labelClasses =
  'block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2';

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onCancel, isEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setStatus(initialData.status);
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: CreateTaskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: new Date(dueDate).toISOString(),
      };
      await onSubmit(data);

      if (!isEdit) {
        setTitle('');
        setDescription('');
        setStatus('pending');
        setDueDate('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-6 mb-8"
    >
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-5">
        {isEdit ? 'Edit Task' : 'New Task'}
      </h3>

      {error && (
        <div className="border border-accent/30 bg-accent/5 text-accent text-sm p-3 rounded-lg mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className={inputClasses}
            placeholder="Task title"
          />
        </div>

        <div>
          <label className={labelClasses}>Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className={inputClasses}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={3}
            className={inputClasses + ' resize-none'}
            placeholder="Optional description"
          />
        </div>

        <div>
          <label className={labelClasses}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'completed')}
            className={inputClasses}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary dark:bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium px-5 py-2.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
