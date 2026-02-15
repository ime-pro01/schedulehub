import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressRing from '@/components/ProgressRing';
import StreakCounter from '@/components/StreakCounter';
import XPDisplay from '@/components/XPDisplay';
import TaskCard from '@/components/TaskCard';
import { useSchedule } from '@/hooks/useSchedule';
import { CheckCircle2, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { progress, loading, getTodayTasks, changeStatus } = useSchedule();
  const todayTasks = getTodayTasks();

  if (loading || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionPercent = progress.totalTasksToday > 0
    ? (progress.tasksCompletedToday / progress.totalTasksToday) * 100
    : 0;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

  const activeTask = todayTasks.find(t => {
    return currentTimeStr >= t.start_time && currentTimeStr < t.end_time && t.category !== 'break';
  });

  const workTasks = todayTasks.filter(t => t.category !== 'break');
  const missedTasks = todayTasks.filter(t => t.status === 'missed');
  const upcomingTasks = workTasks.filter(t => t.start_time > currentTimeStr && t.status === 'pending').slice(0, 4);

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold">
            Good {currentHour < 12 ? 'Morning' : currentHour < 17 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Active Task Banner */}
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-4 border border-primary/30 neon-glow-cyan"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Now Focusing</span>
            </div>
            <h2 className="text-lg font-semibold">{activeTask.title}</h2>
            <p className="text-sm text-muted-foreground">{activeTask.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{activeTask.time_slot}</p>
          </motion.div>
        )}

        {/* Stats Row */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={item}>
            <Card className="glass-card border-border">
              <CardContent className="p-6 flex items-center justify-center">
                <ProgressRing progress={completionPercent} label="Today" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card border-border">
              <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                <StreakCounter streak={progress.streak} longestStreak={progress.longestStreak} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card border-border">
              <CardContent className="p-6 flex flex-col justify-center">
                <XPDisplay xp={progress.xp} level={progress.level} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: CheckCircle2, label: 'Completed Today', value: progress.tasksCompletedToday, color: 'text-neon-green' },
            { icon: XCircle, label: 'Missed Today', value: progress.tasksMissedToday, color: 'text-destructive' },
            { icon: TrendingUp, label: 'Weekly Done', value: progress.weeklyCompleted, color: 'text-neon-cyan' },
            { icon: AlertTriangle, label: 'Recovery Rate', value: `${progress.recoveryRate}%`, color: 'text-neon-orange' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} variants={item}>
              <Card className="glass-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="text-lg font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Missed Tasks Alert */}
        {missedTasks.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="glass-card border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Missed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {missedTasks.map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={changeStatus} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upcoming Tasks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Up Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isActive={task.id === activeTask?.id}
                    onStatusChange={changeStatus}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">No more tasks today 🎉</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
