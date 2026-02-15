// API-ready notification hooks for FastAPI email triggers
const API_BASE = '';

export async function notifyMissedTask(taskId: string, taskTitle: string): Promise<void> {
  if (!API_BASE) return; // No-op when running standalone
  await fetch(`${API_BASE}/api/notifications/missed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, taskTitle, timestamp: new Date().toISOString() }),
  });
}

export async function notifyDailySummary(completed: number, missed: number, xpEarned: number): Promise<void> {
  if (!API_BASE) return;
  await fetch(`${API_BASE}/api/notifications/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed, missed, xpEarned, date: new Date().toISOString() }),
  });
}
