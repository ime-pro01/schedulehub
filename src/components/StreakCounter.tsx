import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
  longestStreak: number;
}

const StreakCounter = ({ streak, longestStreak }: StreakCounterProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <motion.div
          animate={streak > 0 ? {
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="absolute -inset-3 rounded-full"
          style={{
            background: streak > 0 ? 'radial-gradient(circle, hsla(30, 100%, 55%, 0.3), transparent)' : 'transparent',
          }}
        />
        <Flame
          className={`w-10 h-10 ${streak > 0 ? 'text-neon-orange' : 'text-muted-foreground'}`}
          style={streak > 0 ? { filter: 'drop-shadow(0 0 8px hsl(30, 100%, 55%))' } : {}}
        />
      </div>
      <motion.span
        className="text-2xl font-bold text-foreground"
        key={streak}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {streak}
      </motion.span>
      <span className="text-xs text-muted-foreground">day streak</span>
      <span className="text-xs text-muted-foreground">best: {longestStreak}</span>
    </div>
  );
};

export default StreakCounter;
