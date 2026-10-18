import { useState, useRef } from 'react'
import { resumeApi, JOB_TITLES } from '../api/resumeApi'

/* ─── SVG Icons ─────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
  </svg>
)

const FileCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <polyline points="9 15 11 17 15 13"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

/* ─── Helpers ────────────────────────────────────────────────────── */
const fmt = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024, sz = ['B','KB','MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sz[i]}`
}

const STEPS = ['Upload', 'Parse', 'Score', 'Suggest']

/* ─── Component ──────────────────────────────────────────────────── */
function UploadSection({ onAnalysisComplete, onError }) {
  const [file, setFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobInput, setJobInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const inputRef = useRef(null)

  const filteredTitles = JOB_TITLES.filter(t =>
    t.toLowerCase().includes(jobInput.toLowerCase())
  )

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') { setFile(f); onError(null) }
    else onError('Please drop a PDF file.')
  }

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f?.type === 'application/pdf') { setFile(f); onError(null) }
    else { onError('Please select a PDF file.'); setFile(null) }
  }

  const handleJobInput = (e) => {
    const v = e.target.value
    setJobInput(v); setJobTitle(v)
    setShowDropdown(v.length > 0)
  }

  const handleJobSelect = (t) => {
    setJobTitle(t); setJobInput(t); setShowDropdown(false)
  }

  const handleAnalyze = async () => {
    if (!file || !jobTitle) return
    setLoading(true); onError(null)
    try {
      setStep(1)
      const uploadData = await resumeApi.uploadResume(file)
      const txt = uploadData.data.extracted_text

      setStep(2)
      const parseData = await resumeApi.parseResume(txt)
      const parsed = parseData.data

      setStep(3)
      const scoreData = await resumeApi.scoreResume(txt, jobTitle, parsed)

      setStep(4)
      const suggestData = await resumeApi.getSuggestions(txt, scoreData.data, jobTitle)

      onAnalysisComplete({
        uploadData: uploadData.data,
        parsedResume: parsed,
        scoreData: scoreData.data,
        suggestions: suggestData.data.suggestions,
        targetJobTitle: jobTitle,
      })
    } catch (err) {
      onError(err.response?.data?.detail || err.message || 'Analysis failed.')
    } finally {
      setLoading(false); setStep(0)
    }
  }

  const isValid = file && jobTitle.trim().length > 0

  return (
    <div className="glass-card glass-card--active" style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Card header ── */}
      <div className="glass-card__header">
        <div>
          <h2 className="type-title-md">Upload Resume</h2>
          <p className="type-body-sm" style={{ color: 'var(--c-on-surface-variant)', marginTop: 4 }}>
            PDF · max 10 MB
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span className={`status-dot ${isValid ? 'status-dot--success' : 'status-dot--action'}`} />
          <span className="type-label-caps text-muted">{isValid ? 'Ready' : 'Action Required'}</span>
        </div>
      </div>

      {/* ── Step bar (loading only) ── */}
      {loading && (
        <div className="step-indicator">
          {STEPS.map((label, i) => {
            const idx = i + 1, done = idx < step, active = idx === step
            return (
              <div key={label} className="step">
                <div className={`step__num ${done ? 'step__num--done' : active ? 'step__num--active' : 'step__num--pending'}`}>
                  {done
                    ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="2 6 5 9 10 3"/></svg>
                    : idx}
                </div>
                <span className="step__label" style={{ color: active ? 'var(--c-primary)' : 'var(--c-muted)' }}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Upload Zone ── */}
      <div
        className={`upload-zone ${dragActive ? 'upload-zone--active' : ''} ${file ? 'upload-zone--has-file' : ''}`}
        style={{ marginBottom: 'var(--sp-sm)' }}
        onDragEnter={handleDrag} onDragLeave={handleDrag}
        onDragOver={handleDrag} onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload PDF resume"
      >
        <input ref={inputRef} type="file" accept=".pdf"
          onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />

        {file ? (
          <>
            <div className="upload-zone__icon-wrap"
              style={{ background: 'rgba(78,222,163,0.15)', border: '1px solid rgba(78,222,163,0.3)' }}>
              <FileCheckIcon />
            </div>
            <div className="upload-zone__title" style={{ color: 'var(--c-primary)' }}>{file.name}</div>
            <div className="upload-zone__sub">{fmt(file.size)} — click to replace</div>
          </>
        ) : (
          <>
            <div className="upload-zone__icon-wrap"><UploadIcon /></div>
            <div className="upload-zone__title">
              {dragActive ? 'Release to drop' : 'Drag & Drop your resume'}
            </div>
            <div className="upload-zone__sub">
              or <span className="upload-zone__link">click to browse</span> — PDF only
            </div>
          </>
        )}
      </div>

      {/* ── Job Title Field ── */}
      <div className="input-group">
        <label className="input-label" htmlFor="job-title-input">Target Job Title</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position:'absolute', left:12, color:'var(--c-muted)', display:'flex', pointerEvents:'none', zIndex:1 }}>
            <SearchIcon />
          </span>
          <input
            id="job-title-input"
            className="input-field"
            style={{ paddingLeft: 36 }}
            type="text"
            value={jobInput}
            onChange={handleJobInput}
            onFocus={() => setShowDropdown(jobInput.length > 0)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 160)}
            placeholder="e.g. Data Scientist, Frontend Developer"
            autoComplete="off"
          />
        </div>

        {showDropdown && filteredTitles.length > 0 && (
          <div className="autocomplete-dropdown">
            {filteredTitles.map(t => (
              <button key={t} className="autocomplete-item" onMouseDown={() => handleJobSelect(t)}>
                <span className="autocomplete-item__dot" />
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Selected chip ── */}
      {jobTitle && !showDropdown && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'var(--sp-sm)', marginTop:-6 }}>
          <span className="chip chip--emerald">
            {jobTitle}
            <button className="chip__remove"
              onClick={() => { setJobTitle(''); setJobInput('') }} aria-label="Clear">✕</button>
          </span>
        </div>
      )}

      <div className="divider" />

      {/* ── CTA ── */}
      <button
        className="btn-primary" onClick={handleAnalyze}
        disabled={!isValid || loading} id="analyze-button" aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="spinner" />
            {STEPS[step - 1] ? `${STEPS[step - 1]}ing…` : 'Processing…'}
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Analyze Resume
          </>
        )}
      </button>
    </div>
  )
}

export default UploadSection
