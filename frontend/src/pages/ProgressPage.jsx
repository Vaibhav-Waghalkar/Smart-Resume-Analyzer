import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Calendar, 
  Award, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  Clock,
  Sparkles
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
import { resumeApi } from '../api/resumeApi';

export default function ProgressPage({ streakData, progressData, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const streak = streakData || { current_streak: 1, longest_streak: 1, total_active_days: 1, heatmap: [] };
  const stats = progressData?.stats || {};
  const resumeTrend = progressData?.resume_trend || [];
  const interviewTrend = progressData?.interview_trend || [];
  const recurringWeakAreas = progressData?.recurring_weak_areas || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Analytics & Progression
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Progress Tracking & Daily Streaks
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Measure your ATS score growth, interview readiness curves, and daily consistency.
          </p>
        </div>

        {/* Streak Highlight Card */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500">
          <Flame className="w-10 h-10 fill-amber-500 shrink-0" />
          <div>
            <div className="text-2xl font-black leading-none">{streak.current_streak} Days</div>
            <div className="text-[11px] font-semibold text-[var(--text-secondary)] mt-0.5">
              Longest Streak: {streak.longest_streak} Days
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5">
          <span className="text-xs text-[var(--text-muted)] font-medium">Resumes Analyzed</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
            {stats.total_resumes_analyzed || 0}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
            {stats.resume_improvement > 0 ? `+${stats.resume_improvement}% overall gain` : 'Baseline established'}
          </span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-[var(--text-muted)] font-medium">Interviews Completed</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
            {stats.total_interviews_completed || 0}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
            {stats.interview_improvement > 0 ? `+${stats.interview_improvement}% score growth` : 'Practicing questions'}
          </span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-[var(--text-muted)] font-medium">Latest Resume Match</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
            {stats.latest_resume_score ? `${stats.latest_resume_score}%` : 'N/A'}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
            Targeting tech roles
          </span>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-[var(--text-muted)] font-medium">Total Active Days</span>
          <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">
            {streak.total_active_days || 1}
          </div>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 block">
            Consistent preparation
          </span>
        </div>
      </div>

      {/* 90-Day Calendar Heatmap */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            90-Day Daily Activity Heatmap
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            Active if you analyzed a resume or completed an interview
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {streak.heatmap && streak.heatmap.length > 0 ? (
            streak.heatmap.map((cell, idx) => (
              <div
                key={idx}
                title={`${cell.date}: ${cell.active ? 'Active' : 'No activity'}`}
                className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${
                  cell.active 
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                    : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]'
                }`}
              />
            ))
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No streak activity recorded yet.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 text-[11px] text-[var(--text-muted)] pt-2">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]" />
          <span className="w-3 h-3 rounded-sm bg-emerald-500/40" />
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span>More Active</span>
        </div>
      </div>

      {/* Score Trends Over Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resume Score Trend */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
            <span>Resume ATS Score Over Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </h3>

          <div className="h-64 w-full">
            {resumeTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resumeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10b981', r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                Analyze at least 1 resume to generate trend chart.
              </div>
            )}
          </div>
        </div>

        {/* Interview Score Trend */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
            <span>Interview Performance Over Time</span>
            <Award className="w-4 h-4 text-blue-500" />
          </h3>

          <div className="h-64 w-full">
            {interviewTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={interviewTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3b82f6', r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                Complete at least 1 mock interview to populate performance trend.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recurring Weak Areas Section */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Identified Weak Areas & Recommended Focus
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recurringWeakAreas.map((w, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--text-primary)]">{w.area}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {w.frequency} Priority
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
