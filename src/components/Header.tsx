import React from 'react';
import { AppView } from '../data/types';
import {
  BookOpen,
  GraduationCap,
  Layers,
  Search,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  bookmarkedCount: number;
  totalAnswered: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  bookmarkedCount,
  totalAnswered,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Single brand mark */}
          <button
            onClick={() => onSelectView('practice')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-hidden cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight block leading-tight">
                Úřednická Zkouška
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
                Obecná část · 300 otázek
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (single line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectView('practice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'practice'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Procvičování</span>
            </button>

            <button
              onClick={() => onSelectView('exam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'exam'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ostrá zkouška</span>
            </button>

            <button
              onClick={() => onSelectView('answers_list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'answers_list'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
              title="Všech 300 otázek s vyznačenými správnými odpověďmi"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Správné odpovědi</span>
            </button>

            <button
              onClick={() => onSelectView('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'flashcards'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kartičky</span>
            </button>

            <button
              onClick={() => onSelectView('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'catalog'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Katalog</span>
            </button>

            <button
              onClick={() => onSelectView('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                currentView === 'stats'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistiky</span>
            </button>
          </nav>

          {/* Zone 3: Actions + Dark mode toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dark mode switch */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
              aria-label="Přepnout tmavý režim"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {bookmarkedCount > 0 && (
              <button
                onClick={() => onSelectView('practice')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-2.5 py-1.5 rounded-md font-medium border border-amber-200/60 dark:border-amber-800/60 transition-colors cursor-pointer"
                title={`${bookmarkedCount} uložených otázek`}
              >
                <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="tabular-nums">{bookmarkedCount}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Nav Strip */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 gap-1.5 text-xs no-scrollbar">
        <button
          onClick={() => onSelectView('practice')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'practice' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Procvičování
        </button>
        <button
          onClick={() => onSelectView('exam')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'exam' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Ostrá zkouška
        </button>
        <button
          onClick={() => onSelectView('answers_list')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'answers_list' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Správné odpovědi
        </button>
        <button
          onClick={() => onSelectView('flashcards')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'flashcards' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Kartičky
        </button>
        <button
          onClick={() => onSelectView('catalog')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'catalog' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Katalog
        </button>
        <button
          onClick={() => onSelectView('stats')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${currentView === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Statistika
        </button>
      </div>
    </header>
  );
};
