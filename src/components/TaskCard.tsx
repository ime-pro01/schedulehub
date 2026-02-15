import { motion } from 'framer-motion';
import { ScheduleTask, CATEGORY_CONFIG } from '@/types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface TaskCardProps {
  task: ScheduleTask;
  isActive?: boolean;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'missed') => void;
}

const statusIcons = {
  pending: Clock,
  completed: CheckCircle2,
  missed: XCircle,
};

const TaskCard = ({ task, isActive, onStatusChange }: TaskCardProps) => {
  const config = CATEGORY_CONFIG[task.category];
  const StatusIcon = statusIcons[task.status];

  const colorMap: Record<string, string> = {
    'neon-cyan': 'border-neon-cyan/30',
    'neon-green': 'border-neon-green/30',
    'neon-purple': 'border-neon-purple/30',
    'neon-orange': 'border-neon-orange/30',
    'neon-pink': 'border-neon-pink/30',
    'muted-foreground': 'border-muted/30',
  };

  const glowMap: Record<string, string> = {
    'neon-cyan': 'shadow-[0_0_15px_hsla(var(--neon-cyan)/0.2)]',
    'neon-green': 'shadow-[0_0_15px_hsla(var(--neon-green)/0.2)]',
    'neon-purple': 'shadow-[0_0_15px_hsla(var(--neon-purple)/0.2)]',
    'neon-orange': 'shadow-[0_0_15px_hsla(var(--neon-orange)/0.2)]',
    'neon-pink': 'shadow-[0_0_15px_hsla(var(--neon-pink)/0.2)]',
    'muted-foreground': '',
  };

  const textColorMap: Record<string, string> = {
    'neon-cyan': 'text-neon-cyan',
    'neon-green': 'text-neon-green',
    'neon-purple': 'text-neon-purple',
    'neon-orange': 'text-neon-orange',
    'neon-pink': 'text-neon-pink',
    'muted-foreground': 'text-muted-foreground',
  };

  const nextStatus = () => {
    if (task.status === 'pending') return 'completed';
    if (task.status === 'completed') return 'missed';
    return 'pending';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-lg p-3 cursor-pointer border transition-all
        ${colorMap[config.color] || 'border-border'}
        ${isActive ? glowMap[config.color] + ' animate-glow' : ''}
        ${task.status === 'completed' ? 'opacity-60' : ''}
        ${task.status === 'missed' ? 'opacity-40' : ''}
      `}
      onClick={() => onStatusChange(task.id, nextStatus())}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${textColorMap[config.color]}`}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{task.time_slot}</span>
          </div>
          <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>
          )}
        </div>
        <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-0.5
          ${task.status === 'completed' ? 'text-neon-green' : ''}
          ${task.status === 'missed' ? 'text-destructive' : ''}
          ${task.status === 'pending' ? 'text-muted-foreground' : ''}
        `} />
      </div>
    </motion.div>
  );
};

export default TaskCard;
