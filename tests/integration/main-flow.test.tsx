import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';
import { useProgressStore } from '@/store/useProgressStore';

describe('Full Learning Platform Integration', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('renders main navigation tabs and adventure map for Grade 1 Math', () => {
    render(<HomePage />);
    expect(screen.getByText(/Thung lũng Số đếm/i)).toBeDefined();
    expect(screen.getByTestId('nav-adventure-map')).toBeDefined();
    expect(screen.getByTestId('nav-arena')).toBeDefined();
    expect(screen.getByTestId('nav-avatar-room')).toBeDefined();
    expect(screen.getByTestId('nav-parent-portal')).toBeDefined();
  });

  it('allows entering an unlocked normal stage from AdventureMap, answering questions, and completing the stage', () => {
    render(<HomePage />);

    // Click Stage 1 on the Adventure Map
    const stage1Node = screen.getByTestId('stage-node-stage_1');
    fireEvent.click(stage1Node);

    // Stage Learning Session should appear
    expect(screen.getByTestId('stage-learning-session')).toBeDefined();
    expect(screen.getByText(/Đếm Quả Táo Ngọt/i)).toBeDefined();

    // Advance through the 3 questions in stage_1 using the next/complete question controls or answering
    // Question 1: COUNTING (targetCount: 3) -> click 3 items then click option '3'
    const countingItems = screen.getAllByTestId('counting-visual-item');
    fireEvent.click(countingItems[0]);
    fireEvent.click(countingItems[1]);
    fireEvent.click(countingItems[2]);
    fireEvent.click(screen.getByRole('button', { name: '3' }));

    // Proceed to Question 2
    fireEvent.click(screen.getByTestId('stage-next-question-btn'));

    // Question 2: DRAG_DROP (targetCount: 4) -> click 4 source items to move to drop zone, then submit
    for (let i = 0; i < 4; i++) {
      const poolItems = screen.getAllByTestId('draggable-source-item');
      fireEvent.click(poolItems[0]);
    }
    fireEvent.click(screen.getByTestId('drag-drop-submit-button'));

    // Proceed to Question 3
    fireEvent.click(screen.getByTestId('stage-next-question-btn'));

    // Question 3: MULTIPLE_CHOICE (targetCount: 5) -> click option '5'
    fireEvent.click(screen.getByRole('button', { name: '5' }));

    // Finish stage
    fireEvent.click(screen.getByTestId('stage-next-question-btn'));

    // 3-Star Celebration modal should be shown
    expect(screen.getByTestId('stage-completion-modal')).toBeDefined();
    expect(useProgressStore.getState().isStageUnlocked('stage_2')).toBe(true);

    // Return to Adventure Map
    fireEvent.click(screen.getByTestId('stage-celebration-continue-btn'));
    expect(screen.getByTestId('adventure-map')).toBeDefined();
  });

  it('opens BossBattleScreen when an unlocked Boss stage is selected on AdventureMap', () => {
    // Unlock boss_c1 in store
    useProgressStore.getState().completeStage(
      'stage_2',
      { stars: 3, earnedCoins: 15, earnedExp: 30 },
      'boss_c1'
    );

    render(<HomePage />);

    const bossNode = screen.getByTestId('stage-node-boss_c1');
    fireEvent.click(bossNode);

    expect(screen.getByTestId('boss-battle-screen')).toBeDefined();
    expect(screen.getAllByText(/Quái Vật Kẹo Ngọt/i).length).toBeGreaterThan(0);
  });

  it('switches cleanly between Adventure Map, Arena 1vs1, and Avatar Room tabs', () => {
    render(<HomePage />);

    // Switch to Arena tab
    fireEvent.click(screen.getByTestId('nav-arena'));
    expect(screen.getByTestId('arena-lobby-screen')).toBeDefined();
    expect(screen.getByText(/Đấu Trường Tri Thức 1vs1/i)).toBeDefined();

    // Switch to Avatar Room tab
    fireEvent.click(screen.getByTestId('nav-avatar-room'));
    expect(screen.getByText(/Nhà Của Bé & Cú Mèo/i)).toBeDefined();

    // Switch back to Adventure Map tab
    fireEvent.click(screen.getByTestId('nav-adventure-map'));
    expect(screen.getByTestId('adventure-map')).toBeDefined();
  });

  it('protects Parent Portal with ParentalGateModal and unlocks Parent Dashboard on correct adult math answer', () => {
    render(<HomePage />);

    // Click Parent Portal button in MainHeader
    fireEvent.click(screen.getByTestId('nav-parent-portal'));

    // ParentalGateModal should appear with adult math challenge (12 x 4 = ?)
    expect(screen.getByTestId('parental-gate-modal')).toBeDefined();
    expect(screen.getByText(/12 × 4 = \?/i)).toBeDefined();

    const input = screen.getByTestId('parental-gate-input');
    const submitBtn = screen.getByTestId('parental-gate-submit-btn');

    // Enter wrong answer first
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('parental-gate-error')).toBeDefined();
    expect(screen.queryByTestId('parent-dashboard')).toBeNull();

    // Enter correct answer (48)
    fireEvent.change(input, { target: { value: '48' } });
    fireEvent.click(submitBtn);

    // Parent Dashboard should now be rendered with learning analytics
    expect(screen.getByTestId('parent-dashboard')).toBeDefined();
    expect(screen.getByText(/Báo Cáo Học Tập Của Bé/i)).toBeDefined();
    expect(screen.getByText(/Đếm số 1-10/i)).toBeDefined();
    expect(screen.getByText(/Phép cộng phạm vi 10/i)).toBeDefined();
  });

  it('supports switching child profiles via 4-icon PIN selector in MainHeader', () => {
    render(<HomePage />);

    // Open profile switcher modal
    fireEvent.click(screen.getByTestId('active-profile-badge'));
    expect(screen.getByTestId('profile-switcher-modal')).toBeDefined();

    // Select second child profile
    fireEvent.click(screen.getByTestId('select-profile-child_2'));
    expect(screen.getByTestId('active-profile-badge').textContent).toContain('Bé Na');
  });
});
