import React from 'react';
import { 
  FileText, 
  Bot, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle, 
  Target, 
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ setActiveTab, streakData, progressData }) {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Resume ATS Optimizer',
      desc: 'Upload your latest resume and get an instant score match against 14+ target tech roles.',
      actionText: 'Analyze Resume',
      icon: FileText,
      color: 'from-emerald-600 to-teal-500',
      action: () => setActiveTab('analyzer')
    },
    {
      title: 'AI Mock Interview',
      desc: 'Practice voice-enabled technical, HR, and project-based interview questions tailored to your background.',
      actionText: 'Start Interview',
      icon: Bot,
      color: 'from-blue-600 to-cyan-500',
      action: () => setActiveTab('interview')
    },
    {
      title: 'Progress & Streaks',
      desc: 'View score history trends, activity heatmaps, and identify recurring weak areas to improve.',
      actionText: 'View Analytics',
      icon: TrendingUp,
      color: 'from-purple-600 to-pink-500',
      action: () => setActiveTab('progress')
    }
  ];

  const currentStreak = streakData?.current_streak || 1;
  const latestResumeScore = progressData?.stats?.latest_resume_score || 0;
  const completedInterviews = progressData?.stats?.total_interviews_completed || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Welcome Back
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Daily Goal: Practice 1 Resume or 1 Interview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Hello, {user?.name || user?.email?.split('@')[0] || 'Candidate'} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Ready to upgrade your career metrics today? You're on a <span className="text-amber-500 font-bold">{currentStreak} day streak</span>. Keep the momentum going!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500">
            <Flame className="w-6 h-6 fill-amber-500" />
            <div>
              <div className="text-xl font-bold leading-none">{currentStreak}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Current ATS Score</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
            {latestResumeScore > 0 ? `${latestResumeScore}%` : 'Not Analyzed'}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {latestResumeScore >= 75 ? 'Above typical recruiter threshold' : 'Upload or re-analyze to boost score'}
          </p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Interviews Completed</span>
            <Bot className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
            {completedInterviews}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Simulations with AI feedback reports
          </p>
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-medium">
            <span>Active Days Logged</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-[var(--text-primary)]">
            {streakData?.total_active_days || 1}
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Days you refined resumes or practiced
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="glass-panel p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all hover:-translate-y-1">
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {c.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  {c.desc}
                </p>
              </div>
              <button
                onClick={c.action}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] hover:bg-emerald-500/10 hover:text-emerald-500 border border-[var(--border-color)] text-[var(--text-primary)] flex items-center justify-center gap-2 transition-colors"
              >
                <span>{c.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
