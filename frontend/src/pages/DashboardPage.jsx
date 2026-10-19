import React from 'react';
import { 
  FileText, 
  Bot, 
  Flame, 
  TrendingUp, 
  ArrowRight, 
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ setActiveTab, streakData, progressData }) {
  const { user } = useAuth();

  const currentStreak = streakData?.current_streak || 1;
  const latestResumeScore = progressData?.stats?.latest_resume_score || 0;
  const completedInterviews = progressData?.stats?.total_interviews_completed || 0;
  const totalActiveDays = streakData?.total_active_days || 1;

  const quickActions = [
    {
      title: 'Resume ATS Optimizer',
      desc: 'Audit your resume against modern ATS benchmarks and generate XYZ executive bullet rewrites.',
      btnLabel: 'Analyze Resume',
      accent: 'var(--accent-analyzer)',
      onClick: () => setActiveTab('analyzer'),
      icon: FileText
    },
    {
      title: 'Mock Interview Studio',
      desc: 'Simulate a live technical interview tailored directly to the work history in your resume.',
      btnLabel: 'Start Interview',
      accent: 'var(--accent-interview)',
      onClick: () => setActiveTab('interview'),
      icon: Bot
    },
    {
      title: 'Progression Analytics',
      desc: 'Track your match trajectory over time, inspect your 90-day heatmap, and target recurring skill gaps.',
      btnLabel: 'View Progress',
      accent: 'var(--accent-progress)',
      onClick: () => setActiveTab('progress'),
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      
      {/* Header Greeting */}
      <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-2 border-l-[var(--accent-progress)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-label text-[10px] text-[var(--accent-progress)]">
              OVERVIEW
            </span>
            <span className="text-xs text-[var(--text-muted)]">• Daily practice routine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
            Hello, <span className="font-editorial-italic text-3xl sm:text-4xl">{user?.name || user?.email?.split('@')[0] || 'Candidate'}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Keep your momentum active. You are currently maintaining a <strong className="text-[var(--text-primary)]">{currentStreak}-day practice streak</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]">
          <Flame className="w-6 h-6 text-[var(--accent-progress)] fill-[var(--accent-progress)]" />
          <div>
            <div className="text-lg font-mono-label font-bold text-[var(--text-primary)] leading-none">
              {currentStreak} DAYS
            </div>
            <div className="text-[10px] font-mono-label text-[var(--text-muted)] mt-0.5">
              ACTIVE STREAK
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="editorial-card p-5 space-y-1">
          <div className="flex items-center justify-between font-mono-label text-[11px] text-[var(--text-muted)]">
            <span>LATEST ATS SCORE</span>
            <Award className="w-3.5 h-3.5 text-[var(--accent-analyzer)]" />
          </div>
          <div className="text-3xl font-mono-label font-bold text-[var(--text-primary)] pt-1">
            {latestResumeScore > 0 ? `${latestResumeScore}%` : '—'}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {latestResumeScore >= 75 ? 'Meets recommended interview threshold' : 'Upload latest resume to calibrate baseline'}
          </p>
        </div>

        <div className="editorial-card p-5 space-y-1">
          <div className="flex items-center justify-between font-mono-label text-[11px] text-[var(--text-muted)]">
            <span>INTERVIEWS FINISHED</span>
            <Bot className="w-3.5 h-3.5 text-[var(--accent-interview)]" />
          </div>
          <div className="text-3xl font-mono-label font-bold text-[var(--text-primary)] pt-1">
            {completedInterviews}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Evaluated sessions with executive report cards
          </p>
        </div>

        <div className="editorial-card p-5 space-y-1">
          <div className="flex items-center justify-between font-mono-label text-[11px] text-[var(--text-muted)]">
            <span>ACTIVE DAYS LOGGED</span>
            <Target className="w-3.5 h-3.5 text-[var(--accent-progress)]" />
          </div>
          <div className="text-3xl font-mono-label font-bold text-[var(--text-primary)] pt-1">
            {totalActiveDays}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Calendar days with recorded career actions
          </p>
        </div>

      </div>

      {/* Three Feature Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quickActions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="editorial-card p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div 
                  className="w-10 h-10 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex items-center justify-center"
                >
                  <Icon className="w-5 h-5" style={{ color: item.accent }} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={item.onClick}
                className="w-full py-2.5 px-4 rounded-md text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-between transition-colors min-h-[44px]"
              >
                <span>{item.btnLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: item.accent }} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
