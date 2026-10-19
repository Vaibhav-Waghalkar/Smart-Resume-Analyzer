import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Info,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis
} from 'recharts';
import { resumeApi, JOB_TITLES } from '../api/resumeApi';

export default function ResumeAnalyzerPage({ onAnalysisDone, storedResults }) {
  const [file, setFile] = useState(null);
  const [targetJobTitle, setTargetJobTitle] = useState('Full Stack Developer');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState(storedResults || null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported.');
        return;
      }
      setFile(selected);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (!dropped.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported.');
        return;
      }
      setFile(dropped);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select or drop a PDF resume file.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      setStatusMessage('Extracting PDF text and document hierarchy...');
      const uploadRes = await resumeApi.uploadResume(file);
      const resumeText = uploadRes.data.extracted_text;
      const metadata = uploadRes.data;

      setStatusMessage('Parsing candidate skills, credentials, and work history...');
      const parseRes = await resumeApi.parseResume(resumeText);
      const parsedData = parseRes.data;

      setStatusMessage(`Scoring profile match against ${targetJobTitle}...`);
      const scoreRes = await resumeApi.scoreResume(resumeText, targetJobTitle, parsedData);
      const scoreData = scoreRes.data;

      setStatusMessage('Generating Gemini executive rewrites and ATS diagnostic tips...');
      const suggestionsRes = await resumeApi.getSuggestions(resumeText, scoreData, targetJobTitle);
      const suggestionsData = suggestionsRes.data;

      const completeAnalysis = {
        metadata,
        parsedData,
        scoreData,
        suggestionsData,
        targetJobTitle,
        resumeText
      };

      setResults(completeAnalysis);
      if (onAnalysisDone) onAnalysisDone(completeAnalysis);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please check your file.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    setResults(null);
    setFile(null);
    setError('');
  };

  // If analysis is complete, render diagnostic report with Coral theme
  if (results) {
    const { scoreData, suggestionsData, parsedData, metadata } = results;
    const overallScore = Math.round(scoreData?.overall_score || 0);
    const subscores = [
      { name: 'Skill Match', score: Math.round(scoreData?.skill_match_score || 0) },
      { name: 'Experience Depth', score: Math.round(scoreData?.experience_score || 0) },
      { name: 'Education Alignment', score: Math.round(scoreData?.education_score || 0) },
      { name: 'Formatting & Completeness', score: Math.round(scoreData?.completeness_score || 0) },
    ];

    const radialData = [{ 
      name: 'Score', 
      value: overallScore, 
      fill: overallScore >= 75 ? 'var(--accent-success)' : overallScore >= 50 ? 'var(--accent-progress)' : 'var(--accent-warning)' 
    }];
    const aiEnhanced = suggestionsData?.ai_enhanced;

    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Top Header Card */}
        <div className="editorial-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-2 border-l-[var(--accent-analyzer)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-label text-[10px] text-[var(--accent-analyzer)]">
                ATS DIAGNOSTIC REPORT
              </span>
              <span className="text-xs text-[var(--text-muted)]">• {metadata?.filename}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-normal text-[var(--text-primary)]">
              Target Role: <span className="font-editorial-italic text-2xl sm:text-3xl font-medium">{results.targetJobTitle}</span>
            </h1>
            <p className="text-xs font-mono-label text-[var(--text-secondary)] mt-1">
              {parsedData?.name || 'Candidate'} · {metadata?.word_count || 0} words · {parsedData?.total_experience_years || 0} yrs experience
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-md text-xs font-semibold border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center gap-1.5 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-analyzer)]" />
            <span>Analyze Another Resume</span>
          </button>
        </div>

        {/* Score & Subscore Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Circular Gauge */}
          <div className="editorial-card p-6 flex flex-col items-center justify-center text-center">
            <span className="font-mono-label text-[11px] text-[var(--text-muted)] mb-2">
              OVERALL MATCH SCORE
            </span>
            <div className="w-44 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={10} 
                  data={radialData} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'var(--border-color)' }} dataKey="value" cornerRadius={4} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono-label font-bold text-[var(--text-primary)]">{overallScore}%</span>
                <span className="text-[10px] font-mono-label mt-0.5" style={{ color: radialData[0].fill }}>
                  {overallScore >= 75 ? 'STRONG FIT' : overallScore >= 50 ? 'REVIEW NEEDED' : 'SKILL DEFICIT'}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3 max-w-xs leading-relaxed">
              Calculated against keyword frequency, title alignment, and technical stack prerequisites.
            </p>
          </div>

          {/* Subscores and Skills */}
          <div className="editorial-card p-6 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <span className="font-mono-label text-[11px] text-[var(--text-muted)]">
                SCORE BREAKDOWN
              </span>
              <span className="font-mono-label text-[10px] text-[var(--accent-analyzer)]">
                CORAL ACCENT
              </span>
            </div>

            <div className="space-y-4">
              {subscores.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-[var(--text-primary)]">{s.name}</span>
                    <span className="font-mono-label font-bold text-[var(--text-primary)]">{s.score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(s.score, 100)}%`,
                        backgroundColor: 'var(--accent-analyzer)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Matched vs Missing Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              <div>
                <span className="font-mono-label text-[10px] text-[var(--accent-success)] flex items-center gap-1.5 mb-2 font-bold">
                  <Check className="w-3.5 h-3.5" /> MATCHED SKILLS ({scoreData?.matched_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {scoreData?.matched_skills?.map((sk, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-mono-label">
                      {sk}
                    </span>
                  ))}
                  {(!scoreData?.matched_skills || scoreData.matched_skills.length === 0) && (
                    <span className="text-xs text-[var(--text-muted)]">No explicit matches</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-mono-label text-[10px] text-[var(--accent-warning)] flex items-center gap-1.5 mb-2 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> MISSING PREREQUISITES ({scoreData?.missing_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {scoreData?.missing_skills?.map((sk, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--accent-warning)] font-mono-label">
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Gemini Executive Rewrites */}
        {aiEnhanced && (
          <div className="space-y-6">
            
            {/* Executive Summary */}
            <div className="editorial-card p-6 border-l-2 border-l-[var(--accent-analyzer)]">
              <div className="flex items-center gap-2 font-mono-label text-[10px] text-[var(--accent-analyzer)] mb-2 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                EXECUTIVE SUMMARY
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed italic">
                "{aiEnhanced.executive_summary}"
              </p>
            </div>

            {/* Bullet Point Rewrites */}
            {aiEnhanced.bullet_point_rewrites?.length > 0 && (
              <div className="editorial-card p-6 space-y-4">
                <div className="flex items-baseline justify-between border-b border-[var(--border-color)] pb-3">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Experience Bullet Rewrites (Google XYZ Formula)
                  </h3>
                  <span className="font-mono-label text-[10px] text-[var(--text-muted)]">
                    ACCOMPLISHED [X] AS MEASURED BY [Y] BY DOING [Z]
                  </span>
                </div>

                <div className="space-y-3">
                  {aiEnhanced.bullet_point_rewrites.map((rw, i) => (
                    <div key={i} className="editorial-card-elevated p-4 space-y-2">
                      <div className="text-xs text-[var(--accent-warning)] line-through opacity-85">
                        {rw.original}
                      </div>
                      <div className="text-xs text-[var(--accent-success)] font-medium flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-success)]" />
                        <span>{rw.improved}</span>
                      </div>
                      <div className="text-[11px] font-mono-label text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
                        RATIONALE: {rw.impact_rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Formatting & Metrics Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="editorial-card p-6 space-y-3">
                <h4 className="font-mono-label text-[11px] text-[var(--text-primary)] font-bold flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-[var(--accent-analyzer)]" />
                  ATS FORMATTING DIAGNOSTICS
                </h4>
                <div className="space-y-2.5">
                  {aiEnhanced.ats_formatting_tips?.map((tip, idx) => (
                    <div key={idx} className="editorial-card-elevated p-3 text-xs space-y-1">
                      <div className="font-semibold text-[var(--text-primary)]">{tip.category}: {tip.issue}</div>
                      <div className="text-[var(--accent-success)] font-mono-label text-[11px]">{tip.fix}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editorial-card p-6 space-y-3">
                <h4 className="font-mono-label text-[11px] text-[var(--text-primary)] font-bold flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-progress)]" />
                  QUANTIFIABLE IMPACT SUGGESTIONS
                </h4>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  {aiEnhanced.quantifiable_achievement_tips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-progress)] shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }

  // Upload Form with Coral Accent
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] text-[10px] font-mono-label text-[var(--accent-analyzer)]">
          <FileText className="w-3 h-3" />
          <span>RESUME ANALYZER · CORAL ACCENT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
          Audit your resume against <span className="font-editorial-italic text-3xl sm:text-4xl">recruiter benchmarks</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-lg mx-auto">
          Upload your PDF and select a target role. We evaluate syntax, skill density, and generate XYZ bullet points.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-md text-xs border border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="editorial-card p-6 sm:p-8 space-y-6 border-t-2 border-t-[var(--accent-analyzer)]">
        
        {/* Role Selection */}
        <div>
          <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-2">
            TARGET JOB TITLE
          </label>
          <div className="relative">
            <Target className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
            <select
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-analyzer)] min-h-[44px]"
            >
              {JOB_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PDF Drag & Drop */}
        <div>
          <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-2">
            RESUME FILE (.PDF)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-file-input').click()}
            className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-[var(--accent-analyzer)] bg-[var(--bg-surface-elevated)]' 
                : file 
                  ? 'border-[var(--accent-analyzer)] bg-[var(--bg-surface-elevated)]' 
                  : 'border-[var(--border-color)] hover:border-[var(--accent-analyzer)] bg-[var(--bg-surface-elevated)]/50'
            }`}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="w-10 h-10 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-3 text-[var(--accent-analyzer)]">
              <Upload className="w-5 h-5" />
            </div>

            {file ? (
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">{file.name}</p>
                <p className="font-mono-label text-[10px] text-[var(--text-muted)] mt-1">
                  {(file.size / 1024).toFixed(1)} KB · CLICK TO CHANGE
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-xs text-[var(--text-primary)]">
                  Click to select or drag and drop your PDF resume
                </p>
                <p className="font-mono-label text-[10px] text-[var(--text-muted)] mt-1">
                  PDF FORMAT · UP TO 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="w-full py-3 px-6 rounded-md font-semibold text-xs text-white bg-[var(--accent-analyzer)] hover:opacity-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage || 'Analyzing resume with Gemini...'}</span>
            </div>
          ) : (
            <>
              <span>Analyze & Score Resume</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
