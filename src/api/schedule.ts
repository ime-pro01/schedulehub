import { supabase } from "@/integrations/supabase/client";
import { ScheduleTask, TaskStatus, getCategoryFromTitle } from '@/types';

/**
 * Supabase වෙතින් සියලුම tasks ලබා ගැනීම
 */
export async function fetchSchedule(): Promise<ScheduleTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }

  return data as ScheduleTask[];
}

/**
 * Task එකක status එක (pending, completed, missed) පමණක් වෙනස් කිරීම
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) throw error;
}

/**
 * පවතින Task එකක සියලුම විස්තර Edit කිරීම
 */
export async function updateTask(task: ScheduleTask): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({
      title: task.title,
      description: task.description,
      time_slot: task.time_slot,
      start_time: task.start_time,
      end_time: task.end_time,
      category: task.category,
      day: task.day,
      status: task.status
    })
    .eq('id', task.id);

  if (error) throw error;
}

/**
 * අලුතින් Task එකක් ඇතුළත් කිරීම
 */
export async function addTask(task: Omit<ScheduleTask, 'id'>): Promise<ScheduleTask> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task }])
    .select()
    .single();

  if (error) throw error;
  return data as ScheduleTask;
}

/**
 * Task එකක් මකා දැමීම
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

/**
 * CSV ගොනුවක් කියවා එහි ඇති දත්ත Database එකට ඇතුළත් කිරීම
 */
export async function importCSV(csvText: string): Promise<ScheduleTask[]> {
  const lines = csvText.trim().split('\n').filter(l => l.trim());
  const headerIdx = lines.findIndex(l => l.toLowerCase().includes('time'));
  if (headerIdx === -1) throw new Error('Invalid CSV: no Time column found');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const newTasks: any[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
    const time = cols[0];
    if (!time) continue;
    const [start, end] = time.split(' - ').map(t => t.trim());

    for (let d = 0; d < 7; d++) {
      const content = cols[d + 1] || '';
      if (!content) continue;
      const titleParts = content.split(' - ');
      
      newTasks.push({
        time_slot: time,
        start_time: start,
        end_time: end,
        title: titleParts[0].trim(),
        description: titleParts[1]?.trim() || '',
        category: getCategoryFromTitle(content),
        day: days[d],
        status: 'pending',
      });
    }
  }

  // දත්ත රාශියක් එකවර Database එකට ඇතුළත් කිරීම (Bulk Insert)
  const { data, error } = await supabase
    .from('tasks')
    .insert(newTasks)
    .select();

  if (error) throw error;
  return data as ScheduleTask[];
}