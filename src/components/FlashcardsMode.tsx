import React, { useState, useEffect, useMemo } from 'react';
import { Question, UserStats } from '../data/types';
import {
  Layers,
  RotateCw,
  Check,
  X,
  Bookmark,
  Shuffle,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { speakCzech, stopCzechSpeech } from '../utils/speech';

interface FlashcardsModeProps {
  questions: Question[];
  stats: UserStats;
  onToggleKnown: (questionId: number, known: boolean) => void;
  onToggleBookmark: (questionId: number) => void;
}

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  questions,
  stats,
  onToggleKnown,
  onToggleBookmark,
}) => {
  const [selectedOkruh, setSelectedOkruh] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'mistakes' | 'bookmarks' | 'learning'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedOkruh !== 'all' && q.okruhId !== selectedOkruh) return false;

      const isKnown = stats.flashcardKnown.includes(q.id);
      const isBookmarked = stats.bookmarks.includes(q.id);
      const isMistake = stats.history[q.id] && !stats.history[q.id].isCorrect;

      if (filterType === 'mistakes') return isMistake;
      if (filterType === 'bookmarks') return isBookmarked;
      if (filterType === 'learning') return !isKnown;

      return true;
    });
  }, [questions, selectedOkruh, filterType, stats]);

  useEffect(() => {
    setIsFlipped(false);
    stopCzechSpeech();
    setIsSpeaking(false);
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions, currentIndex]);

  const currentQ = filteredQuestions[currentIndex] || questions[0];
  const isKnown = stats.flashcardKnown.includes(currentQ?.id);
  const isBookmarked = stats.bookmarks.includes(currentQ?.id);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' || e.key === 'y' || e.key === 'Y') {
        if (currentQ) onToggleKnown(currentQ.id, true);
        handleNext();
      } else if (e.key === '2' || e.key === 'n' || e.key === 'N') {
        if (currentQ) onToggleKnown(currentQ.id, false);
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentIndex, filteredQuestions.length]);

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    if (filteredQuestions.length <= 1) return;
    const randomIdx = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentIndex(randomIdx);
    setIsFlipped(false);
  };

  const handleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopCzechSpeech();
      setIsSpeaking(false);
    } else {
      const text = isFlipped
        ? `Správná odpověď je ${currentQ.correct}: ${currentQ.options[currentQ.correct]}. Zdůvodnění: ${currentQ.explanation}`
        : `${currentQ.question}. Možnost A: ${currentQ.options.a}. Možnost B: ${currentQ.options.b}. Možnost C: ${currentQ.options.c}.`;
      speakCzech(text, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 space-y-3 transition-colors">
        {/* Okruh Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => {
              setSelectedOkruh('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedOkruh === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Všechny okruhy
          </button>
          {[1, 2, 3, 4].map((okruhId) => (
            <button
              key={okruhId}
              onClick={() => {
                setSelectedOkruh(okruhId);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedOkruh === okruhId
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {okruhId}. okruh
            </button>
          ))}
        </div>

        {/* Filter type */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Vše ({filteredQuestions.length})
            </button>
            <button
              onClick={() => {
                setFilterType('learning');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'learning'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
              }`}
            >
              K procvičení ({questions.filter((q) => !stats.flashcardKnown.includes(q.id)).length})
            </button>
            <button
              onClick={() => {
                setFilterType('mistakes');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'mistakes'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60'
              }`}
            >
              Chyby
            </button>
            <button
              onClick={() => {
                setFilterType('bookmarks');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterType === 'bookmarks'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              Záložky
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Náhodná kartička"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Zamíchat</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          Žádné kartičky v tomto výběru. Vše máte zvládnuto nebo zkuste jiný filtr!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress label */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Kartička <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{currentIndex + 1}</strong> z {filteredQuestions.length}
            </span>
            <span className="font-mono text-[11px]">
              Kliknutím nebo [Mezerníkem] otočíte
            </span>
          </div>

          {/* Flip Container */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className="cursor-pointer min-h-[360px] bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200/90 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm p-6 sm:p-8 flex flex-col justify-between transition-all select-none relative group"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Otázka č. {currentQ.id}</span>
                <span>·</span>
                <span className="text-slate-700 dark:text-slate-300">{currentQ.okruhTitle}</span>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleSpeech}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Přečíst nahlas"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onToggleBookmark(currentQ.id)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  title="Uložit do záložek"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Front vs Back Content */}
            {!isFlipped ? (
              /* FRONT: Question & Choices preview */
              <div className="py-6 space-y-6 flex-1 flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed text-balance">
                  {currentQ.question}
                </h3>

                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                    <span className="font-bold text-slate-400 dark:text-slate-500 shrink-0">A)</span>
                    <span>{currentQ.options.a}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                    <span className="font-bold text-slate-400 dark:text-slate-500 shrink-0">B)</span>
                    <span>{currentQ.options.b}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                    <span className="font-bold text-slate-400 dark:text-slate-500 shrink-0">C)</span>
                    <span>{currentQ.options.c}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1 group-hover:underline">
                    <RotateCw className="w-3.5 h-3.5" />
                    Klikněte pro zobrazení správné odpovědi a zdůvodnění
                  </span>
                </div>
              </div>
            ) : (
              /* BACK: Answer & Legal Reasoning */
              <div className="py-6 space-y-5 flex-1 flex flex-col justify-center animate-fadeIn">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                    Správná odpověď ({currentQ.correct.toUpperCase()}):
                  </span>
                  <div className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-100">
                    {currentQ.options[currentQ.correct]}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 max-h-56 overflow-y-auto">
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center justify-between">
                    <span>Zdůvodnění a citace zákona:</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{currentQ.law}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div
              className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onToggleKnown(currentQ.id, false);
                    handleNext();
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Musím zopakovat</span>
                </button>

                <button
                  onClick={() => {
                    onToggleKnown(currentQ.id, true);
                    handleNext();
                  }}
                  className="px-4 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Znám</span>
                </button>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
