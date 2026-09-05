/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { JournalSession, JournalMessage, PromptMode } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, loading: authLoading, error: authError, signInWithGoogle, logout, getIdToken } = useAuth();

  // Navigation views: 'dashboard' | 'history'
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');

  // Active session state
  const [activeSession, setActiveSession] = useState<JournalSession | null>(null);
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Reflection generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Subscribe to authenticated user's private sessions
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }

    setLoadingSessions(true);
    // Strict user scoping: /users/{user.uid}/sessions
    const sessionsCol = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsCol, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs: JournalSession[] = [];
        snapshot.forEach((d) => {
          docs.push(d.data() as JournalSession);
        });
        setSessions(docs);
        setLoadingSessions(false);
      },
      (error) => {
        console.error('Failed to load user sessions:', error);
        setLoadingSessions(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Error is tracked in AuthContext
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveSession(null);
    setCurrentView('dashboard');
  };

  const handleStartNewSession = () => {
    setActiveSession(null);
    setCurrentView('dashboard');
    setGenerationError(null);
  };

  const handleSelectSession = (session: JournalSession) => {
    setActiveSession(session);
    setCurrentView('dashboard');
    setGenerationError(null);
  };

  // Send a message/reflection turn
  const handleSendMessage = useCallback(async (text: string, mode: PromptMode) => {
    if (!user || !text.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    const userMsg: JournalMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Determine session ID and history
    const sessionId = activeSession?.id || `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const existingMessages = activeSession ? activeSession.messages : [];
    const updatedMessagesWithUser = [...existingMessages, userMsg];

    try {
      // Request Gemini reflection through secure server-side proxy
      const token = await getIdToken();
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: text.trim(),
          mode,
          history: updatedMessagesWithUser.slice(-8).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const aiText = data.text || 'I have reflected on your thought.';

      const aiMsg: JournalMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'gemini',
        text: aiText,
        timestamp: new Date().toISOString(),
      };

      const fullMessages = [...updatedMessagesWithUser, aiMsg];

      // Generate concise session title if new
      const sessionTitle = activeSession?.title || (
        text.length > 40 ? text.slice(0, 37) + '...' : text
      );

      const sessionData: JournalSession = {
        id: sessionId,
        userId: user.uid,
        title: sessionTitle,
        promptMode: mode,
        messages: fullMessages,
        createdAt: activeSession?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist to Cloud Firestore: /users/{user.uid}/sessions/{sessionId}
      const sessionDocRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      await setDoc(sessionDocRef, sessionData);

      // Update local state only after successful persistence
      setActiveSession(sessionData);
    } catch (err: any) {
      console.error('Error during reflection or persistence:', err);
      setGenerationError(err.message || 'An unexpected error occurred while reflecting or saving.');
      throw err; // Allow ChatView to preserve input for retry
    } finally {
      setIsGenerating(false);
    }
  }, [user, activeSession, getIdToken]);

  // When not authenticated or while checking initial session, render the full landing page
  if (!user) {
    return (
      <LandingPage
        onLogin={handleLogin}
        authError={authError}
        isLoggingIn={isSigningIn}
      />
    );
  }

  // Authenticated view: Private Dashboard
  return (
    <div id="app-authenticated-root" className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <Navbar
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewReflection={handleStartNewSession}
        onLogout={handleLogout}
      />

      <main id="app-main-content" className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' ? (
          <ChatView
            session={activeSession}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            generationError={generationError}
            onClearError={() => setGenerationError(null)}
          />
        ) : (
          <HistoryView
            sessions={sessions}
            isLoading={loadingSessions}
            onSelectSession={handleSelectSession}
            onNewReflection={handleStartNewSession}
          />
        )}
      </main>
    </div>
  );
}
