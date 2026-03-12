import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../../components/TaskCard';
import { Task } from '../../lib/api';

const mockTask: Task = {
  _id: 'sample-task-id',
  title: 'Sample Task',
  description: 'This is a sample description for testing.',
  status: 'pending',
  dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  owner: 'user1',
  createdAt: new Date().toISOString(),
};

describe('TaskCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText('Sample Task')).toBeInTheDocument();
    expect(screen.getByText('This is a sample description for testing.')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('calls onToggleStatus when status button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    const toggleButton = screen.getByText('Done');
    fireEvent.click(toggleButton);
    expect(mockOnToggleStatus).toHaveBeenCalledWith(mockTask);
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when Delete button is clicked', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('sample-task-id');
  });

  it('displays overdue status correctly', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    };

    render(
      <TaskCard
        task={overdueTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
      />
    );

    expect(screen.getByText(/— Overdue/)).toBeInTheDocument();
  });
});
