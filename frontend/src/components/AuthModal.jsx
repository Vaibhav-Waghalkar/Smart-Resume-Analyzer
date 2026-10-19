import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      const res = await register(email, password, name);
      if (res.success) onClose();
      else setError(res.error);
    } else {
      const res = await login(email, password);
      if (res.success) onClose();
      else setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md editorial-card p-6 sm:p-8 relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] min-h-[36px]"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="w-8 h-8 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex items-center justify-center mb-3 text-[var(--text-primary)]">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-normal text-[var(--text-primary)]">
            {isRegister ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {isRegister 
              ? 'Save your resumes, track daily practice streaks, and simulate interviews.' 
              : 'Sign in to continue your resume and interview preparation.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md text-xs border border-[var(--accent-warning)]/30 bg-[var(--accent-warning)]/10 text-[var(--accent-warning)] font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-1.5">
                FULL NAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] min-h-[40px]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-1.5">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] min-h-[40px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-label text-[10px] text-[var(--text-muted)] mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] min-h-[40px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-md font-semibold text-xs btn-primary-solid flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors min-h-[36px]"
          >
            {isRegister 
              ? 'Already have an account? Sign in' 
              : "Don't have an account yet? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
