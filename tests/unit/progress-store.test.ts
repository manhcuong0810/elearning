import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from '@/store/useProgressStore';

describe('Progress Store (useProgressStore)', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('should initialize with first stage unlocked, zero coins/exp, and empty inventory', () => {
    const store = useProgressStore.getState();
    expect(store.isStageUnlocked('stage_1')).toBe(true);
    expect(store.isStageUnlocked('stage_2')).toBe(false);
    expect(store.getStageStars('stage_1')).toBe(0);
    expect(store.totalCoins).toBe(0);
    expect(store.totalExp).toBe(0);
    expect(store.inventory).toEqual([]);
    expect(store.equippedItems).toEqual([]);
  });

  it('should complete a stage, award stars/coins/exp and unlock next stage', () => {
    const store = useProgressStore.getState();
    expect(store.isStageUnlocked('stage_1')).toBe(true);
    expect(store.isStageUnlocked('stage_2')).toBe(false);

    store.completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 });

    const updated = useProgressStore.getState();
    expect(updated.getStageStars('stage_1')).toBe(3);
    expect(updated.totalCoins).toBe(15);
    expect(updated.totalExp).toBe(30);
    expect(updated.isStageUnlocked('stage_2')).toBe(true);
  });

  it('should unlock sequential curriculum stages across chapters including boss stages', () => {
    const store = useProgressStore.getState();

    // Complete stage_1 -> unlocks stage_2
    store.completeStage('stage_1', { stars: 2, earnedCoins: 10, earnedExp: 20 });
    expect(useProgressStore.getState().isStageUnlocked('stage_2')).toBe(true);

    // Complete stage_2 -> unlocks boss_c1 (Chapter 1 Boss)
    useProgressStore.getState().completeStage('stage_2', { stars: 3, earnedCoins: 15, earnedExp: 30 });
    expect(useProgressStore.getState().isStageUnlocked('boss_c1')).toBe(true);

    // Complete boss_c1 -> unlocks stage_3 (first stage of Chapter 2)
    useProgressStore.getState().completeStage('boss_c1', { stars: 3, earnedCoins: 45, earnedExp: 90 });
    expect(useProgressStore.getState().isStageUnlocked('stage_3')).toBe(true);

    // Complete stage_3 -> unlocks boss_c2 (Chapter 2 Boss)
    useProgressStore.getState().completeStage('stage_3', { stars: 2, earnedCoins: 15, earnedExp: 30 });
    expect(useProgressStore.getState().isStageUnlocked('boss_c2')).toBe(true);
  });

  it('should keep the highest star rating (clamped 0-3) when replaying a stage', () => {
    const store = useProgressStore.getState();

    store.completeStage('stage_1', { stars: 2, earnedCoins: 10, earnedExp: 20 });
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(2);

    // Replay with lower stars (1 star) -> keeps 2 stars, still adds coins & exp
    useProgressStore.getState().completeStage('stage_1', { stars: 1, earnedCoins: 5, earnedExp: 10 });
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(2);
    expect(useProgressStore.getState().totalCoins).toBe(15);
    expect(useProgressStore.getState().totalExp).toBe(30);

    // Replay with higher stars (5 -> clamped to 3)
    useProgressStore.getState().completeStage('stage_1', { stars: 5, earnedCoins: 15, earnedExp: 30 });
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(3);
  });

  it('should unlock explicit nextStageId when provided to completeStage', () => {
    const store = useProgressStore.getState();
    store.completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 }, 'special_bonus_stage');

    expect(useProgressStore.getState().isStageUnlocked('special_bonus_stage')).toBe(true);
  });

  it('should support addRewards, purchaseItem, and equipItem for Avatar Room', () => {
    const store = useProgressStore.getState();
    store.addRewards(50, 100);

    expect(useProgressStore.getState().totalCoins).toBe(50);
    expect(useProgressStore.getState().totalExp).toBe(100);

    // Purchase affordable item
    const bought = useProgressStore.getState().purchaseItem('hat_knight', 30);
    expect(bought).toBe(true);
    expect(useProgressStore.getState().totalCoins).toBe(20);
    expect(useProgressStore.getState().inventory).toContain('hat_knight');

    // Prevent buying item if insufficient coins
    const boughtExpensive = useProgressStore.getState().purchaseItem('cape_royal', 40);
    expect(boughtExpensive).toBe(false);
    expect(useProgressStore.getState().totalCoins).toBe(20);
    expect(useProgressStore.getState().inventory).not.toContain('cape_royal');

    // Equip purchased item
    useProgressStore.getState().equipItem('hat_knight');
    expect(useProgressStore.getState().equippedItems).toContain('hat_knight');
  });

  it('should persist progress state to localStorage for offline safety', () => {
    const store = useProgressStore.getState();
    store.completeStage('stage_1', { stars: 3, earnedCoins: 25, earnedExp: 40 });

    const rawPersisted = window.localStorage.getItem('math-g1-progress-storage');
    expect(rawPersisted).not.toBeNull();
    expect(rawPersisted).toContain('stage_2');
    expect(rawPersisted).toContain('"totalCoins":25');
  });

  it('should claim daily quests, prevent duplicate claims on the same day, and persist to localStorage', () => {
    const store = useProgressStore.getState();
    const dateStr = '2026-11-19';

    expect(store.isQuestClaimed('stars_5', dateStr)).toBe(false);

    // Claim quest
    const claimed = store.claimQuest('stars_5', 15, 10, dateStr);
    expect(claimed).toBe(true);

    const updated = useProgressStore.getState();
    expect(updated.totalCoins).toBe(15);
    expect(updated.totalExp).toBe(10);
    expect(updated.isQuestClaimed('stars_5', dateStr)).toBe(true);

    // Attempt duplicate claim on same day -> must return false and not add coins
    const duplicateClaim = updated.claimQuest('stars_5', 15, 10, dateStr);
    expect(duplicateClaim).toBe(false);
    expect(useProgressStore.getState().totalCoins).toBe(15);

    // Verify localStorage persistence
    const rawPersisted = window.localStorage.getItem('math-g1-progress-storage');
    expect(rawPersisted).not.toBeNull();
    expect(rawPersisted).toContain('stars_5');
    expect(rawPersisted).toContain('2026-11-19');

    // On a new day (2026-11-20), quest is available again
    const nextDay = '2026-11-20';
    expect(useProgressStore.getState().isQuestClaimed('stars_5', nextDay)).toBe(false);
    const claimedNextDay = useProgressStore.getState().claimQuest('stars_5', 15, 10, nextDay);
    expect(claimedNextDay).toBe(true);
    expect(useProgressStore.getState().totalCoins).toBe(30);
  });

  it('should open daily mystery chest, prevent duplicate opening on the same day, and persist to localStorage', () => {
    const store = useProgressStore.getState();
    const dateStr = '2026-11-19';

    expect(store.isChestOpenedToday(dateStr)).toBe(false);

    // Open chest
    const opened = store.openMysteryChest(25, dateStr);
    expect(opened).toBe(true);

    const updated = useProgressStore.getState();
    expect(updated.totalCoins).toBe(25);
    expect(updated.isChestOpenedToday(dateStr)).toBe(true);
    expect(updated.chestRewardCoins).toBe(25);

    // Attempt duplicate opening on same day
    const duplicateOpen = updated.openMysteryChest(30, dateStr);
    expect(duplicateOpen).toBe(false);
    expect(useProgressStore.getState().totalCoins).toBe(25);

    // Verify localStorage persistence
    const rawPersisted = window.localStorage.getItem('math-g1-progress-storage');
    expect(rawPersisted).not.toBeNull();
    expect(rawPersisted).toContain('"lastChestOpenedDate":"2026-11-19"');

    // On a new day (2026-11-20), chest can be opened again
    const nextDay = '2026-11-20';
    expect(useProgressStore.getState().isChestOpenedToday(nextDay)).toBe(false);
    const openedNextDay = useProgressStore.getState().openMysteryChest(20, nextDay);
    expect(openedNextDay).toBe(true);
    expect(useProgressStore.getState().totalCoins).toBe(45);
  });

  it('should track real streak days and update based on consecutive study dates', () => {
    const store = useProgressStore.getState();
    expect(store.streakDays).toBe(0);
    expect(store.lastStudyDate).toBeNull();

    // Day 1
    store.recordStudyDay('2026-11-17');
    expect(useProgressStore.getState().streakDays).toBe(1);
    expect(useProgressStore.getState().lastStudyDate).toBe('2026-11-17');

    // Same day study again -> streak remains 1
    useProgressStore.getState().recordStudyDay('2026-11-17');
    expect(useProgressStore.getState().streakDays).toBe(1);

    // Consecutive day (Day 2) -> streak becomes 2
    useProgressStore.getState().recordStudyDay('2026-11-18');
    expect(useProgressStore.getState().streakDays).toBe(2);
    expect(useProgressStore.getState().lastStudyDate).toBe('2026-11-18');

    // Skipping a day (Day 4: 2026-11-20 instead of 2026-11-19) -> streak resets to 1
    useProgressStore.getState().recordStudyDay('2026-11-20');
    expect(useProgressStore.getState().streakDays).toBe(1);
    expect(useProgressStore.getState().lastStudyDate).toBe('2026-11-20');
  });
});
