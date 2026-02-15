import { useState, useEffect, useCallback } from 'react';
import { ScheduleTask, TaskStatus, UserProgress } from '@/types';
import { 
  fetchSchedule, 
  updateTaskStatus, 
  importCSV, 
  addTask, 
  deleteTask, 
  updateTask 
} from '@/api/schedule';
import { addXP, fetchProgress, saveProgress } from '@/api/progress';

export function useSchedule() {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Database එකෙන් දත්ත ලබා ගැනීම
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([fetchSchedule(), fetchProgress()]);
      setTasks(t);
      setProgress(p);
    } catch (error) {
      console.error("Failed to load schedule:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Task එකක status එක වෙනස් කිරීම (Pending -> Completed -> Missed)
  const changeStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
    
    // Local state එක update කිරීම
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

    if (status === 'completed') {
      const p = await addXP(50, 'Task completed', taskId);
      setProgress(p);
    }

    // දවසේ ප්‍රගතිය (Progress) නැවත ගණනය කිරීම
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayTasks = updatedTasks.filter(t => t.day === today);
    
    const prog = await fetchProgress();
    prog.tasksCompletedToday = todayTasks.filter(t => t.status === 'completed').length;
    prog.tasksMissedToday = todayTasks.filter(t => t.status === 'missed').length;
    prog.totalTasksToday = todayTasks.length;
    
    await saveProgress(prog);
    setProgress({ ...prog });
  }, [tasks]);

  // අලුතින් Task එකක් ඇතුළත් කිරීම
  const addNewTask = useCallback(async (taskData: Omit<ScheduleTask, 'id'>) => {
    const created = await addTask(taskData);
    setTasks(prev => [...prev, created]);
    return created;
  }, []);

  // Task එකක් Edit කිරීම
  const editTask = useCallback(async (updatedTask: ScheduleTask) => {
    await updateTask(updatedTask);
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }, []);

  // Task එකක් මකා දැමීම
  const removeTask = useCallback(async (taskId: string) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // CSV එකක් import කිරීම
  const handleCSVImport = useCallback(async (csvText: string) => {
    const imported = await importCSV(csvText);
    setTasks(imported);
  }, []);

  // අද දවසේ tasks ලබා ගැනීම
  const getTodayTasks = useCallback(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return tasks.filter(t => t.day === today);
  }, [tasks]);

  // ඕනෑම දවසක tasks ලබා ගැනීම
  const getDayTasks = useCallback((day: string) => {
    return tasks.filter(t => t.day === day);
  }, [tasks]);

  return { 
    tasks, 
    progress, 
    loading, 
    changeStatus, 
    addNewTask, // අලුතින් එක් කළා
    editTask,   // අලුතින් එක් කළා
    removeTask, // අලුතින් එක් කළා
    handleCSVImport, 
    getTodayTasks, 
    getDayTasks, 
    reload: load 
  };
}