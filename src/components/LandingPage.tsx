import React from 'react';
import { Shield, Sparkles, Lock, ArrowRight, BookOpen, Key, BrainCircuit } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  authError: string | null;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, authError, isLoggingIn }) => {
  return (
    <div id="landing-page" className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-stone-100">Solitude AI</h1>
            <p className="text-xs text-stone-400">Private Reflection & Journaling</p>
          </div>
        </div>

        <button
          id="landing-header-login-btn"
          onClick={onLogin}
          disabled={isLoggingIn}
          className="px-4 py-2 text-sm font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thoughtful Multi-Turn Reflection Partner</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-100 max-w-2xl mb-6">
          A Safe Haven for Your Thoughts and Feelings
        </h2>

        <p className="text-lg text-stone-400 max-w-2xl mb-10 leading-relaxed">
          Explore your inner world with an empathetic AI reflection companion.
          Structured with end-to-end user isolation, private Cloud Firestore persistence, and strict security rules.
        </p>

        {authError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm max-w-md w-full text-left">
            <p className="font-semibold text-red-400 mb-1">Authentication Notice</p>
            <p>{authError}</p>
          </div>
        )}

        <div className="w-full max-w-md flex flex-col items-center space-y-4">
          <button
            id="landing-google-login-btn"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold text-base flex items-center justify-center space-x-3 transition-all shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Continue with Google'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <p className="text-xs text-stone-500 flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Authenticated via Firebase. Passwords are never stored.</span>
          </p>
        </div>

        {/* Feature Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full text-left">
          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-200 mb-2">Isolated Ownership</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Every journal entry and conversation thread is protected by user-specific Cloud Firestore security rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-200 mb-2">Empathetic Reflection</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Multi-turn conversational reflections powered by Gemini: explore thoughts, summarize feelings, and brainstorm next steps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-200 mb-2">Server-Side Credentials</h3>
            <p className="text-sm text-stone-400 leading-relaxed">
              Gemini API keys and credentials are kept strictly server-side, shielding secrets from frontend browser bundles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-500">
        <p>Private & Encrypted Journaling Environment &bull; Solitude AI</p>
      </footer>
    </div>
  );
};
