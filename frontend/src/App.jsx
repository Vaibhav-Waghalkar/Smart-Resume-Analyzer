import { useState } from 'react'
import UploadSection from './components/UploadSection'
import ResultsDashboard from './components/ResultsDashboard'
import './App.css'

function App() {
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleError = (msg) => setError(msg)

  const handleReupload = () => {
    setAnalysisResults(null)
    setError(null)
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="app-header__badge">
            <span className="app-header__badge-dot" />
            Obsidian Intelligence
          </div>
          <h1 className="type-display-lg">Resume Analyzer</h1>
          <p className="app-header__subtitle">
            Upload a PDF resume, select your target role, and get an instant
            AI-powered match score with actionable improvement signals.
          </p>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner" style={{ marginBottom: 'var(--sp-sm)' }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0, marginTop: 2 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Views ── */}
        {!analysisResults
          ? <UploadSection onAnalysisComplete={handleAnalysisComplete} onError={handleError} />
          : <ResultsDashboard analysisResults={analysisResults} onReupload={handleReupload} />
        }
      </div>
    </div>
  )
}

export default App
