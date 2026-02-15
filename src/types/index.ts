export type TaskStatus = 'pending' | 'completed' | 'missed';

export type TaskCategory =
  | 'projects-research'
  | 'coding-practice'
  | 'book-writing'
  | 'english-practice'
  | 'networking'
  | 'planning'
  | 'break';

export interface ScheduleTask {
  id: string;
  title: string;
  description: string;
  time_slot: string;  
  start_time: string;  
  end_time: string;    
  day: string;
  category: string;
  status: string;
  created_at: string;
}

export interface DaySchedule {
  day: string;
  tasks: ScheduleTask[];
}

export interface WeekSchedule {
  days: DaySchedule[];
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  tasksMissedToday: number;
  totalTasksToday: number;
  weeklyCompleted: number;
  weeklyMissed: number;
  recoveryRate: number;
}

export interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
  taskId?: string;
}

export interface PomodoroSettings {
  focusDuration: number; // minutes
  breakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Script Kiddie',
  2: 'Bug Squasher',
  3: 'Code Cadet',
  4: 'Syntax Warrior',
  5: 'Loop Master',
  6: 'Data Wrangler',
  7: 'Stack Navigator',
  8: 'API Artisan',
  9: 'Debug Phantom',
  10: 'Algo Knight',
  11: 'Binary Sage',
  12: 'Cache Commander',
  13: 'Thread Weaver',
  14: 'Kernel Hacker',
  15: 'Quantum Coder',
  16: 'Neural Architect',
  17: 'Cyber Sentinel',
  18: 'Void Walker',
  19: 'Matrix Bender',
  20: 'Singularity',
};

export const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string; icon: string }> = {
  'projects-research': { label: 'Projects & Research', color: 'neon-cyan', icon: 'Code2' },
  'coding-practice': { label: 'HackerRank', color: 'neon-green', icon: 'Terminal' },
  'book-writing': { label: 'Book Writing', color: 'neon-purple', icon: 'BookOpen' },
  'english-practice': { label: 'English Practice', color: 'neon-orange', icon: 'Languages' },
  'networking': { label: 'GitHub & LinkedIn', color: 'neon-pink', icon: 'Globe' },
  'planning': { label: 'Planning & Reflection', color: 'neon-cyan', icon: 'Target' },
  'break': { label: 'Break', color: 'muted-foreground', icon: 'Coffee' },
};

export function getCategoryFromTitle(title: string): TaskCategory {
  const lower = title.toLowerCase();
  if (lower.includes('hackerrank') || lower.includes('python')) return 'coding-practice';
  if (lower.includes('book writing')) return 'book-writing';
  if (lower.includes('english')) return 'english-practice';
  if (lower.includes('github') || lower.includes('linkedin')) return 'networking';
  if (lower.includes('planning') || lower.includes('reflection')) return 'planning';
  if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('tea') || lower.includes('walk') || lower.includes('relax')) return 'break';
  if (lower.includes('project') || lower.includes('research')) return 'projects-research';
  return 'projects-research';
}

export function getXPForLevel(level: number): number {
  return level * 500;
}

export function getLevelFromXP(xp: number): number {
  return Math.min(Math.floor(xp / 500) + 1, 20);
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, 20)] || 'Singularity';
}
