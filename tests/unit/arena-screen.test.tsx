import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ArenaMatchScreen } from '@/components/arena/ArenaMatchScreen';
import { useProgressStore } from '@/store/useProgressStore';

describe('ArenaMatchScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useProgressStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders lobby, counts down 10s matchmaking, transitions to active 1vs1 race track with Bot opponent and safe emotes', () => {
    const { container } = render(<ArenaMatchScreen playerName="Bé Na" />);

    // 1. Lobby state
    const startSearchBtn = screen.getByTestId('arena-start-search-btn');
    expect(startSearchBtn.textContent).toMatch(/Tìm bạn cùng thi tài/i);

    fireEvent.click(startSearchBtn);

    // Matchmaking state
    expect(screen.getByTestId('arena-searching-state')).toBeDefined();

    // Advance 10 seconds to trigger Bot fallback
    act(() => {
      vi.advanceTimersByTime(10100);
    });

    // 2. Active 1vs1 Match state
    expect(screen.getByTestId('arena-race-track')).toBeDefined();
    expect(screen.getByText(/Bé Na/i)).toBeDefined();

    // Safe preset Emote buttons (no free-text chat input!)
    const helloEmote = screen.getByTestId('arena-emote-hello');
    const greatEmote = screen.getByTestId('arena-emote-cheer');
    const tryHardEmote = screen.getByTestId('arena-emote-fighting');

    expect(helloEmote.textContent).toContain('👋 Chào bạn');
    expect(greatEmote.textContent).toContain('🎉 Tuyệt quá');
    expect(tryHardEmote.textContent).toContain('💪 Cố lên');
    expect(container.querySelector('input[type="text"]')).toBeNull();

    // Clicking an emote shows the active emote bubble
    fireEvent.click(helloEmote);
    expect(screen.getByTestId('player-active-emote').textContent).toContain('👋 Chào bạn');

    // Audio prompt button on the question must be >= 48x48px
    const audioBtn = screen.getByTestId('audio-prompt-button');
    expect(audioBtn.className).toContain('min-w-[48px]');
    expect(audioBtn.className).toContain('min-h-[48px]');
  });

  it('advances player racer across 5 questions, finishes match, awards Coins & EXP in store, and uses positive encouraging language', () => {
    const sampleQuestions = [
      {
        id: 'aq1',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '1 + 1 = ?',
        promptAudioUrl: '/audio/q1.mp3',
        options: [
          { id: 'o1', text: '2', isCorrect: true },
          { id: 'o2', text: '3', isCorrect: false },
        ],
        rewardCoins: 10,
        rewardExp: 20,
      },
      {
        id: 'aq2',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '2 + 1 = ?',
        promptAudioUrl: '/audio/q2.mp3',
        options: [
          { id: 'o1', text: '3', isCorrect: true },
          { id: 'o2', text: '4', isCorrect: false },
        ],
        rewardCoins: 10,
        rewardExp: 20,
      },
      {
        id: 'aq3',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '2 + 2 = ?',
        promptAudioUrl: '/audio/q3.mp3',
        options: [
          { id: 'o1', text: '4', isCorrect: true },
          { id: 'o2', text: '5', isCorrect: false },
        ],
        rewardCoins: 10,
        rewardExp: 20,
      },
      {
        id: 'aq4',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '3 + 2 = ?',
        promptAudioUrl: '/audio/q4.mp3',
        options: [
          { id: 'o1', text: '5', isCorrect: true },
          { id: 'o2', text: '6', isCorrect: false },
        ],
        rewardCoins: 10,
        rewardExp: 20,
      },
      {
        id: 'aq5',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '4 + 2 = ?',
        promptAudioUrl: '/audio/q5.mp3',
        options: [
          { id: 'o1', text: '6', isCorrect: true },
          { id: 'o2', text: '7', isCorrect: false },
        ],
        rewardCoins: 10,
        rewardExp: 20,
      },
    ];

    const { container } = render(
      <ArenaMatchScreen playerName="Bé Na" questions={sampleQuestions} />
    );

    // Start matchmaking and wait 10s
    fireEvent.click(screen.getByTestId('arena-start-search-btn'));
    act(() => {
      vi.advanceTimersByTime(10100);
    });

    // Answer all 5 questions correctly
    const correctAnswers = ['2', '3', '4', '5', '6'];
    for (const ans of correctAnswers) {
      fireEvent.click(screen.getByText(ans));
    }

    // 3. Podium / Finish state
    expect(screen.getByTestId('arena-podium-screen')).toBeDefined();

    // Verify rewards persisted in useProgressStore
    const state = useProgressStore.getState();
    expect(state.totalCoins).toBeGreaterThan(0);
    expect(state.totalExp).toBeGreaterThan(0);

    // Verify positive language (never "Thất bại" or "Game Over")
    const fullText = container.textContent || '';
    expect(fullText).not.toMatch(/Thất bại/i);
    expect(fullText).not.toMatch(/Game Over/i);
    expect(fullText).not.toMatch(/Thua cuộc/i);
  });

  it('uses encouraging positive language even when Bot finishes first (2nd place)', () => {
    const sampleQuestions = [
      {
        id: 'aq1',
        type: 'MULTIPLE_CHOICE' as const,
        promptText: '1 + 1 = ?',
        promptAudioUrl: '/audio/q1.mp3',
        options: [
          { id: 'o1', text: '2', isCorrect: true },
          { id: 'o2', text: '3', isCorrect: false },
        ],
      },
    ];

    const { container } = render(
      <ArenaMatchScreen playerName="Bé Na" questions={sampleQuestions} />
    );

    fireEvent.click(screen.getByTestId('arena-start-search-btn'));
    act(() => {
      vi.advanceTimersByTime(10100);
    });

    // Let bot advance all 5 steps before player answers
    act(() => {
      vi.advanceTimersByTime(40000);
    });

    // Podium should render with positive encouragement and still award participation coins/exp
    expect(screen.getByTestId('arena-podium-screen')).toBeDefined();
    const fullText = container.textContent || '';
    expect(fullText).not.toMatch(/Thất bại/i);
    expect(fullText).not.toMatch(/Game Over/i);
    expect(fullText).not.toMatch(/Thua cuộc/i);
    expect(useProgressStore.getState().totalCoins).toBeGreaterThan(0);
  });
});
