import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import MockInterviewPage from './pages/MockInterviewPage';
import ProgressPage from './pages/ProgressPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { resumeApi } from './api/resumeApi';

function MainApp() {
  const [activeTab, setActiveTab] = useState('landing');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('sra_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [latestResumeText, setLatestResumeText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const { user } = useAuth();

  // Apply dark mode class to root html element and persist
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('sra_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sra_theme', 'light');
    }
  }, [darkMode]);

  // Fetch progress & streak stats whenever user is active or tab changes
  const fetchOverview = async () => {
    try {
      if (user) {
        const data = await resumeApi.getProgressOverview();
        setProgressData(data);
        if (data.streak) setStreakData(data.streak);
      }
    } catch (e) {
      console.warn('Could not fetch progress overview:', e);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [user, activeTab]);

  const handleAnalysisDone = (results) => {
    setAnalysisResults(results);
    if (results.resumeText) setLatestResumeText(results.resumeText);
    fetchOverview();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-150">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        openAuthModal={() => setAuthModalOpen(true)}
        streakData={streakData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setActiveTab('analyzer')}
            onPracticeInterview={() => setActiveTab('interview')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            streakData={streakData}
            progressData={progressData}
          />
        )}

        {activeTab === 'analyzer' && (
          <ResumeAnalyzerPage
            onAnalysisDone={handleAnalysisDone}
            storedResults={analysisResults}
          />
        )}

        {activeTab === 'interview' && (
          <MockInterviewPage
            resumeText={latestResumeText}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressPage
            streakData={streakData}
            progressData={progressData}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-6 text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono-label text-[11px] text-[var(--text-muted)]">
            © {new Date().getFullYear()} Resume Analyzer Studio · Powered by Google Gemini
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => setActiveTab('landing')} className="hover:text-[var(--text-primary)]">Home</button>
            <button onClick={() => setActiveTab('analyzer')} className="hover:text-[var(--accent-analyzer)]">ATS Scorer</button>
            <button onClick={() => setActiveTab('interview')} className="hover:text-[var(--accent-interview)]">Mock Interview</button>
            <button onClick={() => setActiveTab('progress')} className="hover:text-[var(--accent-progress)]">Streaks</button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); fetchOverview(); }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
