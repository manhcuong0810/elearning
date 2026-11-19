/**
 * Progress and Progression Domain Types
 */

export interface StageProgress {
  stageId: string;
  stars: number; // 0 to 3 stars
  isCompleted: boolean;
  isUnlocked: boolean;
  highScore?: number;
  completedAt?: string;
}

export interface StageCompletionReward {
  stars: number;
  earnedCoins: number;
  earnedExp: number;
}

export interface EquippedItems {
  hat?: string;
  outfit?: string;
  accessory?: string;
}

export interface UserProgress {
  totalCoins: number;
  totalExp: number;
  unlockedStages: string[];
  stageRecords: Record<string, StageProgress>;
  currentStreak?: number;
  lastPlayedAt?: string;
  equippedItems?: EquippedItems;
  inventory?: string[];
}
