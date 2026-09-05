import React, { useState } from 'react';
import { Search, Calendar, MessageSquare, PlusCircle, Sparkles, Compass, ListFilter, Lightbulb } from 'lucide-react';
import { JournalSession, PromptMode } from '../types';

interface HistoryViewProps {
  sessions: JournalSession[];
  isLoading: boolean;
  onSelectSession: (session: JournalSession) => void;
  onNewReflection: () => void;
}

const MODE_ICONS: Record<PromptMode, React.FC<{ className?: string }>> = {
  reflect: Sparkles,
  summarize: ListFilter,
  brainstorm: Lightbulb,
  explore: Compass,
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  sessions,
  isLoading,
  onSelectSession,
  onNewReflection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.messages.some((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMode = selectedModeFilter === 'all' || s.promptMode === selectedModeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div id="journal-history-view" className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      {/* Header with Search & Controls */}
      <div className="mb-6 pb-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-100">Reflection Archive</h2>
          <p className="text-xs text-stone-400 mt-1">
            {sessions.length} private reflection {sessions.length === 1 ? 'session' : 'sessions'} preserved in Cloud Firestore
          </p>
        </div>

        <button
          id="history-start-new-btn"
          onClick={onNewReflection}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reflection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="history-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past journal entries by keyword or thought..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Mode filter pills */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {['all', 'reflect', 'summarize', 'brainstorm', 'explore'].map((mode) => (
            <button
              key={mode}
              id={`filter-mode-${mode}`}
              onClick={() => setSelectedModeFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap ${
                selectedModeFilter === mode
                  ? 'bg-stone-800 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 bg-stone-900/60 border border-stone-800/80'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div id="history-loading-list" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-stone-900/40 border border-stone-800 animate-pulse">
              <div className="h-4 bg-stone-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-stone-800/60 rounded w-2/3 mb-2" />
              <div className="h-3 bg-stone-800/40 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        /* Empty State */
        <div id="history-empty-state" className="p-12 text-center rounded-2xl bg-stone-900/30 border border-stone-800/80 my-4">
          <Calendar className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h4 className="text-base font-medium text-stone-300 mb-1">
            {searchTerm || selectedModeFilter !== 'all' ? 'No matching reflections found' : 'No reflections recorded yet'}
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6 leading-relaxed">
            {searchTerm || selectedModeFilter !== 'all'
              ? 'Try changing your search keywords or clearing the category filter.'
              : 'Take a quiet moment to write your first reflection with Gemini.'}
          </p>
          <button
            id="empty-start-first-btn"
            onClick={onNewReflection}
            className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            Start First Reflection
          </button>
        </div>
      ) : (
        /* Sessions List */
        <div id="history-sessions-list" className="space-y-3.5">
          {filteredSessions.map((session) => {
            const Icon = MODE_ICONS[session.promptMode] || Sparkles;
            const lastMessage = session.messages[session.messages.length - 1];
            const dateStr = new Date(session.updatedAt || session.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(session.updatedAt || session.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                id={`session-card-${session.id}`}
                onClick={() => onSelectSession(session)}
                className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-stone-700 hover:bg-stone-900 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-base font-semibold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {session.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-stone-500 shrink-0">
                    {dateStr} &bull; {timeStr}
                  </span>
                </div>

                {lastMessage && (
                  <p className="text-xs text-stone-400 line-clamp-2 pl-9 mb-3 leading-relaxed">
                    {lastMessage.text}
                  </p>
                )}

                <div className="flex items-center justify-between pl-9 text-xs text-stone-500 pt-2 border-t border-stone-800/40">
                  <span className="inline-flex items-center space-x-1 capitalize text-stone-400 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1" />
                    {session.promptMode}
                  </span>

                  <span className="flex items-center space-x-1 text-[11px] text-stone-400">
                    <MessageSquare className="w-3 h-3" />
                    <span>{session.messages.length} messages</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
