import React, { useState, useEffect, useMemo } from 'react';
import { Question, OptionKey, UserStats } from '../data/types';
import { QuestionCard } from './QuestionCard';
import { QuestionGridModal } from './QuestionGridModal';
import {
  Filter,
  Grid,
  Shuffle,
  Bookmark,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Search,
  Scale
} from 'lucide-react';

interface PracticeModeProps {
  questions: Question[];
  stats: UserStats;
  onAnswerQuestion: (questionId: number, selected: OptionKey, isCorrect: boolean) => void;
  onToggleBookmark: (questionId: number) => void;
  onResetQuestion: (questionId: number) => void;
  initialQuestionId?: number;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  questions,
  stats,
  onAnswerQuestion,
  onToggleBookmark,
  onResetQuestion,
  initialQuestionId,
}) => {
  const [selectedOkruh, setSelectedOkruh] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unseen' | 'mistakes' | 'mastered' | 'bookmarks'>('all');
  const [selectedLaw, setSelectedLaw] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Extract unique laws for dropdown filter
  const availableLaws = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.law));
    return Array.from(set).sort();
  }, [questions]);

  // Filter questions based on selected criteria
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Okruh filter
      if (selectedOkruh !== 'all' && q.okruhId !== selectedOkruh) return false;

      // Law filter
      if (selectedLaw !== 'all' && q.law !== selectedLaw) return false;

      // Status filter
      const history = stats.history[q.id];
      const isBookmarked = stats.bookmarks.includes(q.id);

      if (statusFilter === 'unseen') return !history;
      if (statusFilter === 'mistakes') return history && !history.isCorrect;
      if (statusFilter === 'mastered') return history && history.isCorrect;
      if (statusFilter === 'bookmarks') return isBookmarked;

      return true;
    });
  }, [questions, selectedOkruh, selectedLaw, statusFilter, stats]);

  // Keep index within bounds
  useEffect(() => {
    if (initialQuestionId) {
      const idx = filteredQuestions.findIndex((q) => q.id === initialQuestionId);
      if (idx !== -1) {
        setCurrentIndex(idx);
        return;
      }
    }
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions, initialQuestionId]);

  const currentQuestion = filteredQuestions[currentIndex] || questions[0];

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!currentQuestion) return;

      const history = stats.history[currentQuestion.id];
      const isAnswered = Boolean(history);

      if (!isAnswered) {
        if (e.key === 'a' || e.key === 'A' || e.key === '1') {
          e.preventDefault();
          handleAnswer('a');
        } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
          e.preventDefault();
          handleAnswer('b');
        } else if (e.key === 'c' || e.key === 'C' || e.key === '3') {
          e.preventDefault();
          handleAnswer('c');
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentIndex < filteredQuestions.length - 1) {
          e.preventDefault();
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          e.preventDefault();
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, currentIndex, filteredQuestions.length, stats]);

  const handleAnswer = (option: OptionKey) => {
    if (!currentQuestion) return;
    const isCorrect = currentQuestion.correct === option;
    onAnswerQuestion(currentQuestion.id, option, isCorrect);
  };

  const handleShuffle = () => {
    if (filteredQuestions.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredQuestions.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (isNaN(num) || num < 1 || num > 300) return;

    // Reset filters to 'all' so the question is guaranteed to be in the set
    setSelectedOkruh('all');
    setSelectedLaw('all');
    setStatusFilter('all');

    const targetIdx = questions.findIndex((q) => q.id === num);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setJumpInput('');
    }
  };

  // Stats calculation
  const totalInFilter = filteredQuestions.length;
  const answeredInFilter = filteredQuestions.filter((q) => stats.history[q.id]).length;
  const correctInFilter = filteredQuestions.filter((q) => stats.history[q.id]?.isCorrect).length;
  const mistakesInFilter = filteredQuestions.filter((q) => stats.history[q.id] && !stats.history[q.id].isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Control & Filter Deck */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 sm:p-5 space-y-4 transition-colors">
        {/* Okruh Tabs (Segmented control) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Výběr tematického okruhu
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setSelectedOkruh('all');
                setCurrentIndex(0);
              }}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer ${
                selectedOkruh === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Všech 300
            </button>
            <button
              onClick={() => {
                setSelectedOkruh(1);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-2 rounded-lg transition-all text-center cursor-pointer ${
                selectedOkruh === 1
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Organizace a činnost veřejné správy (1–110)"
            >
              1. Veřejná správa
            </button>
            <button
              onClick={() => {
                setSelectedOkruh(2);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-2 rounded-lg transition-all text-center cursor-pointer ${
                selectedOkruh === 2
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Práva, povinnosti a etika státního zaměstnance (111–125)"
            >
              2. Státní služba
            </button>
            <button
              onClick={() => {
                setSelectedOkruh(3);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-2 rounded-lg transition-all text-center cursor-pointer ${
                selectedOkruh === 3
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Právní předpisy obecně (126–275)"
            >
              3. Správní právo
            </button>
            <button
              onClick={() => {
                setSelectedOkruh(4);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-2 rounded-lg transition-all text-center cursor-pointer ${
                selectedOkruh === 4
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Právo Evropské unie (276–300)"
            >
              4. Právo EU
            </button>
          </div>
        </div>

        {/* Secondary filters: Status, Law filter, Jump & Map */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          {/* Status Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Vše ({totalInFilter})
            </button>
            <button
              onClick={() => {
                setStatusFilter('mistakes');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                statusFilter === 'mistakes'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              }`}
              title="Pouze otázky, ve kterých jste chybovali"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Chybné ({mistakesInFilter})</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter('bookmarks');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                statusFilter === 'bookmarks'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Záložky ({stats.bookmarks.length})</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter('unseen');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'unseen'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Neprobrané
            </button>
          </div>

          {/* Quick controls: Law selector, Jump, Map modal */}
          <div className="flex items-center gap-2">
            {/* Law select */}
            <div className="relative">
              <select
                value={selectedLaw}
                onChange={(e) => {
                  setSelectedLaw(e.target.value);
                  setCurrentIndex(0);
                }}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 pr-7 max-w-[150px] truncate"
                aria-label="Filtrovat podle konkrétního zákona"
              >
                <option value="all">Všechny zákony</option>
                {availableLaws.map((law) => (
                  <option key={law} value={law}>
                    {law}
                  </option>
                ))}
              </select>
            </div>

            {/* Jump by number */}
            <form onSubmit={handleJump} className="flex items-center">
              <input
                type="number"
                min={1}
                max={300}
                placeholder="číslo..."
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-16 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-l-lg bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 tabular-nums"
                title="Přejít na číslo otázky (1–300)"
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-r-lg font-medium cursor-pointer"
              >
                Jdi
              </button>
            </form>

            {/* Shuffle button */}
            <button
              onClick={handleShuffle}
              className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Náhodná otázka ze zvoleného filtru"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Grid Map button */}
            <button
              onClick={() => setIsGridOpen(true)}
              className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Otevřít mapu všech 300 otázek"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Mapa (300)</span>
            </button>
          </div>
        </div>

        {/* Progress indicator bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>
              Otázka {filteredQuestions.length > 0 ? currentIndex + 1 : 0} z {filteredQuestions.length} ve filtru
            </span>
            <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {answeredInFilter} zodpovězeno ({totalInFilter > 0 ? Math.round((answeredInFilter / totalInFilter) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${totalInFilter > 0 ? (correctInFilter / totalInFilter) * 100 : 0}%`,
              }}
              title={`Správně: ${correctInFilter}`}
            />
            <div
              className="h-full bg-rose-400 transition-all duration-300"
              style={{
                width: `${totalInFilter > 0 ? (mistakesInFilter / totalInFilter) * 100 : 0}%`,
              }}
              title={`Chyby: ${mistakesInFilter}`}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card or Empty State */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center transition-colors">
          <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Žádné otázky v tomto filtru</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {statusFilter === 'mistakes'
              ? 'Skvělé! V této kategorii nemáte zaznamenanou žádnou chybu.'
              : statusFilter === 'bookmarks'
              ? 'Zatím nemáte v této kategorii žádné uložené záložky.'
              : 'Zkuste upravit nebo zrušit nastavené filtry.'}
          </p>
          <button
            onClick={() => {
              setSelectedOkruh('all');
              setSelectedLaw('all');
              setStatusFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Zobrazit všechny otázky
          </button>
        </div>
      ) : (
        <QuestionCard
          question={currentQuestion}
          historyRecord={stats.history[currentQuestion.id]}
          isBookmarked={stats.bookmarks.includes(currentQuestion.id)}
          onAnswer={handleAnswer}
          onToggleBookmark={() => onToggleBookmark(currentQuestion.id)}
          onNext={() => setCurrentIndex((prev) => Math.min(prev + 1, filteredQuestions.length - 1))}
          onPrev={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          hasNext={currentIndex < filteredQuestions.length - 1}
          hasPrev={currentIndex > 0}
          onResetQuestion={() => onResetQuestion(currentQuestion.id)}
        />
      )}

      {/* Question Grid Modal */}
      <QuestionGridModal
        isOpen={isGridOpen}
        onClose={() => setIsGridOpen(false)}
        questions={questions}
        currentQuestionId={currentQuestion?.id || 1}
        stats={stats}
        onSelectQuestion={(id) => {
          setSelectedOkruh('all');
          setSelectedLaw('all');
          setStatusFilter('all');
          const targetIdx = questions.findIndex((q) => q.id === id);
          if (targetIdx !== -1) {
            setCurrentIndex(targetIdx);
          }
        }}
      />
    </div>
  );
};
