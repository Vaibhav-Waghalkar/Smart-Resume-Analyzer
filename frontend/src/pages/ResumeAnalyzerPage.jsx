import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Tag,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
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
      setStatusMessage('Extracting text and structure from PDF...');
      const uploadRes = await resumeApi.uploadResume(file);
      const resumeText = uploadRes.data.extracted_text;
      const metadata = uploadRes.data;

      setStatusMessage('Parsing candidate skills, education, and experience...');
      const parseRes = await resumeApi.parseResume(resumeText);
      const parsedData = parseRes.data;

      setStatusMessage(`Scoring profile match against ${targetJobTitle}...`);
      const scoreRes = await resumeApi.scoreResume(resumeText, targetJobTitle, parsedData);
      const scoreData = scoreRes.data;

      setStatusMessage('Calling Gemini 3.8 Flash for bullet rewrites & ATS tips...');
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
      setError(err.response?.data?.detail || err.message || 'Analysis failed. Please try again.');
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

  // If results are available, render the deep score breakdown & Gemini suggestions
  if (results) {
    const { scoreData, suggestionsData, parsedData, metadata } = results;
    const overallScore = Math.round(scoreData?.overall_score || 0);
    const subscores = [
      { name: 'Skill Match', score: Math.round(scoreData?.skill_match_score || 0) },
      { name: 'Experience', score: Math.round(scoreData?.experience_score || 0) },
      { name: 'Education', score: Math.round(scoreData?.education_score || 0) },
      { name: 'Completeness', score: Math.round(scoreData?.completeness_score || 0) },
    ];

    const radialData = [{ name: 'Score', value: overallScore, fill: overallScore >= 75 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444' }];
    const aiEnhanced = suggestionsData?.ai_enhanced;

    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header Summary */}
        <div className="glass-panel p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Evaluation Complete
              </span>
              <span className="text-xs text-[var(--text-muted)]">{metadata?.filename}</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
              Target Role: <span className="text-emerald-500">{results.targetJobTitle}</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Candidate: {parsedData?.name || 'Candidate'} • Word Count: {metadata?.word_count || 0} • Est. Exp: {parsedData?.total_experience_years || 0} yrs
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-emerald-500/50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Analyze Another Resume
          </button>
        </div>

        {/* Score Visualization Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radial Gauge */}
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Overall ATS Match Score</h3>
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  barSize={12} 
                  data={radialData} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'var(--border-color)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[var(--text-primary)]">{overallScore}%</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  {overallScore >= 75 ? 'Strong Match' : overallScore >= 50 ? 'Moderate Fit' : 'Needs Optimization'}
                </span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-xs">
              Based on skill overlap, title correlation, years of experience, and ATS structure benchmarks.
            </p>
          </div>

          {/* Subscore Breakdown Bars */}
          <div className="glass-panel p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Competency Category Breakdown</h3>
            <div className="space-y-4">
              {subscores.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[var(--text-primary)]">{s.name}</span>
                    <span className="text-emerald-500">{s.score}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${Math.min(s.score, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Matched vs Missing Skills */}
            <div className="mt-6 pt-5 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mb-2">
                  <Check className="w-3.5 h-3.5" /> Matched Skills ({scoreData?.matched_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {scoreData?.matched_skills?.map((sk, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                      {sk}
                    </span>
                  ))}
                  {(!scoreData?.matched_skills || scoreData.matched_skills.length === 0) && (
                    <span className="text-xs text-[var(--text-muted)]">No explicit matches</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Recommended Keywords ({scoreData?.missing_skills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {scoreData?.missing_skills?.map((sk, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Gemini AI Executive Suggestions & Bullet Rewrites */}
        {aiEnhanced && (
          <div className="space-y-6">
            
            {/* Executive Summary */}
            <div className="glass-panel p-6 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
                <Sparkles className="w-4 h-4" />
                Gemini 3.8 Flash • Executive Evaluation
              </div>
              <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                "{aiEnhanced.executive_summary}"
              </p>
            </div>

            {/* Bullet Point Rewrites (XYZ Formula) */}
            {aiEnhanced.bullet_point_rewrites && aiEnhanced.bullet_point_rewrites.length > 0 && (
              <div className="glass-panel p-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  High-Impact Bullet Point Rewrites (Google XYZ Formula)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  Transform vague responsibilities into quantifiable metrics (Accomplished [X] as measured by [Y] by doing [Z]).
                </p>

                <div className="space-y-4">
                  {aiEnhanced.bullet_point_rewrites.map((rw, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-2">
                      <div className="text-xs text-red-400 font-medium line-through opacity-80">
                        {rw.original}
                      </div>
                      <div className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                        <span>{rw.improved}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-[var(--border-color)]">
                        Recruiter rationale: {rw.impact_rationale}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ATS Formatting & Keyword Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ATS Formatting Tips */}
              <div className="glass-panel p-6">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" /> ATS Formatting Checklist
                </h4>
                <div className="space-y-3">
                  {aiEnhanced.ats_formatting_tips?.map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-xs">
                      <span className="font-bold text-[var(--text-primary)] block mb-0.5">{tip.category}: {tip.issue}</span>
                      <span className="text-emerald-500">{tip.fix}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantifiable Achievement Tips */}
              <div className="glass-panel p-6">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" /> Metrics & Quantifiable Achievements
                </h4>
                <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                  {aiEnhanced.quantifiable_achievement_tips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
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

  // Upload Form
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          AI Resume ATS Optimizer
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload your resume in PDF format and choose your target job role to generate immediate recruiter insights.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-500 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel p-6 sm:p-8 space-y-6">
        
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Target Job Title
          </label>
          <div className="relative">
            <Target className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5" />
            <select
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {JOB_TITLES.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag & Drop File Upload Box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Resume PDF File
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-500/5' 
                : file 
                  ? 'border-emerald-500/50 bg-[var(--bg-surface-elevated)]' 
                  : 'border-[var(--border-color)] hover:border-emerald-500/30 bg-[var(--bg-surface-elevated)]'
            }`}
            onClick={() => document.getElementById('resume-file-input').click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>

            {file ? (
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">
                  Click to upload or drag & drop PDF here
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Maximum file size: 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{statusMessage || 'Analyzing Resume with Gemini...'}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Score Resume</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
