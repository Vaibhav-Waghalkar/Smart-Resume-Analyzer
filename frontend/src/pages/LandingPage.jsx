import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  FileCheck, 
  Flame, 
  Mic, 
  Award,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onPracticeInterview }) {
  const highlights = [
    {
      icon: FileCheck,
      title: 'Smart ATS Match Engine',
      desc: 'Parse PDF resumes instantly, extract technical skills, evaluate keyword density, and compute job-fit compatibility scores with sub-score breakdowns.'
    },
    {
      icon: Sparkles,
      title: 'Gemini Executive Rewrites',
      desc: 'Harness Google Gemini 3.8 Flash to transform weak bullet points using the XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]).'
    },
    {
      icon: Bot,
      title: 'AI Mock Interview Simulator',
      desc: 'Dynamic voice-enabled mock interview based on your actual projects and experience, complete with real-time speech transcription & audio playback.'
    },
    {
      icon: Flame,
      title: 'Daily Streak & Progress Heatmap',
      desc: 'Build unstoppable career prep habits with daily streaks, 90-day activity calendars, and score trend tracking across attempts.'
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Career & Interview Platform 2.0
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.15]">
          Land Your Dream Role with <br />
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Precision AI Feedback
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Upload your resume for deep ATS scoring and Gemini-driven bullet rewrites. 
          Step into a live voice-powered mock interview tailored directly to your projects.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onPracticeInterview}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-4 h-4 text-emerald-500" />
            <span>Practice Mock Interview</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Powered by Google Gemini 3.8
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Speech Recognition
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Data Retention to Public AI
          </span>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Everything You Need To Beat The Applicant Tracking System
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Engineered from ground up to replicate modern recruiter evaluation pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="glass-panel p-6 hover:border-emerald-500/40 transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Mock Interview Preview Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel-elevated p-8 sm:p-10 border border-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Interactive Voice Interviewer
              </span>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                Ready for the hot seat? Experience real interview questions.
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-xl">
                Choose your difficulty level and role. Speak or type answers naturally, and receive a comprehensive executive report card with exemplar answers when finished.
              </p>
            </div>
            <button
              onClick={onPracticeInterview}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center gap-2 whitespace-nowrap transition-transform hover:scale-105"
            >
              <span>Launch Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
