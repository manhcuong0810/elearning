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
});
