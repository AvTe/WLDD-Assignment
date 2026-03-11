import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { taskAPI, Task, CreateTaskData, UpdateTaskData } from '../lib/api';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import TaskFilter from '../components/TaskFilter';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params: { status?: string } = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await taskAPI.getAll(params);
      setTasks(res.data.tasks);
      setError('');
    } catch (err: any) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const handleCreate = async (data: CreateTaskData | UpdateTaskData) => {
    await taskAPI.create(data as CreateTaskData);
    setShowCreateForm(false);
    // Optimistic-ish: refetch immediately
    await fetchTasks();
  };

  const handleUpdate = async (data: CreateTaskData | UpdateTaskData) => {
    if (!editingTask) return;
    await taskAPI.update(editingTask._id, data as UpdateTaskData);
    setEditingTask(null);
    await fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    // Optimistic UI: remove from list immediately
    const previousTasks = [...tasks];
    setTasks(tasks.filter((t) => t._id !== id));

    try {
      await taskAPI.delete(id);
    } catch {
      // Revert on failure
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI: update immediately
    const previousTasks = [...tasks];
    setTasks(
      tasks.map((t) =>
        t._id === task._id ? { ...t, status: newStatus } : t
      )
    );

    try {
      await taskAPI.update(task._id, { status: newStatus });
    } catch {
      // Revert on failure
      setTasks(previousTasks);
      setError('Failed to update task');
    }
  };

  if (authLoading || !user) return null;

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount} pending · {completedCount} completed · {tasks.length} total
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingTask(null);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          {showCreateForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingTask && (
        <TaskForm
          onSubmit={handleUpdate}
          initialData={editingTask}
          onCancel={() => setEditingTask(null)}
          isEdit
        />
      )}

      {/* Filters */}
      <TaskFilter statusFilter={statusFilter} onStatusChange={setStatusFilter} />

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500">No tasks found. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => {
                setEditingTask(t);
                setShowCreateForm(false);
              }}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
