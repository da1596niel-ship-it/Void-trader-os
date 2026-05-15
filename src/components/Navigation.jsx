import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  Clock,
  BarChart3,
  Settings,
} from 'lucide-react';

const Navigation = ({ activeSection, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'compound-engine', label: 'Compound', icon: TrendingUp },
    { id: 'risk-lab', label: 'Risk Lab', icon: Zap },
    { id: 'session-engine', label: 'Sessions', icon: Clock },
    { id: 'history', label: 'History', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-void-graphite/90 via-void-graphite/50 to-transparent backdrop-blur-xl border-t border-void-purple/20 z-50">
      <div className="h-20 flex items-center justify-around px-4 sm:px-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg transition-all duration-300 group relative ${
                isActive
                  ? 'text-void-purple-glow'
                  : 'text-void-cyan/60 hover:text-void-cyan'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-void-purple/10 blur-lg -z-10" />
              )}

              <Icon
                size={20}
                className={`transition-all duration-300 ${
                  isActive ? 'drop-shadow-lg scale-110' : ''
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
                {item.label}
              </span>

              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-gradient-to-r from-void-purple-glow to-void-cyan-bright rounded-full animate-glow-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
