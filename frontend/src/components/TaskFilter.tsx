import React from 'react';

interface TaskFilterProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ statusFilter, onStatusChange }) => {
  return (
    <div className="flex items-center gap-1 mb-8">
      {['all', 'pending', 'completed'].map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`text-sm px-4 py-1.5 font-medium transition-colors border rounded-md ${
            statusFilter === status
              ? 'bg-primary dark:bg-accent text-white border-primary dark:border-accent'
              : 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default TaskFilter;
