import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { loadGrade1MathData, loadCurriculum } from '@/lib/curriculum-loader';
import { StageCompletionReward } from '@/types/progress';
import { SubjectType, GradeLevel } from '@/types/curriculum';

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

function getInitialUnlockedStagesFor(subject: SubjectType, grade: GradeLevel): string[] {
  if (subject === 'math' && grade === 1) {
    return getInitialUnlockedStages();
  }
  try {
    const cur = loadCurriculum(subject, grade);
    const firstStage = cur.chapters[0]?.stages[0]?.id;
    return firstStage ? [firstStage] : [];
  } catch {
    return [];
  }
}

export interface ProgressStoreState {
  currentChildId: string;
  selectedSubject: SubjectType;
  selectedGrade: GradeLevel;
  setSubject: (subject: SubjectType) => void;
  setGrade: (grade: GradeLevel) => void;
  towerFloor: Record<string, number>;
  getTowerFloor: (subject?: SubjectType, grade?: GradeLevel) => number;
  advanceTowerFloor: (subject: SubjectType, grade: GradeLevel, completedFloor: number) => void;
  subjectGradeUnlockedStages: Record<string, string[]>;
  subjectGradeStageStars: Record<string, Record<string, number>>;
  unlockedStages: string[];
  stageStars: Record<string, number>;
  totalCoins: number;
  totalExp: number;
  inventory: string[];
  equippedItems: string[];
  streakDays: number;
  lastStudyDate: string | null;
  studyMinutesToday: number;
  dailyActivityDate: string | null;
  dailyStars: number;
  dailyStagesCompleted: number;
  dailyArenaMatches: number;
  claimedQuestIds: string[];
  claimedQuestDate: string | null;
  lastChestOpenedDate: string | null;
  chestRewardCoins: number | null;
  isStageUnlocked: (stageId: string, subject?: SubjectType, grade?: GradeLevel) => boolean;
  getStageStars: (stageId: string, subject?: SubjectType, grade?: GradeLevel) => number;
  getTotalStars: () => number;
  completeStage: (
    stageId: string,
    result: StageCompletionReward,
    nextStageId?: string,
    dateStr?: string,
    subject?: SubjectType,
    grade?: GradeLevel
  ) => void;
  recordStudyDay: (dateStr?: string) => void;
  addStudyMinutes: (minutes: number, dateStr?: string) => void;
  checkDailyReset: (dateStr?: string) => void;
  recordArenaMatch: (dateStr?: string) => void;
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
  selectedSubject: 'math' as SubjectType,
  selectedGrade: 1 as GradeLevel,
  towerFloor: {} as Record<string, number>,
  subjectGradeUnlockedStages: {} as Record<string, string[]>,
  subjectGradeStageStars: {} as Record<string, Record<string, number>>,
  unlockedStages: getInitialUnlockedStages(),
  stageStars: {} as Record<string, number>,
  totalCoins: 0,
  totalExp: 0,
  inventory: [] as string[],
  equippedItems: [] as string[],
  streakDays: 0,
  lastStudyDate: null as string | null,
  studyMinutesToday: 0,
  dailyActivityDate: null as string | null,
  dailyStars: 0,
  dailyStagesCompleted: 0,
  dailyArenaMatches: 0,
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
      selectedSubject: getFn().selectedSubject,
      selectedGrade: getFn().selectedGrade,
      towerFloor: getFn().towerFloor,
      subjectGradeUnlockedStages: getFn().subjectGradeUnlockedStages,
      subjectGradeStageStars: getFn().subjectGradeStageStars,
      unlockedStages: getFn().unlockedStages,
      stageStars: getFn().stageStars,
      totalCoins: getFn().totalCoins,
      totalExp: getFn().totalExp,
      inventory: getFn().inventory,
      equippedItems: getFn().equippedItems,
      streakDays: getFn().streakDays,
      lastStudyDate: getFn().lastStudyDate,
      studyMinutesToday: getFn().studyMinutesToday ?? 0,
      dailyActivityDate: getFn().dailyActivityDate,
      dailyStars: getFn().dailyStars ?? 0,
      dailyStagesCompleted: getFn().dailyStagesCompleted ?? 0,
      dailyArenaMatches: getFn().dailyArenaMatches ?? 0,
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

      setSubject: (subject: SubjectType): void => {
        set({ selectedSubject: subject });
      },

      setGrade: (grade: GradeLevel): void => {
        set({ selectedGrade: grade });
      },

      getTowerFloor: (subject?: SubjectType, grade?: GradeLevel): number => {
        const s = subject ?? get().selectedSubject;
        const g = grade ?? get().selectedGrade;
        const key = `${s}_${g}`;
        return get().towerFloor[key] ?? 1;
      },

      advanceTowerFloor: (subject: SubjectType, grade: GradeLevel, completedFloor: number): void => {
        const key = `${subject}_${grade}`;
        const current = get().getTowerFloor(subject, grade);
        if (completedFloor >= current) {
          set((state) => ({
            towerFloor: {
              ...state.towerFloor,
              [key]: completedFloor + 1,
            },
          }));
          persistCurrentChildSnapshot(get);
        }
      },

      isStageUnlocked: (stageId: string, subject?: SubjectType, grade?: GradeLevel): boolean => {
        const s = subject ?? get().selectedSubject;
        const g = grade ?? get().selectedGrade;
        if (s === 'math' && g === 1) {
          return get().unlockedStages.includes(stageId);
        }
        const key = `${s}_${g}`;
        const customList = get().subjectGradeUnlockedStages[key];
        if (customList) {
          return customList.includes(stageId);
        }
        const initial = getInitialUnlockedStagesFor(s, g);
        return initial.includes(stageId);
      },

      getStageStars: (stageId: string, subject?: SubjectType, grade?: GradeLevel): number => {
        const s = subject ?? get().selectedSubject;
        const g = grade ?? get().selectedGrade;
        if (s === 'math' && g === 1) {
          return get().stageStars[stageId] ?? 0;
        }
        const key = `${s}_${g}`;
        return get().subjectGradeStageStars[key]?.[stageId] ?? 0;
      },

      getTotalStars: (): number => {
        return Object.values(get().stageStars).reduce((sum, s) => sum + s, 0);
      },

      checkDailyReset: (dateStr?: string): void => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        const state = get();
        if (state.dailyActivityDate !== todayStr) {
          // If child studied previously on a different day, advance or reset streak
          if (state.lastStudyDate && state.lastStudyDate !== todayStr) {
            get().recordStudyDay(todayStr);
          }

          set({
            dailyActivityDate: todayStr,
            dailyStars: 0,
            dailyStagesCompleted: 0,
            dailyArenaMatches: 0,
            studyMinutesToday: 0,
            claimedQuestIds: state.claimedQuestDate === todayStr ? state.claimedQuestIds : [],
          });
          persistCurrentChildSnapshot(get);
        }
      },

      recordArenaMatch: (dateStr?: string): void => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        get().checkDailyReset(todayStr);
        set((state) => ({
          dailyArenaMatches: (state.dailyArenaMatches || 0) + 1,
        }));
        persistCurrentChildSnapshot(get);
      },

      completeStage: (
        stageId: string,
        result: StageCompletionReward,
        nextStageId?: string,
        dateStr?: string,
        subject?: SubjectType,
        grade?: GradeLevel
      ): void => {
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        get().checkDailyReset(todayStr);

        const clampedStars = Math.max(0, Math.min(3, Math.round(result.stars)));
        const earnedCoins = Math.max(0, result.earnedCoins);
        const earnedExp = Math.max(0, result.earnedExp);

        const curSubject = subject ?? get().selectedSubject;
        const curGrade = grade ?? get().selectedGrade;
        const sgKey = `${curSubject}_${curGrade}`;
        const targetNextId = resolveNextStageId(stageId, nextStageId);

        set((state) => {
          // Subject-Grade namespaced update
          const currentSgList = state.subjectGradeUnlockedStages[sgKey] || getInitialUnlockedStagesFor(curSubject, curGrade);
          const sgUnlockedSet = new Set(currentSgList);
          sgUnlockedSet.add(stageId);
          if (nextStageId) {
            sgUnlockedSet.add(nextStageId);
          } else if (targetNextId) {
            sgUnlockedSet.add(targetNextId);
          }

          const currentSgStars = { ...(state.subjectGradeStageStars[sgKey] || {}) };
          currentSgStars[stageId] = Math.max(currentSgStars[stageId] ?? 0, clampedStars);

          // Legacy Math G1 sync
          let updatedUnlockedStages = state.unlockedStages;
          let updatedStageStars = state.stageStars;

          if (curSubject === 'math' && curGrade === 1) {
            const unlockedSet = new Set(state.unlockedStages);
            unlockedSet.add(stageId);
            if (targetNextId) {
              unlockedSet.add(targetNextId);
            }
            updatedUnlockedStages = Array.from(unlockedSet);
            updatedStageStars = {
              ...state.stageStars,
              [stageId]: Math.max(state.stageStars[stageId] ?? 0, clampedStars),
            };
          }

          return {
            unlockedStages: updatedUnlockedStages,
            stageStars: updatedStageStars,
            subjectGradeUnlockedStages: {
              ...state.subjectGradeUnlockedStages,
              [sgKey]: Array.from(sgUnlockedSet),
            },
            subjectGradeStageStars: {
              ...state.subjectGradeStageStars,
              [sgKey]: currentSgStars,
            },
            totalCoins: state.totalCoins + earnedCoins,
            totalExp: state.totalExp + earnedExp,
            dailyStagesCompleted: (state.dailyStagesCompleted || 0) + 1,
            dailyStars: (state.dailyStars || 0) + clampedStars,
          };
        });

        // Record study day for real consecutive streak
        get().recordStudyDay(todayStr);

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

      addStudyMinutes: (minutes: number, dateStr?: string): void => {
        if (minutes <= 0) return;
        const todayStr = dateStr || new Date().toISOString().split('T')[0];
        get().checkDailyReset(todayStr);
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
            get().checkDailyReset();
            return;
          } catch {
            // Ignore parse error and fall back to initial
          }
        }

        // Target child has no saved data yet -> clean initial data
        set(createInitialData(targetChildId));
        get().checkDailyReset();
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
        selectedSubject: state.selectedSubject,
        selectedGrade: state.selectedGrade,
        towerFloor: state.towerFloor,
        subjectGradeUnlockedStages: state.subjectGradeUnlockedStages,
        subjectGradeStageStars: state.subjectGradeStageStars,
        unlockedStages: state.unlockedStages,
        stageStars: state.stageStars,
        totalCoins: state.totalCoins,
        totalExp: state.totalExp,
        inventory: state.inventory,
        equippedItems: state.equippedItems,
        streakDays: state.streakDays,
        lastStudyDate: state.lastStudyDate,
        studyMinutesToday: state.studyMinutesToday,
        dailyActivityDate: state.dailyActivityDate,
        dailyStars: state.dailyStars,
        dailyStagesCompleted: state.dailyStagesCompleted,
        dailyArenaMatches: state.dailyArenaMatches,
        claimedQuestIds: state.claimedQuestIds,
        claimedQuestDate: state.claimedQuestDate,
        lastChestOpenedDate: state.lastChestOpenedDate,
        chestRewardCoins: state.chestRewardCoins,
      }),
    }
  )
);
