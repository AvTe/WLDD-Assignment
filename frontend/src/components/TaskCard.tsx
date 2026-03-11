import React from 'react';
import { Task } from '../lib/api';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 rounded-xl transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h4
              className={`font-medium text-[15px] truncate ${
                task.status === 'completed'
                  ? 'line-through text-neutral-400 dark:text-neutral-600'
                  : 'text-neutral-900 dark:text-neutral-100'
              }`}
            >
              {task.title}
            </h4>
            <span
              className={`text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                task.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
              }`}
            >
              {task.status}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <span
            className={`text-xs tracking-wide ${
              isOverdue
                ? 'text-accent font-medium'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            {formattedDate}
            {isOverdue && ' — Overdue'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleStatus(task)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
              task.status === 'completed'
                ? 'border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950'
                : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950'
            }`}
          >
            {task.status === 'completed' ? 'Undo' : 'Done'}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-accent/30 text-accent hover:bg-accent/5 dark:border-accent/40 dark:hover:bg-accent/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
