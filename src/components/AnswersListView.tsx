import React, { useState, useMemo } from 'react';
import { Question, OptionKey } from '../data/types';
import {
  CheckCircle2,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Scale,
  PlayCircle,
  Copy,
  Check
} from 'lucide-react';

interface AnswersListViewProps {
  questions: Question[];
  onJumpToPractice: (questionId: number) => void;
}

export const AnswersListView: React.FC<AnswersListViewProps> = ({
  questions,
  onJumpToPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOkruh, setSelectedOkruh] = useState<number | 'all'>('all');
  const [onlyCorrectAnswer, setOnlyCorrectAnswer] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return questions.filter((item) => {
      if (selectedOkruh !== 'all' && item.okruhId !== selectedOkruh) return false;
      if (!q) return true;

      const fullText = (
        item.id +
        ' ' +
        item.question +
        ' ' +
        item.options[item.correct] +
        ' ' +
        item.explanation +
        ' ' +
        item.law
      ).toLowerCase();

      return fullText.includes(q);
    });
  }, [questions, searchQuery, selectedOkruh]);

  const handleCopy = (item: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Otázka č. ${item.id}: ${item.question}\nSprávná odpověď (${item.correct.toUpperCase()}): ${item.options[item.correct]}\n\nZdůvodnění (${item.law}):\n${item.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 sm:p-6 space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Seznam všech 300 otázek se správnými odpověďmi
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Oficiální klíč správných odpovědí včetně citací zákonů a odůvodnění
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              title="Vytisknout nebo uložit do PDF"
            >
              <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Tisk / PDF</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v otázkách, správných odpovědích nebo v paragrafech..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          {/* Okruh selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedOkruh('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedOkruh === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Všech 300
            </button>
            {[1, 2, 3, 4].map((id) => (
              <button
                key={id}
                onClick={() => setSelectedOkruh(id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedOkruh === id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {id}. okruh
              </button>
            ))}
          </div>

          {/* View switches */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyCorrectAnswer((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                onlyCorrectAnswer
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {onlyCorrectAnswer ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{onlyCorrectAnswer ? 'Pouze správné odpovědi' : 'Všechny 3 možnosti'}</span>
            </button>

            <button
              onClick={() => setShowExplanations((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {showExplanations ? 'Skrýt zdůvodnění' : 'Zobrazit zdůvodnění'}
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Zobrazeno <strong className="text-slate-900 dark:text-white tabular-nums">{filtered.length}</strong> z 300 otázek
        </div>
      </div>

      {/* Printable Heading for clean PDF print */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Obecná část úřednické zkoušky – Všech 300 otázek se správnými odpověďmi</h1>
        <p className="text-sm text-gray-600">Oficiální přehled správných odpovědí a zákonných citací dle MV ČR</p>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const correctKey = item.correct;
          const correctText = item.options[correctKey];

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs p-5 sm:p-6 space-y-3 transition-colors break-inside-avoid"
            >
              {/* Question metadata & ID */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    Otázka č. {item.id}
                  </span>
                  <span>·</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.okruhTitle}</span>
                  <span>·</span>
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-slate-400" />
                    {item.law}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 no-print">
                  <button
                    onClick={(e) => handleCopy(item, e)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Zkopírovat otázku a odpověď"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onJumpToPractice(item.id)}
                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Procvičit tuto otázku v kvízu"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Procvičit</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {item.question}
              </h3>

              {/* Options */}
              {onlyCorrectAnswer ? (
                /* Only correct answer is shown */
                <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 rounded-xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase mt-0.5">
                    {correctKey}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">
                      Správná odpověď:
                    </span>
                    <span className="text-sm font-semibold text-emerald-950 dark:text-emerald-100 leading-relaxed">
                      {correctText}
                    </span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                </div>
              ) : (
                /* All 3 options shown, correct one highlighted */
                <div className="space-y-2">
                  {(['a', 'b', 'c'] as OptionKey[]).map((key) => {
                    const isCorrect = item.correct === key;
                    const text = item.options[key];

                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs'
                            : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-80'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold uppercase text-xs ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {key}
                        </span>

                        <span className="flex-1 leading-relaxed">{text}</span>

                        {isCorrect && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md uppercase shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Správná
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legal Explanation */}
              {showExplanations && item.explanation && (
                <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>Zdůvodnění a zákonné znění:</span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.law}
                    </span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-sans">{item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
