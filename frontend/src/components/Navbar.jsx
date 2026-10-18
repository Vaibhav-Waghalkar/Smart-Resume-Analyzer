import React from 'react';
import { 
  FileText, 
  Bot, 
  TrendingUp, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Sparkles, 
  Flame, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode, openAuthModal, streakData }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Resume Analyzer', icon: FileText },
    { id: 'interview', label: 'AI Mock Interview', icon: Bot, badge: 'New' },
    { id: 'progress', label: 'Progress & Streaks', icon: TrendingUp },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-[var(--border-color)] bg-[var(--bg-surface)]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Smart Resume
              </span>
              <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                AI v2
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-semibold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Utilities */}
          <div className="hidden md:flex items-center gap-3">
            {/* Streak Badge */}
            <div 
              onClick={() => setActiveTab('progress')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold cursor-pointer hover:bg-amber-500/20 transition-colors"
              title="Daily Practice Streak"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{streakData?.current_streak || 1} Day Streak</span>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors border border-[var(--border-color)]"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Auth Info / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate text-[var(--text-primary)]">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-500 font-semibold' 
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{streakData?.current_streak || 1} Day Streak</span>
            </div>
            {user ? (
              <button onClick={logout} className="text-xs text-red-500 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            ) : (
              <button 
                onClick={() => { openAuthModal(); setMobileMenuOpen(false); }} 
                className="text-xs text-emerald-500 font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
