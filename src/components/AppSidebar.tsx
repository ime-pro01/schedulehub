import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Focus, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/focus', icon: Focus, label: 'Focus Mode' },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-56 glass-card border-r border-border z-40 flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
          <Focus className="w-5 h-5 text-primary" />
        </div>
        <span className="hidden md:block text-sm font-bold neon-text-cyan tracking-wide">STUDY HUB</span>
      </div>

      <nav className="flex-1 p-2 flex flex-col gap-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink key={to} to={to} className="relative">
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}>
                <Icon className="w-5 h-5" />
                <span className="hidden md:block text-sm font-medium">{label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <div className="text-xs text-muted-foreground text-center hidden md:block">
          API-Ready • v1.0
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
