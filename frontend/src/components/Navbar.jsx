import React from 'react';
import { 
  FileText, 
  Bot, 
  TrendingUp, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Flame, 
  LogIn, 
  LogOut, 
  User as UserIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode, openAuthModal, streakData }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: 'var(--text-primary)' },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileText, accent: 'var(--accent-analyzer)' },
    { id: 'interview', label: 'Mock Interview', icon: Bot, accent: 'var(--accent-interview)' },
    { id: 'progress', label: 'Progress & Streaks', icon: TrendingUp, accent: 'var(--accent-progress)' },
  ];

  return (
    <>
      {/* Top Navbar: Compact on mobile, full desktop navigation on md+ */}
      <header className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15">
            
            {/* Brand Logo & Editorial Title */}
            <div 
              onClick={() => setActiveTab('landing')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex items-center justify-center font-mono-label font-bold text-xs text-[var(--text-primary)] group-hover:border-[var(--accent-analyzer)] transition-colors">
                RA
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
                  Resume<span className="font-editorial-italic text-base ml-1">Analyzer</span>
                </span>
                <span className="hidden sm:inline font-mono-label text-[10px] text-[var(--text-muted)] border border-[var(--border-color)] px-1.5 py-0.2 rounded">
                  STUDIO
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-color)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]/60'
                    }`}
                  >
                    <Icon 
                      className="w-3.5 h-3.5" 
                      style={{ color: isActive ? item.accent : 'var(--text-muted)' }} 
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Utilities: Streak + Dark/Light Toggle + User Auth */}
            <div className="flex items-center gap-2.5">
              
              {/* Daily Streak Badge */}
              <button 
                onClick={() => setActiveTab('progress')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-xs font-mono-label font-semibold text-[var(--accent-progress)] hover:border-[var(--accent-progress)] transition-colors"
                title="Daily streak counter"
              >
                <Flame className="w-3.5 h-3.5 fill-[var(--accent-progress)]" />
                <span>{streakData?.current_streak || 1}D</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] transition-colors"
                aria-label="Toggle dark/light mode"
              >
                {darkMode ? <Sun className="w-4 h-4 text-[var(--accent-progress)]" /> : <Moon className="w-4 h-4 text-[var(--text-secondary)]" />}
              </button>

              {/* User Authentication state */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
                  <div className="w-7 h-7 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] flex items-center justify-center font-mono-label text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-warning)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 transition-opacity"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (fixed on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-surface)]/98 backdrop-blur-lg safe-pb">
        <div className="grid grid-cols-4 h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors"
              >
                <Icon 
                  className="w-4 h-4" 
                  style={{ color: isActive ? item.accent : 'var(--text-muted)' }} 
                />
                <span 
                  className={`text-[10px] ${isActive ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
                >
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
