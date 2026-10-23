export type OptionKey = 'a' | 'b' | 'c';

export interface Question {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
  };
  correct: OptionKey;
  explanation: string;
  okruhId: 1 | 2 | 3 | 4;
  okruhTitle: string;
  law: string;
}

export interface QuestionAnswerRecord {
  selected: OptionKey;
  isCorrect: boolean;
  timestamp: number;
  attemptsCount: number;
  mistakeCount: number;
}

export interface ExamQuestionState {
  questionId: number;
  selectedOption: OptionKey | null;
  flaggedForReview: boolean;
}

export interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  breakdown: {
    okruhId: number;
    okruhTitle: string;
    score: number;
    total: number;
  }[];
  answers: {
    questionId: number;
    selected: OptionKey | null;
    correct: OptionKey;
    isCorrect: boolean;
  }[];
}

export interface UserStats {
  history: Record<number, QuestionAnswerRecord>;
  bookmarks: number[];
  examResults: ExamResult[];
  flashcardKnown: number[];
  lastActive: string;
  streakDays: number;
}

export type AppView = 'practice' | 'exam' | 'flashcards' | 'catalog' | 'stats' | 'cheatsheet' | 'answers_list';
