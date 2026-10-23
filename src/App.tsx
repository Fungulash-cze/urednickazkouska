/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppView, OptionKey, UserStats, ExamResult } from './data/types';
import {
  questions,
  loadUserStats,
  recordQuestionAnswer,
  toggleQuestionBookmark,
  toggleFlashcardKnown,
  recordExamResult,
  clearUserProgress,
  saveUserStats,
} from './data/storage';
import { getInitialTheme, applyTheme } from './utils/theme';
import { Header } from './components/Header';
import { PracticeMode } from './components/PracticeMode';
import { ExamSimulationMode } from './components/ExamSimulationMode';
import { FlashcardsMode } from './components/FlashcardsMode';
import { CatalogMode } from './components/CatalogMode';
import { StatsView } from './components/StatsView';
import { AnswersListView } from './components/AnswersListView';
import { Scale } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('practice');
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [jumpQuestionId, setJumpQuestionId] = useState<number | undefined>(undefined);
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Initialize theme
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  // Sync stats when loaded
  useEffect(() => {
    const loaded = loadUserStats();
    setStats(loaded);
  }, []);

  const handleToggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
  };

  const handleAnswerQuestion = (questionId: number, selected: OptionKey, isCorrect: boolean) => {
    setStats((prev) => recordQuestionAnswer(questionId, selected, isCorrect, prev));
  };

  const handleToggleBookmark = (questionId: number) => {
    setStats((prev) => toggleQuestionBookmark(questionId, prev));
  };

  const handleToggleFlashcardKnown = (questionId: number, known: boolean) => {
    setStats((prev) => toggleFlashcardKnown(questionId, known, prev));
  };

  const handleSaveExamResult = (result: ExamResult) => {
    setStats((prev) => recordExamResult(result, prev));
  };

  const handleBookmarkMultiple = (questionIds: number[]) => {
    setStats((prev) => {
      const set = new Set(prev.bookmarks);
      questionIds.forEach((id) => set.add(id));
      const updated = {
        ...prev,
        bookmarks: Array.from(set),
      };
      saveUserStats(updated);
      return updated;
    });
  };

  const handleResetQuestion = (questionId: number) => {
    setStats((prev) => {
      const copy = { ...prev.history };
      delete copy[questionId];
      const updated = {
        ...prev,
        history: copy,
      };
      saveUserStats(updated);
      return updated;
    });
  };

  const handleClearAllStats = () => {
    const fresh = clearUserProgress();
    setStats(fresh);
  };

  const handleImportStats = (imported: UserStats) => {
    saveUserStats(imported);
    setStats(imported);
  };

  const handleJumpToPractice = (questionId: number) => {
    setJumpQuestionId(questionId);
    setCurrentView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartMistakesPractice = () => {
    setCurrentView('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalAnswered = Object.keys(stats.history).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Universal Top Bar */}
      <Header
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookmarkedCount={stats.bookmarks.length}
        totalAnswered={totalAnswered}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentView === 'practice' && (
          <PracticeMode
            questions={questions}
            stats={stats}
            onAnswerQuestion={handleAnswerQuestion}
            onToggleBookmark={handleToggleBookmark}
            onResetQuestion={handleResetQuestion}
            initialQuestionId={jumpQuestionId}
          />
        )}

        {currentView === 'exam' && (
          <ExamSimulationMode
            stats={stats}
            onSaveExamResult={handleSaveExamResult}
            onBookmarkQuestions={handleBookmarkMultiple}
          />
        )}

        {currentView === 'answers_list' && (
          <AnswersListView
            questions={questions}
            onJumpToPractice={handleJumpToPractice}
          />
        )}

        {currentView === 'flashcards' && (
          <FlashcardsMode
            questions={questions}
            stats={stats}
            onToggleKnown={handleToggleFlashcardKnown}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentView === 'catalog' && (
          <CatalogMode
            questions={questions}
            stats={stats}
            onToggleBookmark={handleToggleBookmark}
            onJumpToPractice={handleJumpToPractice}
          />
        )}


        {currentView === 'stats' && (
          <StatsView
            questions={questions}
            stats={stats}
            onClearStats={handleClearAllStats}
            onImportStats={handleImportStats}
            onStartMistakesPractice={handleStartMistakesPractice}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Příprava na obecnou část úřednické zkoušky
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>Všech 300 oficiálních otázek</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
