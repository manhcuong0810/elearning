/**
 * Core Curriculum Domain Types for Grade 1 Gamified Math
 */

export type QuestionType = 'MULTIPLE_CHOICE' | 'DRAG_DROP' | 'COUNTING';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  audioUrl?: string;
  imageUrl?: string;
}

export interface InteractiveItem {
  id: string;
  label?: string;
  value?: unknown;
  icon?: string;
}

export interface InteractiveTarget {
  id: string;
  label?: string;
  acceptValue?: unknown;
}

export interface InteractivePayload {
  targetCount?: number;
  itemType?: string;
  sourcePool?: number;
  items?: InteractiveItem[];
  targets?: InteractiveTarget[];
  [key: string]: unknown;
}

export interface FeedbackAudio {
  correct?: string;
  wrong?: string;
  hint?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  promptText: string;
  promptAudioUrl: string;
  options?: QuestionOption[];
  interactivePayload?: InteractivePayload;
  feedbackAudio?: FeedbackAudio;
  rewardCoins?: number;
  rewardExp?: number;
  grade?: number;
  subject?: string;
  chapterId?: string;
  levelId?: string;
}

export interface Stage {
  id: string;
  chapterId?: string;
  name: string;
  order: number;
  isBoss?: boolean;
  bossMaxHp?: number;
  bossName?: string;
  bossAvatar?: string;
  description?: string;
  icon?: string;
  questions: Question[];
  rewardStars?: number;
  requiredStarsToUnlock?: number;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  theme?: string;
  icon?: string;
  stages: Stage[];
}

export interface Curriculum {
  subject: string;
  grade: number;
  title: string;
  description?: string;
  chapters: Chapter[];
}
