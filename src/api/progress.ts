import { UserProgress, XPTransaction } from '@/types';

const PROGRESS_KEY = 'studyhub_progress';
const XP_KEY = 'studyhub_xp_log';
const API_BASE = '';

function useAPI(): boolean {
  return API_BASE.length > 0;
}

const DEFAULT_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  tasksCompletedToday: 0,
  tasksMissedToday: 0,
  totalTasksToday: 16,
  weeklyCompleted: 0,
  weeklyMissed: 0,
  recoveryRate: 0,
};

export async function fetchProgress(): Promise<UserProgress> {
  if (useAPI()) {
    const res = await fetch(`${API_BASE}/api/progress`);
    return res.json();
  }
  const stored = localStorage.getItem(PROGRESS_KEY);
  return stored ? JSON.parse(stored) : { ...DEFAULT_PROGRESS };
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  if (useAPI()) {
    await fetch(`${API_BASE}/api/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progress),
    });
    return;
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export async function addXP(amount: number, reason: string, taskId?: string): Promise<UserProgress> {
  const progress = await fetchProgress();
  progress.xp += amount;
  progress.level = Math.min(Math.floor(progress.xp / 500) + 1, 20);
  await saveProgress(progress);

  const log = await getXPLog();
  log.push({
    id: Date.now().toString(),
    amount,
    reason,
    timestamp: new Date().toISOString(),
    taskId,
  });
  localStorage.setItem(XP_KEY, JSON.stringify(log));

  return progress;
}

export async function getXPLog(): Promise<XPTransaction[]> {
  if (useAPI()) {
    const res = await fetch(`${API_BASE}/api/xp-log`);
    return res.json();
  }
  const stored = localStorage.getItem(XP_KEY);
  return stored ? JSON.parse(stored) : [];
}
