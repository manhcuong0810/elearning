import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BossBattleScreen } from '@/components/boss/BossBattleScreen';
import { BossHealthBar } from '@/components/boss/BossHealthBar';

describe('BossHealthBar', () => {
  it('renders boss name, current HP, max HP, and health bar', () => {
    render(<BossHealthBar currentHp={2} maxHp={3} bossName="Quái Vật Kẹo Ngọt" />);

    expect(screen.getByTestId('boss-hp-bar')).toBeDefined();
    expect(screen.getByText('Quái Vật Kẹo Ngọt')).toBeDefined();
    expect(screen.getByText(/2\s*\/\s*3/)).toBeDefined();
  });
});

describe('BossBattleScreen', () => {
  const bossStage = {
    id: 'boss_c1',
    name: 'Quái Vật Kẹo Ngọt',
    isBoss: true,
    bossMaxHp: 3,
    questions: [
      {
        id: 'bq1',
        type: 'MULTIPLE_CHOICE',
        promptText: '3 + 2 = ?',
        options: [
          { id: 'o1', text: '5', isCorrect: true },
          { id: 'o2', text: '4', isCorrect: false },
        ],
      },
      {
        id: 'bq2',
        type: 'MULTIPLE_CHOICE',
        promptText: '4 + 1 = ?',
        options: [
          { id: 'o1', text: '5', isCorrect: true },
          { id: 'o2', text: '3', isCorrect: false },
        ],
      },
      {
        id: 'bq3',
        type: 'MULTIPLE_CHOICE',
        promptText: '2 + 2 = ?',
        options: [
          { id: 'o1', text: '4', isCorrect: true },
          { id: 'o2', text: '3', isCorrect: false },
        ],
      },
    ],
  };

  it('reduces boss hp when a correct answer is chosen and ensures audio prompt button >= 48x48px', () => {
    const onVictoryMock = vi.fn();
    render(<BossBattleScreen stage={bossStage as any} onVictory={onVictoryMock} />);

    expect(screen.getByText('Quái Vật Kẹo Ngọt')).toBeDefined();
    expect(screen.getByTestId('boss-hp-bar')).toBeDefined();
    expect(screen.getByText(/3\s*\/\s*3/)).toBeDefined();

    // Audio prompt button should be rendered with fallback audio URL even if missing in fixture
    const audioBtn = screen.getByTestId('audio-prompt-button');
    expect(audioBtn).toBeDefined();
    expect(audioBtn.className).toContain('min-w-[48px]');
    expect(audioBtn.className).toContain('min-h-[48px]');

    const correctBtn = screen.getByText('5');
    fireEvent.click(correctBtn);

    // Máu boss giảm từ 3 xuống 2 và cập nhật trạng thái
    expect(screen.getByTestId('boss-hp-bar')).toBeDefined();
    expect(screen.getByText(/2\s*\/\s*3/)).toBeDefined();
    expect(screen.getByTestId('magic-beam-attack')).toBeDefined();
  });

  it('triggers treasure chest victory celebration and calls onVictory when boss HP reaches 0', () => {
    const singleHpBossStage = {
      ...bossStage,
      bossMaxHp: 1,
      questions: [bossStage.questions[0]],
    };
    const onVictoryMock = vi.fn();
    render(<BossBattleScreen stage={singleHpBossStage as any} onVictory={onVictoryMock} />);

    fireEvent.click(screen.getByText('5'));

    // Boss HP reaches 0 -> Victory screen with treasure chest
    expect(screen.getByTestId('boss-victory-screen')).toBeDefined();
    expect(screen.getByTestId('treasure-chest-celebration')).toBeDefined();

    const claimBtn = screen.getByTestId('claim-boss-reward-btn');
    fireEvent.click(claimBtn);
    expect(onVictoryMock).toHaveBeenCalledTimes(1);
  });

  it('shows encouraging Cú Mèo retry screen with ZERO "Thất bại" or "Game Over" when child gets 0 correct or runs out of questions', () => {
    const onVictoryMock = vi.fn();
    const shortStage = {
      ...bossStage,
      bossMaxHp: 2,
      questions: [
        {
          id: 'bq1',
          type: 'MULTIPLE_CHOICE',
          promptText: '3 + 2 = ?',
          options: [
            { id: 'o1', text: '5', isCorrect: true },
            { id: 'o2', text: '4', isCorrect: false },
          ],
        },
      ],
    };

    const { container } = render(
      <BossBattleScreen stage={shortStage as any} onVictory={onVictoryMock} />
    );

    // Choose wrong answer and advance/finish attempts
    const wrongBtn = screen.getByText('4');
    fireEvent.click(wrongBtn);

    // Skip / finish question or exhaust attempts to trigger end of questions with 0/1 correct
    const nextOrFinishBtn = screen.getByTestId('boss-skip-question-btn');
    fireEvent.click(nextOrFinishBtn);

    // Should show encouraging retry screen
    expect(screen.getByTestId('boss-encourage-retry-screen')).toBeDefined();
    expect(
      screen.getByText(/Cố lên nào! Cùng Cú Mèo nạp lại năng lượng và thử lại nhé!/i)
    ).toBeDefined();

    // Critical review constraint: NEVER display "Thất bại" or "Game Over"
    const fullText = container.textContent || '';
    expect(fullText).not.toMatch(/Thất bại/i);
    expect(fullText).not.toMatch(/Game Over/i);
    expect(fullText).not.toMatch(/Thua cuộc/i);

    // Clicking "Thử lại ngay" resets the battle back to question 1 and full HP
    const retryBtn = screen.getByTestId('boss-retry-btn');
    expect(retryBtn.textContent).toContain('Thử lại ngay');
    fireEvent.click(retryBtn);

    expect(screen.getByText('3 + 2 = ?')).toBeDefined();
    expect(screen.getByText(/2\s*\/\s*2/)).toBeDefined();
  });
});
