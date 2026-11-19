import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { StageCompletionReward } from '@/types/progress';

const STORAGE_KEY = 'math-g1-progress-storage';

/**
 * Extracts ordered stage IDs from the Grade 1 Math curriculum
 */
function getSequentialStageIds(): string[] {
  try {
    const curriculum = loadGrade1MathData();
    const ids: string[] = [];
    for (const chapter of curriculum.chapters) {
      for (const stage of chapter.stages) {
        ids.push(stage.id);
      }
    }
    return ids.length > 0 ? ids : ['stage_1', 'stage_2'];
  } catch {
    return ['stage_1', 'stage_2'];
  }
}

/**
 * Determines the initial unlocked stages (always includes 'stage_1' and first curriculum stage)
 */
function getInitialUnlockedStages(): string[] {
  const seq = getSequentialStageIds();
  const initial = new Set<string>(['stage_1']);
  if (seq.length > 0) {
    initial.add(seq[0]);
  }
  return Array.from(initial);
}

/**
 * Finds the next sequential stage ID after a given stageId
 */
function resolveNextStageId(stageId: string, explicitNextStageId?: string): string | undefined {
  if (explicitNextStageId && explicitNextStageId.trim() !== '') {
    return explicitNextStageId;
  }

  const seq = getSequentialStageIds();
  const idx = seq.indexOf(stageId);
  if (idx !== -1 && idx + 1 < seq.length) {
    return seq[idx + 1];
  }

  const match = /^stage_(\d+)$/.exec(stageId);
  if (match) {
    return `stage_${Number(match[1]) + 1}`;
  }

  return undefined;
}

/**
 * Safe storage wrapper that degrades gracefully if localStorage is unavailable
 */
const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch {
      // Ignore storage access errors in restricted/offline contexts
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch {
      // Ignore storage quota or security errors
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch {
      // Ignore storage access errors
    }
  },
};

export interface ProgressStoreState {
  unlockedStages: string[];
  stageStars: Record<string, number>;
  totalCoins: number;
  totalExp: number;
  inventory: string[];
  equippedItems: string[];
  isStageUnlocked: (stageId: string) => boolean;
  getStageStars: (stageId: string) => number;
  getTotalStars: () => number;
  completeStage: (
    stageId: string,
    result: StageCompletionReward,
    nextStageId?: string
  ) => void;
  addRewards: (coins: number, exp: number) => void;
  purchaseItem: (itemId: string, cost: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  reset: () => void;
}

const createInitialData = () => ({
  unlockedStages: getInitialUnlockedStages(),
  stageStars: {} as Record<string, number>,
  totalCoins: 0,
  totalExp: 0,
  inventory: [] as string[],
  equippedItems: [] as string[],
});

export const useProgressStore = create<ProgressStoreState>()(
  persist(
    (set, get) => ({
      ...createInitialData(),

      isStageUnlocked: (stageId: string): boolean => {
        return get().unlockedStages.includes(stageId);
      },

      getStageStars: (stageId: string): number => {
        return get().stageStars[stageId] ?? 0;
      },

      getTotalStars: (): number => {
        return Object.values(get().stageStars).reduce((sum, s) => sum + s, 0);
      },

      completeStage: (
        stageId: string,
        result: StageCompletionReward,
        nextStageId?: string
      ): void => {
        const clampedStars = Math.max(0, Math.min(3, Math.round(result.stars)));
        const earnedCoins = Math.max(0, result.earnedCoins);
        const earnedExp = Math.max(0, result.earnedExp);
        const targetNextId = resolveNextStageId(stageId, nextStageId);

        set((state) => {
          const prevStars = state.stageStars[stageId] ?? 0;
          const bestStars = Math.max(prevStars, clampedStars);

          const unlockedSet = new Set(state.unlockedStages);
          unlockedSet.add(stageId);
          if (targetNextId) {
            unlockedSet.add(targetNextId);
          }

          return {
            unlockedStages: Array.from(unlockedSet),
            stageStars: {
              ...state.stageStars,
              [stageId]: bestStars,
            },
            totalCoins: state.totalCoins + earnedCoins,
            totalExp: state.totalExp + earnedExp,
          };
        });
      },

      addRewards: (coins: number, exp: number): void => {
        const addedCoins = Math.max(0, coins);
        const addedExp = Math.max(0, exp);
        set((state) => ({
          totalCoins: state.totalCoins + addedCoins,
          totalExp: state.totalExp + addedExp,
        }));
      },

      purchaseItem: (itemId: string, cost: number): boolean => {
        const state = get();
        if (cost < 0 || state.totalCoins < cost) {
          return false;
        }
        if (state.inventory.includes(itemId)) {
          return false;
        }

        set((prev) => ({
          totalCoins: prev.totalCoins - cost,
          inventory: [...prev.inventory, itemId],
        }));
        return true;
      },

      equipItem: (itemId: string): void => {
        set((state) => {
          if (state.equippedItems.includes(itemId)) {
            return state;
          }
          return {
            equippedItems: [...state.equippedItems, itemId],
          };
        });
      },

      unequipItem: (itemId: string): void => {
        set((state) => ({
          equippedItems: state.equippedItems.filter((id) => id !== itemId),
        }));
      },

      reset: (): void => {
        safeLocalStorage.removeItem(STORAGE_KEY);
        set(createInitialData());
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        unlockedStages: state.unlockedStages,
        stageStars: state.stageStars,
        totalCoins: state.totalCoins,
        totalExp: state.totalExp,
        inventory: state.inventory,
        equippedItems: state.equippedItems,
      }),
    }
  )
);
