
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TaskConfig, TaskStatus } from '../../types';
import { MOCK_TASKS } from '../../constants';

interface TaskContextType {
  tasks: TaskConfig[];
  addTask: (task: TaskConfig) => void;
  updateTask: (task: TaskConfig) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  isWizardOpen: boolean;
  openWizard: (task?: TaskConfig) => void;
  closeWizard: () => void;
  editingTask: TaskConfig | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<TaskConfig[]>(MOCK_TASKS);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskConfig | null>(null);

  const addTask = (task: TaskConfig) => setTasks(prev => [task, ...prev]);
  const updateTask = (task: TaskConfig) => setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const openWizard = (task?: TaskConfig) => {
    setEditingTask(task || null);
    setIsWizardOpen(true);
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    setEditingTask(null);
  };

  return (
    <TaskContext.Provider value={{
      tasks, addTask, updateTask, deleteTask, updateTaskStatus,
      isWizardOpen, openWizard, closeWizard, editingTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
