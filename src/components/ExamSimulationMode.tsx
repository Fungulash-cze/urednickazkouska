import React, { useState, useEffect } from 'react';
import { Question, OptionKey, ExamResult, UserStats } from '../data/types';
import { generateExamQuestions } from '../data/storage';
import {
  GraduationCap,
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Award,
  ChevronRight,
  FileCheck
} from 'lucide-react';

interface ExamSimulationModeProps {
  stats: UserStats;
  onSaveExamResult: (result: ExamResult) => void;
  onBookmarkQuestions: (questionIds: number[]) => void;
}

export const ExamSimulationMode: React.FC<ExamSimulationModeProps> = ({
  stats,
  onSaveExamResult,
  onBookmarkQuestions,
}) => {
  // Test states: 'intro' | 'active' | 'review'
  const [testState, setTestState] = useState<'intro' | 'active' | 'review'>('intro');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, OptionKey>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes in seconds
  const [isTimed, setIsTimed] = useState<boolean>(true);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mistakes'>('all');

  // Timer countdown
  useEffect(() => {
    if (testState !== 'active' || !isTimed) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, isTimed]);

  const handleStartExam = () => {
    const questions = generateExamQuestions();
    setExamQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlagged([]);
    setTimeRemaining(30 * 60);
    setTestState('active');
    setShowSubmitConfirm(false);
  };

  const handleSelectOption = (option: OptionKey) => {
    const currentQ = examQuestions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: option,
    }));
  };

  const handleToggleFlag = () => {
    const currentQ = examQuestions[currentIndex];
    if (!currentQ) return;
    setFlagged((prev) =>
      prev.includes(currentQ.id) ? prev.filter((id) => id !== currentQ.id) : [...prev, currentQ.id]
    );
  };

  const handleSubmitExam = () => {
    const timeSpent = 30 * 60 - timeRemaining;
    let score = 0;

    const answersDetail = examQuestions.map((q) => {
      const selected = userAnswers[q.id] || null;
      const isCorrect = selected === q.correct;
      if (isCorrect) score += 1;

      return {
        questionId: q.id,
        selected,
        correct: q.correct,
        isCorrect,
      };
    });

    const passed = score >= 23; // Official threshold: 23/30 (75%)
    const percentage = Math.round((score / 30) * 100);

    // Calculate okruh breakdown
    const breakdownMap: Record<number, { score: number; total: number; title: string }> = {
      1: { score: 0, total: 0, title: '1. okruh: Organizace veřejné správy' },
      2: { score: 0, total: 0, title: '2. okruh: Státní služba a etika' },
      3: { score: 0, total: 0, title: '3. okruh: Správní řád a předpisy' },
      4: { score: 0, total: 0, title: '4. okruh: Právo Evropské unie' },
    };

    examQuestions.forEach((q) => {
      const isCorrect = userAnswers[q.id] === q.correct;
      breakdownMap[q.okruhId].total += 1;
      if (isCorrect) {
        breakdownMap[q.okruhId].score += 1;
      }
    });

    const breakdown = Object.entries(breakdownMap).map(([id, data]) => ({
      okruhId: Number(id),
      okruhTitle: data.title,
      score: data.score,
      total: data.total,
    }));

    const result: ExamResult = {
      id: `exam_${Date.now()}`,
      date: new Date().toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      score,
      total: 30,
      percentage,
      passed,
      timeSpentSeconds: timeSpent,
      breakdown,
      answers: answersDetail,
    };

    onSaveExamResult(result);
    setLastResult(result);
    setTestState('review');
    setShowSubmitConfirm(false);
  };

  const handleBookmarkAllMistakes = () => {
    if (!lastResult) return;
    const mistakeIds = lastResult.answers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId);
    onBookmarkQuestions(mistakeIds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // STATE 1: INTRO SCREEN
  // -------------------------------------------------------------
  if (testState === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-10 space-y-6 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Simulace ostré úřednické zkoušky
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Oficiální pravidla a formát obecné části dle Ministerstva vnitra ČR
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Počet otázek
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1 block">
                30 otázek
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Náhodný výběr ze všech 300
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Časový limit
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1 block">
                30 minut
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Standardní časový limit
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Kritérium úspěchu
              </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1 block">
                min. 23 bodů
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                Úspěšnost alespoň 75 %
              </span>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-indigo-950 dark:text-indigo-100">
              <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Zastoupení okruhů v testu:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 ml-1">
              <li><strong>1. okruh (Organizace a činnost veřejné správy):</strong> 11 otázek</li>
              <li><strong>2. okruh (Práva, povinnosti a etika státního zaměstnance):</strong> 3 otázky</li>
              <li><strong>3. okruh (Právní předpisy dopadající na činnost správy):</strong> 13 otázek</li>
              <li><strong>4. okruh (Právo Evropské unie):</strong> 3 otázky</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isTimed}
                onChange={(e) => setIsTimed(e.target.checked)}
                className="w-4 h-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Zapnout časový limit (30 minut)</span>
            </label>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStartExam}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Zahájit test</span>
            </button>

            {stats.examResults.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Již jste absolvovali {stats.examResults.length} simulací (úspěšnost{' '}
                {Math.round(
                  (stats.examResults.filter((r) => r.passed).length / stats.examResults.length) * 100
                )}
                %)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: ACTIVE EXAM SCREEN
  // -------------------------------------------------------------
  if (testState === 'active') {
    const currentQ = examQuestions[currentIndex];
    const isFlagged = flagged.includes(currentQ.id);
    const selected = userAnswers[currentQ.id];
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Otázka <strong className="text-slate-900 dark:text-white text-sm">{currentIndex + 1}</strong> z 30
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
              Zodpovězeno: <strong className="text-indigo-600 dark:text-indigo-400">{answeredCount}</strong> / 30
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isTimed && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold tabular-nums ${
                  timeRemaining < 300
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Označit otázku pro pozdější revizi před odevzdáním"
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">K revizi</span>
            </button>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Odevzdat test
            </button>
          </div>
        </div>

        {/* Question Navigator strip (1 to 30) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 transition-colors">
          <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
            {examQuestions.map((q, idx) => {
              const hasAnswer = Boolean(userAnswers[q.id]);
              const isFlag = flagged.includes(q.id);
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600';
              if (hasAnswer) {
                btnStyle = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold';
              }
              if (isFlag) {
                btnStyle = 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-9 rounded-lg text-xs font-medium border transition-all flex items-center justify-center tabular-nums cursor-pointer ${btnStyle} ${
                    isCurrent ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-slate-800 font-bold' : ''
                  }`}
                  title={`Otázka ${idx + 1}`}
                >
                  <span>{idx + 1}</span>
                  {isFlag && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Question Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 sm:p-8 space-y-6 transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Otázka č. {currentIndex + 1}</span>
              <span>·</span>
              <span className="text-slate-700 dark:text-slate-300">{currentQ.okruhTitle}</span>
              <span>·</span>
              <span className="text-slate-600 dark:text-slate-400">{currentQ.law}</span>
            </div>
            {isFlagged && (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                <Flag className="w-3 h-3 fill-amber-500" />
                Označeno k revizi
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h2>

          <div className="space-y-3" role="radiogroup">
            {(['a', 'b', 'c'] as OptionKey[]).map((key) => {
              const text = currentQ.options[key];
              const isSelected = selected === key;

              return (
                <button
                  key={key}
                  onClick={() => handleSelectOption(key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 uppercase border transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {key}
                  </span>
                  <div className="flex-1 pt-0.5 text-sm sm:text-base leading-relaxed">
                    <span>{text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Předchozí</span>
            </button>

            {currentIndex < 29 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, 29))}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <span>Další otázka</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Zkontrolovat a odevzdat
              </button>
            )}
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Opravdu chcete test odevzdat?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Zodpovězeno:{' '}
                <strong className="text-slate-900 dark:text-white tabular-nums">{answeredCount}</strong> z 30 otázek.
                {answeredCount < 30 && (
                  <span className="block mt-1 text-rose-600 dark:text-rose-400 font-semibold">
                    Upozornění: Máte ještě {30 - answeredCount} nezodpovězených otázek! Nezodpovězené otázky se počítají jako chybné.
                  </span>
                )}
                {flagged.length > 0 && (
                  <span className="block mt-1 text-amber-700 dark:text-amber-400">
                    Máte {flagged.length} otázek označených k revizi.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Vrátit se k testu
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Odevzdat a vyhodnotit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: EXAM RESULTS & QUESTION-BY-QUESTION REVIEW
  // -------------------------------------------------------------
  if (testState === 'review' && lastResult) {
    const passed = lastResult.passed;
    const mistakesCount = 30 - lastResult.score;

    const displayedAnswers = lastResult.answers.filter((a) => {
      if (reviewFilter === 'mistakes') return !a.isCorrect;
      return true;
    });

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Certificate / Results Header Card */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 transition-colors ${
            passed
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider block ${
                    passed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  Výsledek simulace úřednické zkoušky
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {passed ? 'ZKOUŠKU JSTE ÚSPĚŠNĚ SPLNIL/A!' : 'ZKOUŠKU JSTE BOHUŽEL NESPLNIL/A'}
                </h1>
                <p className="text-xs sm:text-sm mt-1 text-slate-600 dark:text-slate-300">
                  {passed
                    ? 'Gratulujeme! Dosáhli jste požadované hranice alespoň 23 správných odpovědí.'
                    : 'Pro úspěšné složení je vyžadováno minimálně 23 bodů ze 30 (75 %). Projděte si níže své chyby.'}
                </p>
              </div>
            </div>

            {/* Score pill */}
            <div className="text-right sm:shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {lastResult.score} / 30
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                {lastResult.percentage} % · {formatTime(lastResult.timeSpentSeconds)}
              </div>
            </div>
          </div>

          {/* Okruh breakdown strip */}
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {lastResult.breakdown.map((b) => (
              <div key={b.okruhId} className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                  {b.okruhTitle}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {b.score} / {b.total}
                </span>
                <span className="text-[10px] text-slate-400">
                  {Math.round((b.score / b.total) * 100)} %
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartExam}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Spustit novou simulaci testu</span>
            </button>

            {mistakesCount > 0 && (
              <button
                onClick={handleBookmarkAllMistakes}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Uložit všech {mistakesCount} chyb do záložek</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Question Review Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Podrobný rozbor všech 30 otázek
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zkontrolujte správné odpovědi, odůvodnění a přesné paragrafy
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Všech 30
            </button>
            <button
              onClick={() => setReviewFilter('mistakes')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                reviewFilter === 'mistakes'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pouze chyby ({mistakesCount})
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-4">
          {displayedAnswers.map((item, idx) => {
            const q = examQuestions.find((eq) => eq.id === item.questionId);
            if (!q) return null;

            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-5 sm:p-6 space-y-4 transition-colors ${
                  item.isCorrect
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">Otázka {idx + 1} (č. {q.id})</span>
                    <span>·</span>
                    <span>{q.okruhTitle}</span>
                    <span>·</span>
                    <span>{q.law}</span>
                  </div>

                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Správně (+1 bod)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Chyba (0 bodů)
                    </span>
                  )}
                </div>

                {/* Question */}
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {q.question}
                </h4>

                {/* Options display */}
                <div className="space-y-2">
                  {(['a', 'b', 'c'] as OptionKey[]).map((key) => {
                    const optText = q.options[key];
                    const isKeyCorrect = q.correct === key;
                    const isKeySelected = item.selected === key;

                    let optBg = 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                    if (isKeyCorrect) {
                      optBg = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-medium';
                    } else if (isKeySelected && !isKeyCorrect) {
                      optBg = 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100 font-medium';
                    }

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${optBg}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold uppercase ${
                            isKeyCorrect
                              ? 'bg-emerald-600 text-white'
                              : isKeySelected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="flex-1 leading-relaxed">{optText}</span>
                        {isKeyCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                            Správná
                          </span>
                        )}
                        {isKeySelected && !isKeyCorrect && (
                          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase shrink-0">
                            Vaše volba
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legal Explanation */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider">
                    Zdůvodnění a citace zákona ({q.law}):
                  </span>
                  <p className="whitespace-pre-line leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
