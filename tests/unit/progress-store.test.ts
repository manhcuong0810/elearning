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

  it('should isolate progress between different child profiles and guest', () => {
    const store = useProgressStore.getState();

    // Load child 1 (Bé Bống) and earn 3 stars on stage_1
    store.loadChildProgress('child_bong');
    store.completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 });
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(3);
    expect(useProgressStore.getState().totalCoins).toBe(15);

    // Switch to child 2 (Bé Na) -> starts clean with 0 stars and 0 coins
    useProgressStore.getState().loadChildProgress('child_na');
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(0);
    expect(useProgressStore.getState().totalCoins).toBe(0);

    // Bé Na earns 2 stars on stage_1
    useProgressStore.getState().completeStage('stage_1', { stars: 2, earnedCoins: 10, earnedExp: 20 });
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(2);
    expect(useProgressStore.getState().totalCoins).toBe(10);

    // Switch to guest -> clean with 0 stars and 0 coins
    useProgressStore.getState().loadChildProgress('guest');
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(0);
    expect(useProgressStore.getState().totalCoins).toBe(0);

    // Switch back to Bé Bống -> restored 3 stars and 15 coins
    useProgressStore.getState().loadChildProgress('child_bong');
    expect(useProgressStore.getState().getStageStars('stage_1')).toBe(3);
    expect(useProgressStore.getState().totalCoins).toBe(15);
  });

  it('should track and accumulate study minutes and isolate per child', () => {
    const store = useProgressStore.getState();
    expect(store.studyMinutesToday).toBe(0);

    store.loadChildProgress('child_minh');
    expect(useProgressStore.getState().studyMinutesToday).toBe(0);

    useProgressStore.getState().addStudyMinutes(15);
    expect(useProgressStore.getState().studyMinutesToday).toBe(15);

    useProgressStore.getState().addStudyMinutes(10);
    expect(useProgressStore.getState().studyMinutesToday).toBe(25);

    // Switch to another child -> starts at 0
    useProgressStore.getState().loadChildProgress('child_an');
    expect(useProgressStore.getState().studyMinutesToday).toBe(0);
    useProgressStore.getState().addStudyMinutes(5);
    expect(useProgressStore.getState().studyMinutesToday).toBe(5);

    // Switch back to child_minh -> restored 25 minutes
    useProgressStore.getState().loadChildProgress('child_minh');
    expect(useProgressStore.getState().studyMinutesToday).toBe(25);
  });

  it('should reset daily activity counters on a new day, requiring doing exercises again before claiming', () => {
    const store = useProgressStore.getState();
    const day1 = '2026-11-19';
    const day2 = '2026-11-20';

    // Day 1: Complete 2 stages, earning 3 stars each = 6 stars, 2 stages
    store.completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 }, undefined, day1);
    store.completeStage('stage_2', { stars: 3, earnedCoins: 15, earnedExp: 30 }, undefined, day1);
    store.addStudyMinutes(20, day1);
    store.recordArenaMatch(day1);

    expect(useProgressStore.getState().dailyStagesCompleted).toBe(2);
    expect(useProgressStore.getState().dailyStars).toBe(6);
    expect(useProgressStore.getState().dailyArenaMatches).toBe(1);
    expect(useProgressStore.getState().studyMinutesToday).toBe(20);

    // Day 1: User claims daily quests
    expect(useProgressStore.getState().claimQuest('stage_1', 20, 10, day1)).toBe(true);
    expect(useProgressStore.getState().claimQuest('stars_5', 15, 10, day1)).toBe(true);
    expect(useProgressStore.getState().isQuestClaimed('stage_1', day1)).toBe(true);
    expect(useProgressStore.getState().isQuestClaimed('stars_5', day1)).toBe(true);

    // Day 2 (TODAY): App opens on a new day
    useProgressStore.getState().checkDailyReset(day2);

    const refreshed = useProgressStore.getState();
    // All daily counters must be reset to 0
    expect(refreshed.dailyStagesCompleted).toBe(0);
    expect(refreshed.dailyStars).toBe(0);
    expect(refreshed.dailyArenaMatches).toBe(0);
    expect(refreshed.studyMinutesToday).toBe(0);

    // Consecutive streak must automatically advance to 2 when returning today
    expect(refreshed.streakDays).toBe(2);

    // Daily quests are not yet claimed today, but also NOT completed (counters are 0)
    expect(refreshed.isQuestClaimed('stage_1', day2)).toBe(false);
    expect(refreshed.isQuestClaimed('stars_5', day2)).toBe(false);
    // Cumulative stars and unlocked stages are still preserved
    expect(refreshed.getTotalStars()).toBe(6);
    expect(refreshed.isStageUnlocked('stage_1')).toBe(true);
    expect(refreshed.isStageUnlocked('stage_2')).toBe(true);

    // Day 2: User completes 1 stage today
    useProgressStore.getState().completeStage('stage_1', { stars: 3, earnedCoins: 15, earnedExp: 30 }, undefined, day2);
    expect(useProgressStore.getState().dailyStagesCompleted).toBe(1);
    expect(useProgressStore.getState().dailyStars).toBe(3);

    // Now quest 'stage_1' is completed for today and can be claimed
    expect(useProgressStore.getState().claimQuest('stage_1', 20, 10, day2)).toBe(true);
    expect(useProgressStore.getState().isQuestClaimed('stage_1', day2)).toBe(true);
  });

  it('manages selectedSubject and selectedGrade across grades 1-5 and 3 subjects', () => {
    const store = useProgressStore.getState();
    expect(store.selectedSubject).toBe('math');
    expect(store.selectedGrade).toBe(1);

    store.setSubject('vietnamese');
    expect(useProgressStore.getState().selectedSubject).toBe('vietnamese');

    store.setGrade(3);
    expect(useProgressStore.getState().selectedGrade).toBe(3);

    store.setSubject('english');
    store.setGrade(5);
    expect(useProgressStore.getState().selectedSubject).toBe('english');
    expect(useProgressStore.getState().selectedGrade).toBe(5);
  });

  it('tracks Endless Tower floor progression per subject and grade', () => {
    const store = useProgressStore.getState();

    // Floor starts at 1
    expect(store.getTowerFloor('math', 1)).toBe(1);
    expect(store.getTowerFloor('vietnamese', 2)).toBe(1);

    // Complete floor 1 in Math Grade 1 -> floor advances to 2
    store.advanceTowerFloor('math', 1, 1);
    expect(useProgressStore.getState().getTowerFloor('math', 1)).toBe(2);

    // Completing floor 2 in Vietnamese Grade 2
    store.advanceTowerFloor('vietnamese', 2, 1);
    store.advanceTowerFloor('vietnamese', 2, 2);
    expect(useProgressStore.getState().getTowerFloor('vietnamese', 2)).toBe(3);

    // Other subjects/grades are untouched
    expect(useProgressStore.getState().getTowerFloor('english', 1)).toBe(1);
  });

  it('initializes and unlocks first stage for any subject and grade without breaking math progress', () => {
    const store = useProgressStore.getState();

    // Check Vietnamese Grade 1 first stage is unlocked
    expect(store.isStageUnlocked('vn_g1_c1_s1', 'vietnamese', 1)).toBe(true);
    expect(store.isStageUnlocked('vn_g1_c1_s2', 'vietnamese', 1)).toBe(false);

    // Complete first stage in Vietnamese Grade 1
    store.completeStage(
      'vn_g1_c1_s1',
      { stars: 3, earnedCoins: 15, earnedExp: 30 },
      'vn_g1_c1_s2',
      undefined,
      'vietnamese',
      1
    );

    // Stage 2 is now unlocked
    expect(useProgressStore.getState().isStageUnlocked('vn_g1_c1_s2', 'vietnamese', 1)).toBe(true);

    // Math progress is still intact
    expect(useProgressStore.getState().isStageUnlocked('stage_1', 'math', 1)).toBe(true);
  });
});
