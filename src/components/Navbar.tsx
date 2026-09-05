import React from 'react';
import { User } from 'firebase/auth';
import { BookOpen, PlusCircle, History, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User;
  currentView: 'dashboard' | 'history';
  onViewChange: (view: 'dashboard' | 'history') => void;
  onNewReflection: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onViewChange,
  onNewReflection,
  onLogout,
}) => {
  return (
    <header id="app-navbar" className="border-b border-stone-800 bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <div
            id="nav-brand-btn"
            onClick={() => onViewChange('dashboard')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-stone-100 block">Solitude AI</span>
              <span className="text-xs text-stone-400 block -mt-1">Private Journal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-2">
            <button
              id="nav-dashboard-tab"
              onClick={() => onViewChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              Dashboard
            </button>

            <button
              id="nav-history-tab"
              onClick={() => onViewChange('history')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                currentView === 'history'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            id="nav-new-reflection-btn"
            onClick={onNewReflection}
            className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-medium transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reflection</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-3 pl-2 border-l border-stone-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Avatar'}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-stone-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-semibold text-xs">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <span className="hidden lg:inline text-xs font-medium text-stone-300 max-w-[120px] truncate">
              {user.displayName || user.email}
            </span>

            <button
              id="nav-logout-btn"
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
