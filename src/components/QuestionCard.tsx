import React, { useState, useEffect } from 'react';
import { Question, OptionKey, QuestionAnswerRecord } from '../data/types';
import { speakCzech, stopCzechSpeech, isSpeechSpeaking } from '../utils/speech';
import {
  Bookmark,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Scale
} from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  historyRecord?: QuestionAnswerRecord;
  isBookmarked: boolean;
  onAnswer: (option: OptionKey) => void;
  onToggleBookmark: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onResetQuestion: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  historyRecord,
  isBookmarked,
  onAnswer,
  onToggleBookmark,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onResetQuestion,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Stop speech when question changes
    stopCzechSpeech();
    setIsSpeaking(false);
    setCopied(false);
  }, [question.id]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopCzechSpeech();
      setIsSpeaking(false);
    } else {
      const textToRead = `${question.question}. Možnost A: ${question.options.a}. Možnost B: ${question.options.b}. Možnost C: ${question.options.c}.`;
      const started = speakCzech(textToRead, () => setIsSpeaking(false));
      setIsSpeaking(started);
    }
  };

  const handleCopyExplanation = () => {
    const text = `Otázka č. ${question.id}: ${question.question}\nSprávná odpověď: ${question.correct.toUpperCase()}) ${question.options[question.correct]}\n\nZdůvodnění (${question.law}):\n${question.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAnswered = Boolean(historyRecord);
  const selectedOption = historyRecord?.selected;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm p-6 sm:p-8 transition-colors">
      {/* Top Metadata Row (Zero-Pill discipline: unboxed text with · separators) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
            Otázka {question.id} z 300
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-700 dark:text-slate-300">{question.okruhTitle}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <Scale className="w-3 h-3 text-slate-400" />
            {question.law}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSpeaking
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isSpeaking ? 'Zastavit čtení' : 'Přečíst otázku nahlas'}
            aria-label="Přečíst otázku"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Zastavit' : 'Přečíst'}</span>
          </button>

          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isBookmarked ? 'Odebrat ze záložek' : 'Uložit do záložek'}
            aria-label="Záložka"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Uloženo' : 'Uložit'}</span>
          </button>
        </div>
      </div>

      {/* Question Headline */}
      <div className="my-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed text-balance">
          {question.question}
        </h2>
      </div>

      {/* Options a, b, c */}
      <div className="space-y-3" role="radiogroup" aria-label="Možnosti odpovědi">
        {(['a', 'b', 'c'] as OptionKey[]).map((key) => {
          const text = question.options[key];
          const isCorrect = question.correct === key;
          const isSelected = selectedOption === key;

          let cardStyle =
            'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100';
          let badgeStyle =
            'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';

          if (isAnswered) {
            if (isCorrect) {
              cardStyle =
                'border-emerald-500 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
            } else if (isSelected && !isCorrect) {
              cardStyle =
                'border-rose-400 dark:border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400';
              badgeStyle = 'bg-rose-600 text-white border-rose-600';
            } else {
              cardStyle =
                'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 opacity-70';
              badgeStyle =
                'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800';
            }
          }

          return (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer disabled:cursor-default ${cardStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase border transition-colors ${badgeStyle}`}
              >
                {key}
              </span>

              <div className="flex-1 pt-0.5 text-sm sm:text-base leading-relaxed">
                <span>{text}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0 mt-0.5">
                  {isCorrect && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Správná
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-md">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Vaše volba
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer feedback & Official Legal Explanation Box */}
      {isAnswered && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/60 animate-fadeIn">
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-700 rounded-xl p-5 text-sm">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Zdůvodnění a zákonná citace
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({question.law})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyExplanation}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                  title="Zkopírovat citaci do schránky"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Zkopírováno' : 'Kopírovat'}</span>
                </button>

                <button
                  onClick={onResetQuestion}
                  className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                  title="Zkusit tuto otázku znovu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Znovu</span>
                </button>
              </div>
            </div>

            <div className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line text-sm">
              {question.explanation}
            </div>

            {historyRecord && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-4 items-center">
                <span>
                  Celkem pokusů na této otázce: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{historyRecord.attemptsCount}</strong>
                </span>
                {historyRecord.mistakeCount > 0 && (
                  <span>
                    Chyb: <strong className="text-rose-600 dark:text-rose-400 tabular-nums">{historyRecord.mistakeCount}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation controls */}
      <div className="mt-8 pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700/60">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Předchozí otázka</span>
        </button>

        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden sm:inline tabular-nums">
          Klávesy: A, B, C / 1, 2, 3 pro volbu
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <span>Další otázka</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
