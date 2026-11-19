import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { StageCompletionReward } from '@/types/progress';

const STORAGE_KEY = 'math-g1-progress-storage';

export function getProfileStorageKey(childId?: string): string {
  if (!childId || childId === 'guest') {
    return 'math-g1-progress-storage_guest';
  }
  return `math-g1-progress-storage_${childId}`;
}

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
  currentChildId: string;
  unlockedStages: string[];
  stageStars: Record<string, number>;
  totalCoins: number;
  totalExp: number;
  inventory: string[];
  equippedItems: string[];
  streakDays: number;
  lastStudyDate: string | null;
  studyMinutesToday: number;
  claimedQuestIds: string[];
  claimedQuestDate: string | null;
  lastChestOpenedDate: string | null;
  chestRewardCoins: number | null;
  isStageUnlocked: (stageId: string) => boolean;
  getStageStars: (stageId: string) => number;
  getTotalStars: () => number;
  completeStage: (
    stageId: string,
    result: StageCompletionReward,
    nextStageId?: string
  ) => void;
  recordStudyDay: (dateStr?: string) => void;
  addStudyMinutes: (minutes: number) => void;
  addRewards: (coins: number, exp: number) => void;
  purchaseItem: (itemId: string, cost: number) => boolean;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  isQuestClaimed: (questId: string, dateStr?: string) => boolean;
  isChestOpenedToday: (dateStr?: string) => boolean;
  claimQuest: (
    questId: string,
    rewardCoins: number,
    rewardExp?: number,
    dateStr?: string
  ) => boolean;
  openMysteryChest: (rewardCoins: number, dateStr?: string) => boolean;
  loadChildProgress: (childId: string) => void;
  reset: () => void;
}

const createInitialData = (childId = 'guest') => ({
  currentChildId: childId,
  unlockedStages: getInitialUnlockedStages(),
  stageStars: {} as Record<string, number>,
  totalCoins: 0,
  totalExp: 0,
  inventory: [] as string[],
  equippedItems: [] as string[],
  streakDays: 0,
  lastStudyDate: null as string | null,
  studyMinutesToday: 0,
  claimedQuestIds: [] as string[],
  claimedQuestDate: null as string | null,
  lastChestOpenedDate: null as string | null,
  chestRewardCoins: null as number | null,
});

function persistCurrentChildSnapshot(getFn: () => ProgressStoreState): void {
  const currentId = getFn().currentChildId;
  if (!currentId) return;
  const currentKey = getProfileStorageKey(currentId);
  const currentPayload = JSON.stringify({
    state: {
      unlockedStages: getFn().unlockedStages,
      stageStars: getFn().stageStars,
      totalCoins: getFn().totalCoins,
      totalExp: getFn().totalExp,
      inventory: getFn().inventory,
      equippedItems: getFn().equippedItems,
      streakDays: getFn().streakDays,
      lastStudyDate: getFn().lastStudyDate,
      studyMinutesToday: getFn().studyMinutesToday ?? 0,
      claimedQuestIds: getFn().claimedQuestIds,
      claimedQuestDate: getFn().claimedQuestDate,
      lastChestOpenedDate: getFn().lastChestOpenedDate,
      chestRewardCoins: getFn().chestRewardCoins,
    },
    version: 0,
  });
  safeLocalStorage.setItem(currentKey, currentPayload);
}

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

        // Record study day for real consecutive streak
        get().recordStudyDay();

        // Immediately persist child snapshot
        persistCurrentChildSnapshot(get);
      },

      recordStudyDay: (dateStr?: string): void => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        set((state) => {
          if (!state.lastStudyDate) {
            return {
              streakDays: 1,
              lastStudyDate: todayStr,
            };
          }

          if (state.lastStudyDate === todayStr) {
            return state;
          }

          const lastDate = new Date(state.lastStudyDate);
          const currentDate = new Date(todayStr);
          const diffTime = currentDate.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

          if (diffDays === 1) {
            return {
              streakDays: state.streakDays + 1,
              lastStudyDate: todayStr,
            };
          }

          return {
            streakDays: 1,
            lastStudyDate: todayStr,
          };
        });
      },

      addStudyMinutes: (minutes: number): void => {
        if (minutes <= 0) return;
        set((state) => ({
          studyMinutesToday: (state.studyMinutesToday || 0) + minutes,
        }));
        persistCurrentChildSnapshot(get);
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

      isQuestClaimed: (questId: string, dateStr?: string): boolean => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const state = get();
        if (state.claimedQuestDate !== todayStr) {
          return false;
        }
        return state.claimedQuestIds.includes(questId);
      },

      isChestOpenedToday: (dateStr?: string): boolean => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const state = get();
        return state.lastChestOpenedDate === todayStr;
      },

      claimQuest: (
        questId: string,
        rewardCoins: number,
        rewardExp?: number,
        dateStr?: string
      ): boolean => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const state = get();
        const isNewDay = state.claimedQuestDate !== todayStr;
        const currentIds = isNewDay ? [] : state.claimedQuestIds;

        if (currentIds.includes(questId)) {
          return false;
        }

        const safeCoins = Math.max(0, rewardCoins);
        const safeExp = Math.max(0, rewardExp ?? 0);

        set({
          claimedQuestDate: todayStr,
          claimedQuestIds: [...currentIds, questId],
          totalCoins: state.totalCoins + safeCoins,
          totalExp: state.totalExp + safeExp,
        });

        persistCurrentChildSnapshot(get);
        return true;
      },

      openMysteryChest: (rewardCoins: number, dateStr?: string): boolean => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const state = get();
        if (state.lastChestOpenedDate === todayStr) {
          return false;
        }

        const safeCoins = Math.max(0, rewardCoins);
        set({
          lastChestOpenedDate: todayStr,
          chestRewardCoins: safeCoins,
          totalCoins: state.totalCoins + safeCoins,
        });

        persistCurrentChildSnapshot(get);
        return true;
      },

      loadChildProgress: (childId: string): void => {
        const targetChildId = childId || 'guest';
        const currentId = get().currentChildId;

        if (currentId === targetChildId) {
          return;
        }

        // Save current child progress before switching
        if (currentId && currentId !== targetChildId) {
          persistCurrentChildSnapshot(get);
        }

        // Load target child progress
        const targetKey = getProfileStorageKey(targetChildId);
        const savedRaw = safeLocalStorage.getItem(targetKey);

        if (typeof savedRaw === 'string') {
          try {
            const parsed = JSON.parse(savedRaw);
            const targetState = parsed.state || parsed;
            set({
              ...createInitialData(targetChildId),
              ...targetState,
              currentChildId: targetChildId,
            });
            return;
          } catch {
            // Ignore parse error and fall back to initial
          }
        }

        // Target child has no saved data yet -> clean initial data
        set(createInitialData(targetChildId));
      },

      reset: (): void => {
        const curId = get().currentChildId;
        safeLocalStorage.removeItem(STORAGE_KEY);
        if (curId) {
          safeLocalStorage.removeItem(getProfileStorageKey(curId));
        }
        safeLocalStorage.removeItem('math-g1-progress-storage_guest');
        set(createInitialData('guest'));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        currentChildId: state.currentChildId,
        unlockedStages: state.unlockedStages,
        stageStars: state.stageStars,
        totalCoins: state.totalCoins,
        totalExp: state.totalExp,
        inventory: state.inventory,
        equippedItems: state.equippedItems,
        streakDays: state.streakDays,
        lastStudyDate: state.lastStudyDate,
        studyMinutesToday: state.studyMinutesToday,
        claimedQuestIds: state.claimedQuestIds,
        claimedQuestDate: state.claimedQuestDate,
        lastChestOpenedDate: state.lastChestOpenedDate,
        chestRewardCoins: state.chestRewardCoins,
      }),
    }
  )
);
