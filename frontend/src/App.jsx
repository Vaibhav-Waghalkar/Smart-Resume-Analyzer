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
    return localStorage.getItem('sra_theme') === 'dark' || true;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [latestResumeText, setLatestResumeText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const { user } = useAuth();

  // Apply dark mode class to root html element
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      
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
      <main className="flex-1">
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
            onRefresh={fetchOverview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] py-6 text-center text-xs text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Smart Resume Analyzer. Powered by Google Gemini 3.8 & Groq.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-500">Home</button>
            <button onClick={() => setActiveTab('analyzer')} className="hover:text-emerald-500">ATS Scorer</button>
            <button onClick={() => setActiveTab('interview')} className="hover:text-emerald-500">Mock Interview</button>
            <button onClick={() => setActiveTab('progress')} className="hover:text-emerald-500">Streaks</button>
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
