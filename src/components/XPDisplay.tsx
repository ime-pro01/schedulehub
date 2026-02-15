import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { getLevelName, getXPForLevel } from '@/types';

interface XPDisplayProps {
  xp: number;
  level: number;
}

const XPDisplay = ({ xp, level }: XPDisplayProps) => {
  const currentLevelXP = (level - 1) * 500;
  const nextLevelXP = getXPForLevel(level);
  const progressInLevel = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-cyan" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--neon-cyan) / 0.5))' }} />
          <span className="text-sm font-medium text-foreground">Level {level}</span>
        </div>
        <span className="text-xs neon-text-purple font-semibold">{getLevelName(level)}</span>
      </div>

      <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))',
            boxShadow: '0 0 10px hsl(var(--neon-cyan) / 0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progressInLevel, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{xp} XP</span>
        <span>{nextLevelXP} XP</span>
      </div>
    </div>
  );
};

export default XPDisplay;
