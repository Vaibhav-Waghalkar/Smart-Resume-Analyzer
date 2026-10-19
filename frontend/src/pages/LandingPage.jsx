import React from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ChevronRight, 
  Check, 
  Flame, 
  Bot, 
  Sparkles,
  FileText
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onPracticeInterview }) {
  // Sample 90-day heatmap data for the preview
  const sampleHeatmapDays = Array.from({ length: 42 }, (_, i) => {
    // Produce realistic active frequency
    const activity = (i % 3 === 0 || i % 7 === 0 || i > 30) ? (i % 4 || 1) : 0;
    return activity;
  });

  return (
    <div className="space-y-24 py-8 md:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
      
      {/* ─── Hero Section: Marked-up Resume Editorial Concept ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-2 md:pt-6">
        
        {/* Left Column: Asymmetrical, human, left-aligned */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[var(--text-primary)] leading-[1.08]">
            Your resume, <br />
            <span className="font-editorial-italic text-5xl sm:text-6xl md:text-7xl font-normal text-[var(--text-primary)]">
              marked up.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg leading-relaxed">
            Upload your resume, see exactly what to fix, then practice the interview out loud.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-md font-semibold text-xs btn-primary-solid flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>Upload your resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPracticeInterview}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline underline-offset-4 py-2 min-h-[44px] flex items-center"
            >
              or try a mock interview
            </button>
          </div>

          <p className="text-[11px] font-mono-label text-[var(--text-muted)] pt-3">
            YOUR RESUME IS SENT TO GOOGLE GEMINI TO GENERATE FEEDBACK.
          </p>
        </div>

        {/* Right Column: Interactive Paper-Style Resume Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
          
          {/* Paper card tilted ~2 degrees */}
          <div 
            className="w-full max-w-[420px] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-6 sm:p-7 shadow-md relative transition-transform duration-300 ease-out hover:rotate-0 rotate-1 sm:rotate-2 select-none"
            style={{
              boxShadow: '0 4px 20px -2px rgba(27, 26, 34, 0.08)'
            }}
          >
            {/* Amber Score Stamp (top right corner) */}
            <div className="absolute -top-3.5 -right-3.5 px-3 py-1.5 rounded-md border border-[var(--accent-progress)] bg-[var(--bg-surface)] font-mono-label font-bold text-xs text-[var(--accent-progress)] shadow-xs rotate-3">
              72 / 100
            </div>

            {/* Faux Resume Header */}
            <div className="border-b border-[var(--border-color)] pb-4 mb-4">
              <div className="text-sm font-bold text-[var(--text-primary)]">Sarah Jenkins</div>
              <div className="font-mono-label text-[10px] text-[var(--text-muted)] mt-0.5">
                FULL STACK DEVELOPER · SAN FRANCISCO, CA
              </div>
            </div>

            {/* Work History Section */}
            <div className="space-y-3.5 text-left">
              <div className="flex items-center justify-between font-mono-label text-[10px] text-[var(--text-muted)]">
                <span>EXPERIENCE</span>
                <span>2022 — PRESENT</span>
              </div>

              {/* Bullet 1: Weak, marked with Coral Highlighter */}
              <div className="relative group">
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  • Worked on the internal search API and helped improve overall performance for users.
                </p>
                {/* Coral Highlighter Overlay */}
                <div 
                  className="absolute inset-0 -mx-1 -my-0.5 rounded pointer-events-none opacity-20"
                  style={{ backgroundColor: 'var(--accent-analyzer)' }}
                />
              </div>

              {/* Lavender Margin Sticky Note */}
              <div className="my-2 p-2 rounded border border-[var(--accent-interview)]/40 bg-[var(--bg-surface-elevated)] text-[10px] font-mono-label text-[var(--accent-interview)] flex items-center justify-between">
                <span>↳ ADD A NUMBER HERE (LATENCY / CPU)</span>
                <span className="font-bold">XYZ FORMULA</span>
              </div>

              {/* Bullet 2: Second weak bullet marked */}
              <div className="relative">
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  • Collaborated with teammates on React components for customer billing page.
                </p>
                <div 
                  className="absolute inset-0 -mx-1 -my-0.5 rounded pointer-events-none opacity-15"
                  style={{ backgroundColor: 'var(--accent-analyzer)' }}
                />
              </div>

              {/* Bullet 3: Normal bullet */}
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed opacity-60">
                • Maintained CI/CD deployment pipelines using GitHub Actions and Docker containers.
              </p>
            </div>

            {/* Overlapping Interview Chat Bubble (bottom-left corner) */}
            <div 
              className="absolute -bottom-4 -left-4 sm:-left-6 px-3.5 py-2.5 rounded-lg border border-[var(--accent-interview)] bg-[var(--bg-surface)] shadow-md text-xs font-medium text-[var(--text-primary)] flex items-center gap-2 -rotate-1 max-w-[260px]"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--accent-interview)] shrink-0" />
              <span className="leading-snug">"Tell me about this project."</span>
            </div>

          </div>

        </div>

      </section>

      {/* ─── Section 1: Before / After Comparison ─────────────────────────── */}
      <section className="space-y-6 pt-6">
        <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Before and after
          </h2>
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
            HOW WE REWRITE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Before Column */}
          <div className="editorial-card p-6 space-y-3 border-l-2 border-l-[var(--accent-warning)]">
            <span className="font-mono-label text-[10px] text-[var(--accent-warning)] font-bold">
              BEFORE (TYPICAL RESUME BULLET)
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-through opacity-85">
              "Helped improve database query speeds and worked on backend optimization."
            </p>
            <div className="pt-2 text-[11px] text-[var(--text-muted)] font-mono-label">
              ISSUE: Vague responsibility with no measurable outcome.
            </div>
          </div>

          {/* After Column */}
          <div className="editorial-card p-6 space-y-3 border-l-2 border-l-[var(--accent-success)]">
            <span className="font-mono-label text-[10px] text-[var(--accent-success)] font-bold">
              AFTER (REWRITTEN)
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
              "Reduced p95 PostgreSQL query latency by <strong className="text-[var(--accent-success)] underline decoration-1 underline-offset-2">42%</strong> by restructuring compound indexes across 12M records."
            </p>
            <div className="pt-2 text-[11px] text-[var(--text-muted)] font-mono-label">
              RESULT: Demonstrates exact action, metric, and engineering scope.
            </div>
          </div>

        </div>
      </section>

      {/* ─── Section 2: How It Works (Three Large Numbered Rows) ──────────── */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            How it works
          </h2>
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
            THREE STEPS
          </span>
        </div>

        <div className="divide-y divide-[var(--border-color)] border-y border-[var(--border-color)]">
          
          {/* Row 01 */}
          <div className="py-6 sm:py-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4 md:gap-6">
              <span className="font-mono-label text-2xl sm:text-3xl font-bold" style={{ color: 'var(--accent-analyzer)' }}>
                01
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  Upload your resume
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                  Drop in your PDF and choose your target job title. We parse your text, extract skills, and check against recruiter criteria.
                </p>
              </div>
            </div>
            <span className="font-mono-label text-[10px] text-[var(--text-muted)] shrink-0">
              PDF PARSING
            </span>
          </div>

          {/* Row 02 */}
          <div className="py-6 sm:py-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4 md:gap-6">
              <span className="font-mono-label text-2xl sm:text-3xl font-bold" style={{ color: 'var(--accent-progress)' }}>
                02
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  Get marked up
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                  Inspect missing technical keywords, see your overall match score, and read line-by-line rewrites based on real experience.
                </p>
              </div>
            </div>
            <span className="font-mono-label text-[10px] text-[var(--text-muted)] shrink-0">
              REWRITES & FEEDBACK
            </span>
          </div>

          {/* Row 03 */}
          <div className="py-6 sm:py-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-4 md:gap-6">
              <span className="font-mono-label text-2xl sm:text-3xl font-bold" style={{ color: 'var(--accent-interview)' }}>
                03
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                  Get interviewed
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                  Answer questions based on your actual projects. Speak aloud with your mic or type responses, then review an evaluation with model answers.
                </p>
              </div>
            </div>
            <span className="font-mono-label text-[10px] text-[var(--text-muted)] shrink-0">
              VOICE SIMULATOR
            </span>
          </div>

        </div>
      </section>

      {/* ─── Section 3: Keep the Streak (Heatmap Preview) ─────────────────── */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Keep the streak
          </h2>
          <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
            DAILY HABIT
          </span>
        </div>

        <div className="editorial-card p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[var(--accent-progress)] fill-[var(--accent-progress)]" />
                Practice a little every day
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-lg leading-relaxed">
                Log a resume revision or complete one short mock interview session to keep your streak unbroken.
              </p>
            </div>
            <span className="font-mono-label text-xs font-bold text-[var(--accent-progress)] shrink-0">
              5 DAY STREAK
            </span>
          </div>

          {/* Sample Heatmap Grid Preview */}
          <div className="pt-2 overflow-x-auto">
            <div className="flex gap-1.5 min-w-[340px]">
              {sampleHeatmapDays.map((lvl, idx) => {
                const bg = lvl === 0 
                  ? 'var(--bg-surface-elevated)' 
                  : lvl === 1 
                    ? 'rgba(245, 184, 65, 0.3)' 
                    : lvl === 2 
                      ? 'rgba(245, 184, 65, 0.65)' 
                      : 'var(--accent-progress)';
                return (
                  <div
                    key={idx}
                    style={{ backgroundColor: bg }}
                    className="w-3.5 h-3.5 rounded-xs border border-[var(--border-color)] shrink-0"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Closing Section ──────────────────────────────────────────────── */}
      <section className="editorial-card-elevated p-8 sm:p-12 text-center space-y-5">
        <h2 className="text-2xl sm:text-3xl font-normal text-[var(--text-primary)] tracking-tight">
          Ready to see where your resume <span className="font-editorial-italic text-3xl sm:text-4xl">stands?</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
          Upload your file now to get clear marks on what to change before your next application.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 rounded-md font-semibold text-xs btn-primary-solid flex items-center gap-2 min-h-[44px]"
          >
            <span>Upload your resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ─── Simple Editorial Footer ──────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-color)] pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-mono-label">
        <div>SMART RESUME ANALYZER</div>
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com/Vaibhav-Waghalkar/Smart-Resume-Analyzer" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            GITHUB REPOSITORY
          </a>
          <span>·</span>
          <span>POWERED BY GOOGLE GEMINI</span>
        </div>
      </footer>

    </div>
  );
}
