import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, RefreshCw, AlertCircle, MessageSquare, Compass, ListFilter, Lightbulb, CheckCircle2 } from 'lucide-react';
import { JournalSession, PromptMode } from '../types';

interface ChatViewProps {
  session: JournalSession | null;
  onSendMessage: (text: string, mode: PromptMode) => Promise<void>;
  isGenerating: boolean;
  generationError: string | null;
  onClearError: () => void;
}

const MODES: { id: PromptMode; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
  { id: 'reflect', label: 'Reflect', icon: Sparkles, description: 'Deep, mindful questions and empathetic insights' },
  { id: 'summarize', label: 'Summarize', icon: ListFilter, description: 'Distill core emotional themes and takeaways' },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, description: 'Creative reframing and gentle possibilities' },
  { id: 'explore', label: 'Explore', icon: Compass, description: 'Socratic exploration of thoughts and growth' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  session,
  onSendMessage,
  isGenerating,
  generationError,
  onClearError,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<PromptMode>(session?.promptMode || 'reflect');
  const [lastAttemptedText, setLastAttemptedText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync mode if active session changes
  useEffect(() => {
    if (session?.promptMode) {
      setSelectedMode(session.promptMode);
    }
  }, [session?.id, session?.promptMode]);

  // Scroll to bottom on new messages or generation activity
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isGenerating]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isGenerating) return;

    onClearError();
    setLastAttemptedText(textToSend);

    try {
      // Input is preserved until successful completion
      await onSendMessage(textToSend, selectedMode);
      // ONLY clear after save succeeded
      setInputText('');
      setLastAttemptedText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Input text stays in the textarea for retry
    }
  };

  const handleRetry = () => {
    if (lastAttemptedText) {
      setInputText(lastAttemptedText);
    }
    handleSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
  };

  const messages = session?.messages || [];

  return (
    <div id="journal-chat-view" className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Session Title Header (if conversation exists) */}
      {session && (
        <div className="mb-4 pb-3 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-100">{session.title}</h2>
            <div className="flex items-center space-x-2 text-xs text-stone-400 mt-0.5">
              <span className="capitalize text-amber-400 font-medium">{session.promptMode}</span>
              <span>&bull;</span>
              <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
              <span>&bull;</span>
              <span>{messages.length} reflections</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div id="journal-messages-container" className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.length === 0 ? (
          /* Empty State */
          <div id="chat-empty-state" className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-semibold text-stone-200 mb-2">What is on your mind today?</h3>
            <p className="text-sm text-stone-400 max-w-md mb-8 leading-relaxed">
              Write whatever you are experiencing or feeling. Gemini will listen without judgment,
              offer thoughtful reflections, and help you find peace or clarity.
            </p>

            {/* Quick Inspiration Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full text-left">
              {[
                { title: 'Decompress Stress', text: 'I felt overwhelmed by expectations today and need to untangle my thoughts...' },
                { title: 'Celebrate Growth', text: 'Something clicked today that made me proud of my personal progress...' },
                { title: 'Decision Clarity', text: 'I am stuck between two choices and want to explore the underlying values...' },
                { title: 'Mindful Gratitude', text: 'A small moment brought me unexpected peace this afternoon...' },
              ].map((starter, idx) => (
                <button
                  key={idx}
                  id={`quick-starter-${idx}`}
                  onClick={() => {
                    setInputText(starter.text);
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 text-left transition-all cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-stone-300 group-hover:text-amber-400 transition-colors">
                    {starter.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{starter.text}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id || index}
                id={`message-bubble-${msg.id || index}`}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="text-xs font-medium text-stone-400">
                    {isUser ? 'You' : 'Gemini Reflection'}
                  </span>
                  <span className="text-[10px] text-stone-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-2xl px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-amber-500/15 border border-amber-500/30 text-stone-100 rounded-tr-sm'
                      : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Thinking Indicator */}
        {isGenerating && (
          <div id="gemini-generating-indicator" className="flex items-start space-x-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-stone-900 border border-stone-800 text-stone-300 text-sm flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Reflecting on your entry with care...</span>
            </div>
          </div>
        )}

        {/* Error Alert with Retry */}
        {generationError && (
          <div
            id="generation-error-banner"
            className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start justify-between"
          >
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Reflection Save Interrupted</p>
                <p className="text-xs text-red-300/90 mt-0.5">
                  {generationError}. Your entry has been kept safe in the editor below.
                </p>
              </div>
            </div>
            <button
              id="retry-generation-btn"
              onClick={handleRetry}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-red-100 border border-red-700/50 transition-colors cursor-pointer shrink-0 ml-3 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mode Selector & Input Container */}
      <div id="journal-input-section" className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        {/* Mode Selector Chips */}
        <div className="flex items-center space-x-2 pb-2.5 mb-2 border-b border-stone-800/80 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-stone-500 pl-1">Mode:</span>
          {MODES.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                id={`mode-select-${m.id}`}
                type="button"
                onClick={() => setSelectedMode(m.id)}
                title={m.description}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <textarea
            ref={textareaRef}
            id="journal-entry-input"
            value={inputText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? "Write your thoughts, feelings, or reflections here... (Cmd/Ctrl + Enter to send)"
                : "Reply to continue exploring this thought... (Cmd/Ctrl + Enter to send)"
            }
            rows={3}
            disabled={isGenerating}
            className="w-full bg-transparent text-stone-100 placeholder-stone-500 text-sm focus:outline-none resize-none px-2 py-1 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1 border-t border-stone-800/50 text-xs text-stone-500">
            <span className="text-[11px] hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 font-mono text-[10px] text-stone-300">⌘+Enter</kbd> to reflect
            </span>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-[11px] text-stone-400">
                {inputText.length > 0 && `${inputText.length} characters`}
              </span>

              <button
                id="submit-journal-btn"
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reflecting...</span>
                  </>
                ) : (
                  <>
                    <span>Reflect</span>
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
