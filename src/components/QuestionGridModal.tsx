import React, { useState } from 'react';
import { Question, UserStats } from '../data/types';
import { X, Check, Bookmark, AlertCircle } from 'lucide-react';

interface QuestionGridModalProps {
  questions: Question[];
  currentQuestionId: number;
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (questionId: number) => void;
}

export const QuestionGridModal: React.FC<QuestionGridModalProps> = ({
  questions,
  currentQuestionId,
  stats,
  isOpen,
  onClose,
  onSelectQuestion,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'bookmarks' | 'unseen' | 1 | 2 | 3 | 4>('all');

  if (!isOpen) return null;

  const filtered = questions.filter((q) => {
    const history = stats.history[q.id];
    const isBookmarked = stats.bookmarks.includes(q.id);

    if (filter === 'all') return true;
    if (filter === 'mistakes') return history && !history.isCorrect;
    if (filter === 'bookmarks') return isBookmarked;
    if (filter === 'unseen') return !history;
    if (typeof filter === 'number') return q.okruhId === filter;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Mapa všech 300 otázek</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rychlý skok na libovolnou otázku a přehled stavu vašich odpovědí
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5 bg-white dark:bg-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Všechny (300)
          </button>
          <button
            onClick={() => setFilter('mistakes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'mistakes' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
            }`}
          >
            Chybné ({questions.filter((q) => stats.history[q.id] && !stats.history[q.id].isCorrect).length})
          </button>
          <button
            onClick={() => setFilter('bookmarks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'bookmarks' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            Záložky ({stats.bookmarks.length})
          </button>
          <button
            onClick={() => setFilter('unseen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'unseen' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Neprobrané ({questions.filter((q) => !stats.history[q.id]).length})
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 my-auto mx-1" />
          <button
            onClick={() => setFilter(1)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            1. Okruh (1–110)
          </button>
          <button
            onClick={() => setFilter(2)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            2. Okruh (111–125)
          </button>
          <button
            onClick={() => setFilter(3)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            3. Okruh (126–275)
          </button>
          <button
            onClick={() => setFilter(4)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            4. Okruh (276–300)
          </button>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-4 items-center border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span>Správně</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            <span>Chyba</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 inline-block" />
            <span>Zatím nezodpovězeno</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline-block" />
            <span>Uloženo v záložkách</span>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              Žádné otázky neodpovídají zvolenému filtru.
            </div>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2">
              {filtered.map((q) => {
                const history = stats.history[q.id];
                const isBookmarked = stats.bookmarks.includes(q.id);
                const isCurrent = q.id === currentQuestionId;

                let bgClass = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600';
                if (history) {
                  if (history.isCorrect) {
                    bgClass = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60';
                  } else {
                    bgClass = 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/60';
                  }
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q.id);
                      onClose();
                    }}
                    className={`relative h-10 rounded-lg text-xs font-semibold tabular-nums flex items-center justify-center border transition-all cursor-pointer ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-slate-800 font-bold' : ''
                    }`}
                    title={`Otázka č. ${q.id}: ${q.question.slice(0, 80)}...`}
                  >
                    <span>{q.id}</span>
                    {isBookmarked && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
