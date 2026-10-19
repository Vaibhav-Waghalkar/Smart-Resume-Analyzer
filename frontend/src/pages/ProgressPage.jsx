import React from 'react';
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  Award, 
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function ProgressPage({ streakData, progressData }) {
  const streak = streakData || { current_streak: 1, longest_streak: 1, total_active_days: 1, heatmap: [] };
  const stats = progressData?.stats || {};
  const resumeTrend = progressData?.resume_trend || [];
  const interviewTrend = progressData?.interview_trend || [];
  const recurringWeakAreas = progressData?.recurring_weak_areas || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      
      {/* Header with Amber Streak Accent */}
      <div className="editorial-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-2 border-l-[var(--accent-progress)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-label text-[10px] text-[var(--accent-progress)]">
              PROGRESSION & HABITS
            </span>
            <span className="text-xs text-[var(--text-muted)]">• Continuous practice</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-normal text-[var(--text-primary)]">
            Performance Trajectory & <span className="font-editorial-italic text-2xl sm:text-3xl font-medium">Activity</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track your ATS score growth, mock interview readiness curves, and daily practice streak.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]">
          <Flame className="w-8 h-8 text-[var(--accent-progress)] fill-[var(--accent-progress)] shrink-0" />
          <div>
            <div className="text-xl font-mono-label font-bold text-[var(--text-primary)] leading-none">
              {streak.current_streak} DAYS
            </div>
            <div className="text-[10px] font-mono-label text-[var(--text-muted)] mt-1">
              LONGEST: {streak.longest_streak} DAYS
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="editorial-card p-5 space-y-1">
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">RESUMES ANALYZED</span>
          <div className="text-2xl font-mono-label font-bold text-[var(--text-primary)]">
            {stats.total_resumes_analyzed || 0}
          </div>
          <span className="font-mono-label text-[10px] text-[var(--accent-success)] block">
            {stats.resume_improvement > 0 ? `+${stats.resume_improvement}% GAIN` : 'CALIBRATING'}
          </span>
        </div>

        <div className="editorial-card p-5 space-y-1">
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">INTERVIEWS COMPLETED</span>
          <div className="text-2xl font-mono-label font-bold text-[var(--text-primary)]">
            {stats.total_interviews_completed || 0}
          </div>
          <span className="font-mono-label text-[10px] text-[var(--accent-interview)] block">
            {stats.interview_improvement > 0 ? `+${stats.interview_improvement}% READINESS` : 'REHEARSING'}
          </span>
        </div>

        <div className="editorial-card p-5 space-y-1">
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">LATEST MATCH</span>
          <div className="text-2xl font-mono-label font-bold text-[var(--text-primary)]">
            {stats.latest_resume_score ? `${stats.latest_resume_score}%` : '—'}
          </div>
          <span className="font-mono-label text-[10px] text-[var(--text-muted)] block">
            TARGET PROFILE
          </span>
        </div>

        <div className="editorial-card p-5 space-y-1">
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">ACTIVE PRACTICE DAYS</span>
          <div className="text-2xl font-mono-label font-bold text-[var(--text-primary)]">
            {streak.total_active_days || 1}
          </div>
          <span className="font-mono-label text-[10px] text-[var(--accent-progress)] block">
            STREAK ACTIVE
          </span>
        </div>

      </div>

      {/* 90-Day Activity Heatmap (4-level Amber ramp) */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-progress)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              90-Day Daily Activity Heatmap
            </h2>
          </div>
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
            LOGGED PRACTICE SESSIONS
          </span>
        </div>

        {/* Heatmap Grid with horizontal scroll on small screens */}
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-wrap gap-1.5 min-w-[500px]">
            {streak.heatmap && streak.heatmap.length > 0 ? (
              streak.heatmap.map((cell, idx) => {
                // 4-level ramp from border-color to amber
                const activityLevel = cell.count || (cell.active ? 3 : 0);
                const bgColors = [
                  'var(--bg-surface-elevated)', // Level 0: empty
                  'rgba(245, 184, 65, 0.3)',   // Level 1: light amber
                  'rgba(245, 184, 65, 0.65)',  // Level 2: medium amber
                  'var(--accent-progress)'      // Level 3: full amber
                ];
                const activeColor = bgColors[Math.min(activityLevel, 3)];

                return (
                  <div
                    key={idx}
                    title={`${cell.date}: ${cell.active ? 'Activity recorded' : 'No activity'}`}
                    style={{ backgroundColor: activeColor }}
                    className="w-3.5 h-3.5 rounded-xs border border-[var(--border-color)] hover:scale-115 transition-transform cursor-pointer"
                  />
                );
              })
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No streak activity recorded yet.</p>
            )}
          </div>
        </div>

        {/* 4-level Legend */}
        <div className="flex items-center justify-end gap-2 text-[10px] font-mono-label text-[var(--text-muted)] pt-1">
          <span>LESS</span>
          <span className="w-3 h-3 rounded-xs border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]" />
          <span className="w-3 h-3 rounded-xs border border-[var(--border-color)]" style={{ backgroundColor: 'rgba(245, 184, 65, 0.3)' }} />
          <span className="w-3 h-3 rounded-xs border border-[var(--border-color)]" style={{ backgroundColor: 'rgba(245, 184, 65, 0.65)' }} />
          <span className="w-3 h-3 rounded-xs border border-[var(--border-color)]" style={{ backgroundColor: 'var(--accent-progress)' }} />
          <span>MORE</span>
        </div>
      </div>

      {/* Score Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resume ATS Score Trend */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-mono-label text-[11px] text-[var(--text-muted)]">
              RESUME MATCH TRAJECTORY
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-analyzer)]" />
          </div>

          <div className="h-60 w-full">
            {resumeTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resumeTrend}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--accent-analyzer)" 
                    strokeWidth={2} 
                    dot={{ fill: 'var(--accent-analyzer)', r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] font-mono-label">
                ANALYZE AT LEAST 1 RESUME TO PLOT TREND
              </div>
            )}
          </div>
        </div>

        {/* Interview Performance Trend */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="font-mono-label text-[11px] text-[var(--text-muted)]">
              MOCK INTERVIEW READINESS
            </span>
            <Award className="w-3.5 h-3.5 text-[var(--accent-interview)]" />
          </div>

          <div className="h-60 w-full">
            {interviewTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewTrend}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--accent-interview)" 
                    strokeWidth={2} 
                    dot={{ fill: 'var(--accent-interview)', r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] font-mono-label">
                COMPLETE 1 INTERVIEW TO PLOT TREND
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recurring Weak Areas Section */}
      <div className="editorial-card p-6 space-y-4">
        <h3 className="font-mono-label text-[11px] text-[var(--text-primary)] font-bold flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[var(--accent-progress)]" />
          IDENTIFIED FOCUS & RECURRING WEAKNESSES
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recurringWeakAreas.map((w, idx) => (
            <div key={idx} className="editorial-card-elevated p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[var(--text-primary)]">{w.area}</span>
                <span className="font-mono-label text-[9px] px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--accent-progress)] font-bold">
                  {w.frequency} PRIORITY
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {w.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
