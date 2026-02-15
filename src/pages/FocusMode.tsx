import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSchedule } from '@/hooks/useSchedule';
import { Play, Pause, RotateCcw, Settings, Zap } from 'lucide-react';
import { PomodoroSettings } from '@/types';
import { addXP } from '@/api/progress';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

const FocusMode = () => {
  const { getTodayTasks, progress } = useSchedule();
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    const stored = localStorage.getItem('studyhub_pomodoro');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [sessions, setSessions] = useState(0);

  const totalTime = isBreak
    ? (sessions > 0 && sessions % settings.sessionsBeforeLongBreak === 0 ? settings.longBreakDuration : settings.breakDuration) * 60
    : settings.focusDuration * 60;

  const progress_percent = ((totalTime - timeLeft) / totalTime) * 100;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayTasks = getTodayTasks();
  const activeTask = todayTasks.find(t => currentTime >= t.start_time && currentTime < t.end_time && t.category !== 'break');

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (!isBreak) {
            setSessions(s => s + 1);
            addXP(25, 'Pomodoro session completed');
          }
          setIsBreak(!isBreak);
          const nextTotal = !isBreak
            ? ((sessions + 1) % settings.sessionsBeforeLongBreak === 0 ? settings.longBreakDuration : settings.breakDuration) * 60
            : settings.focusDuration * 60;
          return nextTotal;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak, sessions, settings]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(settings.focusDuration * 60);
  };

  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    localStorage.setItem('studyhub_pomodoro', JSON.stringify(newSettings));
    setTimeLeft(newSettings.focusDuration * 60);
    setIsRunning(false);
    setIsBreak(false);
    setShowSettings(false);
  };

  const ringSize = 280;
  const strokeWidth = 6;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress_percent / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center cyber-grid">
      <div className="max-w-lg w-full mx-auto p-4 space-y-6">
        {/* Current Task */}
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-4 border border-primary/20 text-center"
          >
            <p className="text-xs text-primary uppercase tracking-widest mb-1">Current Task</p>
            <h2 className="text-lg font-semibold">{activeTask.title}</h2>
            <p className="text-sm text-muted-foreground">{activeTask.time_slot}</p>
          </motion.div>
        )}

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="-rotate-90">
              <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
              <motion.circle
                cx={ringSize/2} cy={ringSize/2} r={radius} fill="none"
                stroke={isBreak ? 'hsl(var(--neon-green))' : 'hsl(var(--neon-cyan))'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.5 }}
                style={{ filter: `drop-shadow(0 0 8px ${isBreak ? 'hsl(var(--neon-green) / 0.5)' : 'hsl(var(--neon-cyan) / 0.5)'})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-mono font-bold tracking-wider">{formatTime(timeLeft)}</span>
              <span className={`text-sm mt-2 font-medium ${isBreak ? 'text-neon-green' : 'text-primary'}`}>
                {isBreak ? 'Break Time' : 'Focus'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              className="rounded-full w-12 h-12"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className="rounded-full w-16 h-16 neon-glow-cyan"
              size="icon"
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-full w-12 h-12"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Session Counter */}
        <div className="flex items-center justify-center gap-6 text-center">
          <div>
            <p className="text-2xl font-bold neon-text-cyan">{sessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-neon-orange" />
            <p className="text-2xl font-bold">{sessions * 25}</p>
            <p className="text-xs text-muted-foreground ml-1">Bonus XP</p>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="glass-card border-border">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-semibold">Timer Settings</h3>
                {[
                  { label: 'Focus (min)', key: 'focusDuration' as const },
                  { label: 'Break (min)', key: 'breakDuration' as const },
                  { label: 'Long Break (min)', key: 'longBreakDuration' as const },
                  { label: 'Sessions before long break', key: 'sessionsBeforeLongBreak' as const },
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">{label}</Label>
                    <Input
                      type="number"
                      className="w-20 h-8 text-center"
                      value={settings[key]}
                      onChange={e => setSettings({ ...settings, [key]: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                ))}
                <Button size="sm" onClick={() => saveSettings(settings)} className="w-full">Save</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FocusMode;
