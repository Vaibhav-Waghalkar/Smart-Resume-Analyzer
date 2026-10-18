import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

/* ─── Score utilities ────────────────────────────────────────────── */
const scoreColor = (s) => {
  if (s >= 75) return 'var(--c-primary)'          // emerald
  if (s >= 50) return 'var(--c-tertiary)'         // amber
  return 'var(--c-secondary)'                      // rose
}

const scoreGlow = (s) => {
  if (s >= 75) return 'var(--c-primary-glow)'
  if (s >= 50) return 'var(--c-tertiary-glow)'
  return 'var(--c-secondary-glow)'
}

const scoreChipClass = (s) => {
  if (s >= 75) return 'chip chip--emerald'
  if (s >= 50) return 'chip chip--amber'
  return 'chip chip--rose'
}

const scoreLabel = (s) => {
  if (s >= 75) return 'Strong Fit'
  if (s >= 50) return 'Review Needed'
  return 'Skill Gap'
}

/* ─── Match Score Circle ─────────────────────────────────────────── */
function ScoreCircle({ score, size = 190 }) {
  const r = size / 2 - 16
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(score, 100) / 100) * circ
  const col = scoreColor(score)
  const glow = scoreGlow(score)

  return (
    <div className="score-circle-wrap" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg className="score-circle-svg" width={size} height={size}>
        {/* Gradient definition for the gauge fill */}
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#b50036" />
            <stop offset="45%"  stopColor="#e29100" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r}
          stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        {/* Fill — gradient per DESIGN1.md */}
        <circle cx={size/2} cy={size/2} r={r}
          stroke="url(#gauge-grad)" strokeWidth="10" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          filter="url(#glow-filter)"
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="score-circle-text">
        <span className="score-circle-value score-glow" style={{ color: col, fontSize: 34 }}>
          {Math.round(score)}
        </span>
        <span className="score-circle-label">/ 100</span>
        <span className={scoreChipClass(score)} style={{ marginTop: 6, fontSize: 9 }}>
          {scoreLabel(score)}
        </span>
      </div>
    </div>
  )
}

/* ─── Score Bar Row ──────────────────────────────────────────────── */
function ScoreBarRow({ label, score }) {
  const col = scoreColor(score)
  const pct = Math.round(score)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span className="type-body-sm" style={{ color:'var(--c-on-surface-variant)' }}>{label}</span>
        <span style={{ fontFamily:'var(--font-geist)', fontVariantNumeric:'tabular-nums',
          fontSize:13, fontWeight:700, color:col }}>{pct}%</span>
      </div>
      <div className="score-bar">
        {/* Gradient fill, clipped to current score position */}
        <div className="score-bar__fill" style={{
          width: `${Math.min(pct,100)}%`,
          background: `linear-gradient(90deg, #b50036 0%, #e29100 45%, #10b981 100%)`,
          backgroundSize: '300px 100%',
          boxShadow: `0 0 6px ${col}44`,
        }} />
      </div>
    </div>
  )
}

/* ─── Recharts Tooltip ───────────────────────────────────────────── */
const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, score } = payload[0].payload
  return (
    <div style={{
      background: 'rgba(36,44,39,0.95)',
      backdropFilter: 'blur(40px)',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '8px 14px', borderRadius: 8, fontSize: 13,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontFamily:'var(--font-geist)', fontWeight:700, fontSize:11,
        textTransform:'uppercase', letterSpacing:'0.06em',
        color:'var(--c-muted)', marginBottom:3 }}>{name}</div>
      <div style={{ fontFamily:'var(--font-geist)', fontWeight:700,
        fontSize:18, color: scoreColor(score) }}>{Math.round(score)}%</div>
    </div>
  )
}

/* ─── Section Head ───────────────────────────────────────────────── */
function SectionHead({ icon, title, variant = 'emerald' }) {
  return (
    <div className="section-header">
      <div className={`section-header__icon section-header__icon--${variant}`}>{icon}</div>
      <h3 className="type-title-md">{title}</h3>
    </div>
  )
}

/* ─── Priority group ─────────────────────────────────────────────── */
function PriorityGroup({ label, level, children }) {
  const cols = { high:'var(--c-secondary)', medium:'var(--c-tertiary)', low:'var(--c-primary)' }
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span className="status-dot" style={{ background: cols[level], boxShadow:`0 0 8px ${cols[level]}66` }} />
        <span className="type-label-caps" style={{ color: cols[level] }}>{label}</span>
      </div>
      <div className="space-y-xs">{children}</div>
    </div>
  )
}

/* ─── Inline icons ───────────────────────────────────────────────── */
const BarIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
const CheckIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const XCircleIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
const UserIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const BulbIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>
const RefreshIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>

/* ─── Suggestion Item ────────────────────────────────────────────── */
function SuggestionItem({ suggestion }) {
  return (
    <div className={`suggestion-item suggestion-item--${suggestion.priority}`}>
      <div className="suggestion-item__header">
        <span className="suggestion-item__category">{suggestion.category}</span>
        <span className={`priority-badge priority-badge--${suggestion.priority}`}>{suggestion.priority}</span>
      </div>
      <p className="suggestion-item__message">{suggestion.message}</p>
    </div>
  )
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */
function ResultsDashboard({ analysisResults, onReupload }) {
  const { scoreData, parsedResume, suggestions, targetJobTitle } = analysisResults

  const breakdown = [
    { name: 'Skill Match',  score: scoreData.skill_match_score },
    { name: 'Education',   score: scoreData.education_score },
    { name: 'Experience',  score: scoreData.experience_score },
    { name: 'Formatting',  score: scoreData.completeness_score },
  ]

  const grouped = {
    high:   suggestions.filter(s => s.priority === 'high'),
    medium: suggestions.filter(s => s.priority === 'medium'),
    low:    suggestions.filter(s => s.priority === 'low'),
  }

  return (
    <div className="space-y-sm">

      {/* ══ Overall Score Card ══════════════════════════════════════ */}
      <div className="glass-card glass-card--active">
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center',
          justifyContent:'space-between', gap:24 }}>

          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
              <span className="status-dot status-dot--success" />
              <span className="type-label-caps" style={{ color:'var(--c-primary)' }}>Analysis Complete</span>
            </div>
            <h2 className="type-headline-lg" style={{ marginBottom:10 }}>Resume Analysis</h2>
            <p className="type-body-sm" style={{ color:'var(--c-on-surface-variant)', marginBottom:16 }}>
              Target position:&nbsp;
              <span className="chip chip--emerald" style={{ verticalAlign:'middle' }}>{targetJobTitle}</span>
            </p>
            <p className="type-body-sm" style={{ color:'var(--c-on-surface-variant)', lineHeight:'22px' }}>
              Your resume was evaluated across four dimensions. Use the breakdown and
              improvement signals below to maximize your match score.
            </p>
          </div>

          <ScoreCircle score={scoreData.overall_score} size={190} />
        </div>

        {/* Score bars */}
        <div className="divider" />
        <div className="grid-2">
          {breakdown.map(d => <ScoreBarRow key={d.name} label={d.name} score={d.score} />)}
        </div>
      </div>

      {/* ══ Chart Card ═════════════════════════════════════════════ */}
      <div className="glass-card">
        <SectionHead icon={<BarIcon />} title="Score Breakdown" variant="emerald" />
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={breakdown} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" vertical={false}
              stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name"
              tick={{ fill:'var(--c-on-surface-variant)', fontSize:12, fontFamily:'Geist, monospace' }}
              axisLine={false} tickLine={false} />
            <YAxis domain={[0,100]}
              tick={{ fill:'var(--c-on-surface-variant)', fontSize:11, fontFamily:'Geist, monospace' }}
              axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<DarkTooltip />} cursor={{ fill:'rgba(78,222,163,0.04)' }} />
            <Bar dataKey="score" radius={[6,6,0,0]}>
              {breakdown.map((e, i) => (
                <Cell key={i} fill={scoreColor(e.score)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ══ Skills Grid ════════════════════════════════════════════ */}
      <div className="grid-2">
        {/* Matched */}
        <div className="glass-card">
          <SectionHead icon={<CheckIcon />} title="Matched Skills" variant="emerald" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {scoreData.matched_skills?.length > 0
              ? scoreData.matched_skills.map((s,i) => (
                  <span key={i} className="chip chip--emerald">{s}</span>
                ))
              : <p className="type-body-sm text-muted">No matched skills detected.</p>
            }
          </div>
        </div>

        {/* Missing */}
        <div className="glass-card">
          <SectionHead icon={<XCircleIcon />} title={`Missing for ${targetJobTitle}`} variant="rose" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {scoreData.missing_skills?.length > 0
              ? scoreData.missing_skills.map((s,i) => (
                  <span key={i} className="chip chip--rose">{s}</span>
                ))
              : <p className="type-body-sm text-muted">No missing skills — perfect match!</p>
            }
          </div>
        </div>
      </div>

      {/* ══ Extracted Info ══════════════════════════════════════════ */}
      <div className="glass-card">
        <SectionHead icon={<UserIcon />} title="Extracted Information" variant="blue" />

        <div className="grid-4" style={{ marginBottom:'var(--sp-sm)' }}>
          {[
            { label:'Full Name',   value: parsedResume.name },
            { label:'Email',       value: parsedResume.email },
            { label:'Phone',       value: parsedResume.phone },
            { label:'Experience',  value: parsedResume.total_experience_years != null
              ? `${parsedResume.total_experience_years} yrs` : null },
          ].map(({ label, value }) => (
            <div key={label} className="info-tile">
              <div className="info-tile__label">{label}</div>
              <div className="info-tile__value">{value || '—'}</div>
            </div>
          ))}
        </div>

        {/* Detected skills */}
        {parsedResume.skills?.length > 0 && (
          <>
            <span className="type-label-caps text-muted" style={{ display:'block', marginBottom:8 }}>
              All Detected Skills
            </span>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'var(--sp-sm)' }}>
              {parsedResume.skills.map((s,i) => (
                <span key={i} className="chip chip--neutral">{s}</span>
              ))}
            </div>
          </>
        )}

        {/* Education */}
        {parsedResume.education?.length > 0 && (
          <>
            <div className="divider" />
            <span className="type-label-caps text-muted"
              style={{ display:'block', margin:'var(--sp-sm) 0 8px' }}>Education</span>
            <div className="space-y-xs">
              {parsedResume.education.map((e,i) => (
                <div key={i} className="timeline-entry">
                  <div className="timeline-entry__title">{e.degree || 'Degree not specified'}</div>
                  <div className="timeline-entry__sub">{e.institution || 'Institution not specified'}</div>
                  {e.years && <div className="timeline-entry__date">{e.years}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Experience */}
        {parsedResume.experience?.length > 0 && (
          <>
            <div className="divider" />
            <span className="type-label-caps text-muted"
              style={{ display:'block', margin:'var(--sp-sm) 0 8px' }}>Work Experience</span>
            <div className="space-y-xs">
              {parsedResume.experience.map((e,i) => (
                <div key={i} className="timeline-entry">
                  <div className="timeline-entry__title">{e.job_title || 'Title not specified'}</div>
                  <div className="timeline-entry__sub">{e.company || 'Company not specified'}</div>
                  {e.duration && <div className="timeline-entry__date">{e.duration}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══ Suggestions ════════════════════════════════════════════ */}
      <div className="glass-card">
        <SectionHead icon={<BulbIcon />} title="Improvement Suggestions" variant="amber" />
        {suggestions?.length > 0 ? (
          <div className="space-y-sm">
            {grouped.high.length > 0 && (
              <PriorityGroup label="High Priority" level="high">
                {grouped.high.map((s,i) => <SuggestionItem key={i} suggestion={s} />)}
              </PriorityGroup>
            )}
            {grouped.medium.length > 0 && (
              <PriorityGroup label="Medium Priority" level="medium">
                {grouped.medium.map((s,i) => <SuggestionItem key={i} suggestion={s} />)}
              </PriorityGroup>
            )}
            {grouped.low.length > 0 && (
              <PriorityGroup label="Low Priority" level="low">
                {grouped.low.map((s,i) => <SuggestionItem key={i} suggestion={s} />)}
              </PriorityGroup>
            )}
          </div>
        ) : (
          <p className="type-body-sm text-muted">Your resume looks great — no suggestions!</p>
        )}
      </div>

      {/* ══ Action ═════════════════════════════════════════════════ */}
      <div style={{ display:'flex', justifyContent:'center', paddingBottom:'var(--sp-lg)' }}>
        <button className="btn-ghost" onClick={onReupload} id="analyze-another-button">
          <RefreshIcon />
          Analyze Another Resume
        </button>
      </div>
    </div>
  )
}

export default ResultsDashboard
