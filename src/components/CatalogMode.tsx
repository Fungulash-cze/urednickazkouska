import React, { useState, useMemo } from 'react';
import { Question, UserStats } from '../data/types';
import {
  Search,
  BookOpen,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Scale,
  Copy,
  Check,
  PlayCircle
} from 'lucide-react';

interface CatalogModeProps {
  questions: Question[];
  stats: UserStats;
  onToggleBookmark: (questionId: number) => void;
  onJumpToPractice: (questionId: number) => void;
}

export const CatalogMode: React.FC<CatalogModeProps> = ({
  questions,
  stats,
  onToggleBookmark,
  onJumpToPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOkruh, setSelectedOkruh] = useState<number | 'all'>('all');
  const [selectedLaw, setSelectedLaw] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const availableLaws = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.law));
    return Array.from(set).sort();
  }, [questions]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return questions.filter((q) => {
      if (selectedOkruh !== 'all' && q.okruhId !== selectedOkruh) return false;
      if (selectedLaw !== 'all' && q.law !== selectedLaw) return false;

      if (!query) return true;

      const fullText = (
        q.id +
        ' ' +
        q.question +
        ' ' +
        q.options.a +
        ' ' +
        q.options.b +
        ' ' +
        q.options.c +
        ' ' +
        q.explanation +
        ' ' +
        q.law
      ).toLowerCase();

      return fullText.includes(query);
    });
  }, [questions, searchQuery, selectedOkruh, selectedLaw]);

  const handleCopy = (q: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Otázka č. ${q.id}: ${q.question}\nSprávná odpověď (${q.correct.toUpperCase()}): ${q.options[q.correct]}\n\nZdůvodnění (${q.law}):\n${q.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 space-y-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Katalog a vyhledávač všech 300 otázek
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Okamžité vyhledávání podle klíčových slov, paragrafů zákonů, nebo témat
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v otázkách, možnostech, nebo v paragrafech (např. zkušební doba, prezident, 50 000, odvolání)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full px-2 py-0.5 cursor-pointer"
            >
              Vymazat
            </button>
          )}
        </div>

        {/* Okruh & Law filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          {/* Okruhy */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedOkruh('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedOkruh === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Všech 300
            </button>
            {[1, 2, 3, 4].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedOkruh(id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedOkruh === id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {id}. okruh
              </button>
            ))}
          </div>

          {/* Law filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 text-xs">Zákon:</span>
            <select
              value={selectedLaw}
              onChange={(e) => setSelectedLaw(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 max-w-[200px] truncate"
            >
              <option value="all">Všechny právní předpisy</option>
              {availableLaws.map((law) => (
                <option key={law} value={law}>
                  {law}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Nalezeno <strong className="text-slate-900 dark:text-white tabular-nums">{filtered.length}</strong> z 300 otázek
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          const isBookmarked = stats.bookmarks.includes(q.id);
          const history = stats.history[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all ${
                isExpanded
                  ? 'border-indigo-300 dark:border-indigo-500 ring-1 ring-indigo-200 dark:ring-indigo-800 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Question summary row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 cursor-pointer flex items-start gap-4 select-none"
              >
                {/* ID badge */}
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums border border-slate-200 dark:border-slate-600 mt-0.5">
                  {q.id}
                </span>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{q.okruhTitle}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-slate-400" />
                      {q.law}
                    </span>
                    {history && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className={history.isCorrect ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                          {history.isCorrect ? 'Zvládnuto' : 'Chyba v historii'}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title={isBookmarked ? 'Odebrat ze záložek' : 'Uložit do záložek'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => onJumpToPractice(q.id)}
                    className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Procvičit tuto otázku"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-4 text-xs sm:text-sm bg-slate-50/40 dark:bg-slate-900/40 rounded-b-2xl">
                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {(['a', 'b', 'c'] as const).map((key) => {
                      const isCorrect = q.correct === key;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border flex items-start gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-medium'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold uppercase text-xs ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="flex-1 leading-relaxed">{q.options[key]}</span>
                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                              Správná odpověď
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legal Explanation */}
                  <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        Zdůvodnění a citace předpisu
                      </span>
                      <button
                        onClick={(e) => handleCopy(q, e)}
                        className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                      >
                        {copiedId === q.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === q.id ? 'Zkopírováno' : 'Kopírovat'}</span>
                      </button>
                    </div>
                    <p className="whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs">
                      {q.explanation}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onJumpToPractice(q.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Procvičit v kvízu</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
