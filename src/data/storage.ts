import { Question, OptionKey, UserStats, ExamResult, QuestionAnswerRecord } from './types';
import rawQuestions from './questions.json';

export const questions: Question[] = rawQuestions as Question[];

const STORAGE_KEY = 'urednicka_zkouska_progress_v1';

const defaultStats: UserStats = {
  history: {},
  bookmarks: [],
  examResults: [],
  flashcardKnown: [],
  lastActive: new Date().toISOString(),
  streakDays: 1,
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ...defaultStats,
      ...parsed,
    };
  } catch (err) {
    console.warn('Failed to load stats from localStorage:', err);
    return defaultStats;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save stats to localStorage:', err);
  }
}

export function recordQuestionAnswer(
  questionId: number,
  selected: OptionKey,
  isCorrect: boolean,
  prevStats: UserStats
): UserStats {
  const existing = prevStats.history[questionId];
  const newRecord: QuestionAnswerRecord = {
    selected,
    isCorrect,
    timestamp: Date.now(),
    attemptsCount: (existing?.attemptsCount || 0) + 1,
    mistakeCount: (existing?.mistakeCount || 0) + (isCorrect ? 0 : 1),
  };

  const updated: UserStats = {
    ...prevStats,
    history: {
      ...prevStats.history,
      [questionId]: newRecord,
    },
    lastActive: new Date().toISOString(),
  };

  saveUserStats(updated);
  return updated;
}

export function toggleQuestionBookmark(questionId: number, prevStats: UserStats): UserStats {
  const exists = prevStats.bookmarks.includes(questionId);
  const updatedBookmarks = exists
    ? prevStats.bookmarks.filter((id) => id !== questionId)
    : [...prevStats.bookmarks, questionId];

  const updated: UserStats = {
    ...prevStats,
    bookmarks: updatedBookmarks,
  };

  saveUserStats(updated);
  return updated;
}

export function toggleFlashcardKnown(questionId: number, known: boolean, prevStats: UserStats): UserStats {
  const current = new Set(prevStats.flashcardKnown);
  if (known) {
    current.add(questionId);
  } else {
    current.delete(questionId);
  }

  const updated: UserStats = {
    ...prevStats,
    flashcardKnown: Array.from(current),
  };

  saveUserStats(updated);
  return updated;
}

export function recordExamResult(result: ExamResult, prevStats: UserStats): UserStats {
  const updated: UserStats = {
    ...prevStats,
    examResults: [result, ...prevStats.examResults],
    lastActive: new Date().toISOString(),
  };

  // Also update history records for all answered exam questions
  const updatedHistory = { ...updated.history };
  for (const a of result.answers) {
    if (a.selected) {
      const existing = updatedHistory[a.questionId];
      updatedHistory[a.questionId] = {
        selected: a.selected,
        isCorrect: a.isCorrect,
        timestamp: Date.now(),
        attemptsCount: (existing?.attemptsCount || 0) + 1,
        mistakeCount: (existing?.mistakeCount || 0) + (a.isCorrect ? 0 : 1),
      };
    }
  }
  updated.history = updatedHistory;

  saveUserStats(updated);
  return updated;
}

export function clearUserProgress(): UserStats {
  saveUserStats(defaultStats);
  return defaultStats;
}

/**
 * Generate 30 random questions faithfully distributed across all 4 okruhy:
 * - Okruh 1 (Organizace veřejné správy, Ústava): 11 questions
 * - Okruh 2 (Práva a etika státního zaměstnance): 3 questions
 * - Okruh 3 (Právní předpisy, správní řád): 13 questions
 * - Okruh 4 (Právo EU): 3 questions
 * Total: exactly 30 questions
 */
export function generateExamQuestions(): Question[] {
  const okruh1 = questions.filter((q) => q.okruhId === 1);
  const okruh2 = questions.filter((q) => q.okruhId === 2);
  const okruh3 = questions.filter((q) => q.okruhId === 3);
  const okruh4 = questions.filter((q) => q.okruhId === 4);

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const selected1 = shuffle(okruh1).slice(0, 11);
  const selected2 = shuffle(okruh2).slice(0, 3);
  const selected3 = shuffle(okruh3).slice(0, 13);
  const selected4 = shuffle(okruh4).slice(0, 3);

  // Combine and shuffle the final test sequence
  return shuffle([...selected1, ...selected2, ...selected3, ...selected4]);
}
