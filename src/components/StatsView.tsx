import React, { useState } from 'react';
import { Question, UserStats } from '../data/types';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Bookmark,
  Award,
  Clock,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

interface StatsViewProps {
  questions: Question[];
  stats: UserStats;
  onClearStats: () => void;
  onImportStats: (imported: UserStats) => void;
  onStartMistakesPractice: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  questions,
  stats,
  onClearStats,
  onImportStats,
  onStartMistakesPractice,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Stats calculation
  const totalQuestions = 300;
  const answeredIds = Object.keys(stats.history).map(Number);
  const totalAnswered = answeredIds.length;
  const correctCount = answeredIds.filter((id) => stats.history[id]?.isCorrect).length;
  const mistakeCount = answeredIds.filter((id) => stats.history[id] && !stats.history[id].isCorrect).length;
  const successRate = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Breakdown by Okruh
  const okruhyStats = [1, 2, 3, 4].map((okruhId) => {
    const okruhQuestions = questions.filter((q) => q.okruhId === okruhId);
    const total = okruhQuestions.length;
    const answered = okruhQuestions.filter((q) => stats.history[q.id]).length;
    const correct = okruhQuestions.filter((q) => stats.history[q.id]?.isCorrect).length;
    const title = okruhQuestions[0]?.okruhTitle || `${okruhId}. okruh`;

    return {
      id: okruhId,
      title,
      total,
      answered,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  // Exam stats
  const totalExams = stats.examResults.length;
  const passedExams = stats.examResults.filter((r) => r.passed).length;
  const examPassRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const avgExamScore =
    totalExams > 0
      ? (stats.examResults.reduce((acc, r) => acc + r.score, 0) / totalExams).toFixed(1)
      : '0.0';

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stats, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `urednicka_zkouska_zaloha_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.history && Array.isArray(parsed.bookmarks)) {
          onImportStats(parsed);
          alert('Pokrok byl úspěšně nahrán ze zálohy!');
        } else {
          alert('Soubor nemá platný formát zálohy.');
        }
      } catch (err) {
        alert('Chyba při čtení souboru: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Overview Top Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-6 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Přehled vaší přípravy na zkoušku
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sledování pokroku v procvičování a úspěšnosti v simulacích zkoušky
          </p>
        </div>

        {/* 4 KPI metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
              Procvičeno otázek
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1 block">
              {totalAnswered} / {totalQuestions}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {Math.round((totalAnswered / totalQuestions) * 100)} % katalogu
            </span>
          </div>

          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">
              Zvládnuté bez chyby
            </span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1 block">
              {correctCount}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 tabular-nums">
              {successRate} % úspěšnost
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 block uppercase tracking-wider">
              Otázky s chybou
            </span>
            <span className="text-2xl font-bold text-rose-700 dark:text-rose-400 tabular-nums mt-1 block">
              {mistakeCount}
            </span>
            <span className="text-xs text-rose-700 dark:text-rose-400">
              k dopilování
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
              Uložené záložky
            </span>
            <span className="text-2xl font-bold text-amber-800 dark:text-amber-300 tabular-nums mt-1 block">
              {stats.bookmarks.length}
            </span>
            <span className="text-xs text-amber-700 dark:text-amber-400">
              oblíbené položky
            </span>
          </div>
        </div>

        {/* Action to drill mistakes */}
        {mistakeCount > 0 && (
          <div className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Máte {mistakeCount} otázek, kde jste udělali chybu
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Opakování chyb je nejrychlejší způsob, jak se připravit na zkoušku bez mezer.
              </p>
            </div>
            <button
              onClick={onStartMistakesPractice}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Procvičit pouze chyby</span>
            </button>
          </div>
        )}
      </div>

      {/* Mastery by Okruh */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-4 transition-colors">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Úroveň zvládnutí podle tematických okruhů
        </h2>

        <div className="space-y-4">
          {okruhyStats.map((okruh) => (
            <div key={okruh.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{okruh.title}</span>
                <span className="tabular-nums text-slate-600 dark:text-slate-400 font-medium">
                  {okruh.correct} / {okruh.total} ({okruh.percentage} %)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${okruh.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Simulation History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historie simulací ostré zkoušky
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Celkem {totalExams} pokusů · Úspěšnost {examPassRate} % · Průměrné skóre {avgExamScore} / 30
            </p>
          </div>
        </div>

        {totalExams === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            Zatím jste nespustili žádnou simulaci ostré zkoušky. Vyzkoušejte si 30 náhodných otázek s časovačem!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {stats.examResults.slice(0, 10).map((r, idx) => (
              <div
                key={r.id || idx}
                className="p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-700/60 text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      r.passed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {r.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {r.passed ? 'Úspěšně složeno' : 'Nesplněno'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{r.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 tabular-nums">
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {r.score} / 30
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{r.percentage} %</span>
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    {Math.floor(r.timeSpentSeconds / 60)}m {r.timeSpentSeconds % 60}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup and Data Management */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Správa dat a zálohování</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Veškerý váš pokrok se ukládá v prohlížeči. Zde můžete exportovat zálohu nebo ji přenést do jiného zařízení.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Stáhnout zálohu (JSON)</span>
          </button>

          <label className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Nahrát ze zálohy</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetovat veškerý pokrok</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Opravdu resetovat pokrok?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tato akce smaže historii vašich odpovědí, uložené záložky i výsledky simulací. Tuto akci nelze vrátit zpět.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Zrušit
              </button>
              <button
                onClick={() => {
                  onClearStats();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Ano, resetovat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
