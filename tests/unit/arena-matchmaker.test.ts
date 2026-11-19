import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArenaMatchmaker } from '@/lib/arena-matchmaker';

describe('ArenaMatchmaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should fallback to Bot opponent if no match found within 10 seconds', () => {
    const matchmaker = new ArenaMatchmaker();
    const onMatchFound = vi.fn();

    matchmaker.startSearch({ playerId: 'p1', playerName: 'Bé Na', grade: 1 }, onMatchFound);

    // Chưa đủ 10s: chưa ghép bot
    vi.advanceTimersByTime(5000);
    expect(onMatchFound).not.toHaveBeenCalled();

    // Vượt mốc 10s: tự động ghép bot
    vi.advanceTimersByTime(5100);
    expect(onMatchFound).toHaveBeenCalled();
    const match = onMatchFound.mock.calls[0][0];
    expect(match.opponent.isBot).toBe(true);
    expect(['Bạn Gấu Trúc', 'Bạn Thỏ Trắng', 'Bạn Cáo Nhỏ', 'Bạn Sóc Nâu']).toContain(
      match.opponent.playerName
    );
    expect(match.totalSteps).toBe(5);
  });

  it('should cancel search cleanly and not trigger bot fallback after cancelSearch()', () => {
    const matchmaker = new ArenaMatchmaker();
    const onMatchFound = vi.fn();

    matchmaker.startSearch({ playerId: 'p1', playerName: 'Bé Na', grade: 1 }, onMatchFound);
    expect(matchmaker.isSearching()).toBe(true);

    vi.advanceTimersByTime(4000);
    matchmaker.cancelSearch();
    expect(matchmaker.isSearching()).toBe(false);

    vi.advanceTimersByTime(10000);
    expect(onMatchFound).not.toHaveBeenCalled();
  });

  it('should simulate natural bot progress across 5 questions and support cancellation', () => {
    const matchmaker = new ArenaMatchmaker();
    const onProgress = vi.fn();

    const stopSimulation = matchmaker.simulateBotProgress(onProgress, {
      totalSteps: 5,
      minDelayMs: 4000,
      maxDelayMs: 7000,
    });

    // Step 1 within 7s
    vi.advanceTimersByTime(7100);
    expect(onProgress).toHaveBeenCalledWith(1);

    // Advance enough time for all 5 steps
    vi.advanceTimersByTime(30000);
    expect(onProgress).toHaveBeenLastCalledWith(5);
    expect(onProgress).toHaveBeenCalledTimes(5);

    stopSimulation();
  });
});
