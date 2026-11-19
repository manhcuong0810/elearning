import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';
import { useAuthStore } from '@/store/useAuthStore';
import { useProgressStore } from '@/store/useProgressStore';

const TEST_CHILDREN = [
  {
    id: 'child_1',
    name: 'Bé Bin',
    gradeLabel: 'Lớp 1A',
    avatarEmoji: '🦁',
    pinIcons: ['🍎', '⭐', '🦆', '🌈'],
    studyMinutesToday: 0,
  },
  {
    id: 'child_2',
    name: 'Bé Na',
    gradeLabel: 'Lớp 1B',
    avatarEmoji: '🐰',
    pinIcons: ['🍓', '🌸', '🐱', '⭐'],
    studyMinutesToday: 0,
  },
];

describe('Full Learning Platform Integration', () => {
  beforeEach(async () => {
    useProgressStore.getState().reset();
    await useAuthStore.getState().loginWithGoogle({
      email: 'parent@gmail.com',
      fullName: 'Phụ Huynh',
      initialChildren: TEST_CHILDREN,
    });
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

  it('claims treasure rewards and returns to Adventure Map when "Nhận Kho Báu Ngay!" is clicked on Boss victory screen', () => {
    // Unlock boss_c1 in store
    useProgressStore.getState().completeStage(
      'stage_2',
      { stars: 3, earnedCoins: 15, earnedExp: 30 },
      'boss_c1'
    );

    render(<HomePage />);

    // Click Boss node on map
    const bossNode = screen.getByTestId('stage-node-boss_c1');
    fireEvent.click(bossNode);

    expect(screen.getByTestId('boss-battle-screen')).toBeDefined();

    // Answer questions to defeat boss (correct answers: 5, 5, 4)
    // Q1: 3 + 2 = ? -> 5
    fireEvent.click(screen.getByText('5'));
    // Q2: 4 + 1 = ? -> 5
    fireEvent.click(screen.getByText('5'));
    // Q3: 2 + 2 = ? -> 4
    fireEvent.click(screen.getByText('4'));

    // Boss HP reaches 0 -> Victory screen appears!
    expect(screen.getByTestId('boss-victory-screen')).toBeDefined();
    expect(screen.getByText(/Bé đã giải đúng các phép toán và kết bạn thành công với/i)).toBeDefined();

    // Click "Nhận Kho Báu Ngay! 🎁"
    const claimBtn = screen.getByTestId('claim-boss-reward-btn');
    fireEvent.click(claimBtn);

    // Must return back to the Adventure Map!
    expect(screen.getByTestId('adventure-map')).toBeDefined();
    expect(screen.queryByTestId('boss-victory-screen')).toBeNull();
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

    // ParentalGateModal should appear with dynamic adult math challenge
    expect(screen.getByTestId('parental-gate-modal')).toBeDefined();
    const challengeBox = screen.getByTestId('parental-gate-challenge-text');
    expect(challengeBox).toBeDefined();
    const challengeText = challengeBox.textContent || '';
    const match = /^(\d+)\s*([+×x*\-−])\s*(\d+)\s*=\s*\?$/.exec(challengeText.trim());
    expect(match).not.toBeNull();
    const a = Number(match![1]);
    const op = match![2];
    const b = Number(match![3]);
    let expected = 0;
    if (op === '+') expected = a + b;
    else if (op === '-' || op === '−') expected = a - b;
    else expected = a * b;

    const input = screen.getByTestId('parental-gate-input');
    const submitBtn = screen.getByTestId('parental-gate-submit-btn');

    // Enter wrong answer first
    fireEvent.change(input, { target: { value: `${expected + 99}` } });
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('parental-gate-error')).toBeDefined();
    expect(screen.queryByTestId('parent-dashboard')).toBeNull();

    // Enter correct answer
    fireEvent.change(input, { target: { value: `${expected}` } });
    fireEvent.click(submitBtn);

    // Parent Dashboard should now be rendered with learning analytics
    expect(screen.getByTestId('parent-dashboard')).toBeDefined();
    expect(screen.getByText(/Báo Cáo Học Tập Của Bé/i)).toBeDefined();
    expect(screen.getByText(/Đếm số 1-10/i)).toBeDefined();
    expect(screen.getByText(/Phép cộng phạm vi 10/i)).toBeDefined();
  });

  it('supports switching child profiles via 4-icon PIN selector in MainHeader', async () => {
    await useAuthStore.getState().loginWithGoogle({
      email: 'parent@gmail.com',
      fullName: 'Mẹ Lan Anh',
      initialChildren: TEST_CHILDREN,
    });

    render(<HomePage />);

    // Open profile switcher modal
    fireEvent.click(screen.getByTestId('active-profile-badge'));
    expect(screen.getByTestId('profile-switcher-modal')).toBeDefined();

    // Select second child profile
    fireEvent.click(screen.getByTestId('select-profile-child_2'));
    expect(screen.getByTestId('active-profile-badge').textContent).toContain('Bé Na');
  });

  it('renders only the parent single child in Parent Portal when only 1 child exists', async () => {
    // Reset and log in with single child
    useProgressStore.getState().reset();
    await useAuthStore.getState().loginWithGoogle({
      email: 'singleparent@gmail.com',
      fullName: 'Bố Minh Trí',
      initialChildren: [
        {
          id: 'child_only_1',
          name: 'Bé Khôi Nguyên',
          gradeLabel: 'Lớp 1A',
          avatarEmoji: '🦁',
          pinIcons: ['⭐', '🚀', '🐱', '🌈'],
          studyMinutesToday: 15,
        },
      ],
    });

    render(<HomePage />);

    // Click Parent Portal
    fireEvent.click(screen.getByTestId('nav-parent-portal'));

    // Answer Parental Gate
    const challengeBox = screen.getByTestId('parental-gate-challenge-text');
    const challengeText = challengeBox.textContent || '';
    const match = /^(\d+)\s*([+×x*\-−])\s*(\d+)\s*=\s*\?$/.exec(challengeText.trim());
    const a = Number(match![1]);
    const op = match![2];
    const b = Number(match![3]);
    let ans = 0;
    if (op === '+') ans = a + b;
    else if (op === '-' || op === '−') ans = a - b;
    else ans = a * b;

    fireEvent.change(screen.getByTestId('parental-gate-input'), { target: { value: `${ans}` } });
    fireEvent.click(screen.getByTestId('parental-gate-submit-btn'));

    expect(screen.getByTestId('parent-dashboard')).toBeDefined();

    // Must show Bé Khôi Nguyên
    expect(screen.getByTestId('parent-switch-profile-child_only_1')).toBeDefined();
    expect(screen.getAllByText('Bé Khôi Nguyên').length).toBeGreaterThan(0);

    // Must NOT show mock children Bé Bin, Bé Na, Bé Bống
    expect(screen.queryByTestId('parent-switch-profile-child_1')).toBeNull();
    expect(screen.queryByTestId('parent-switch-profile-child_2')).toBeNull();
    expect(screen.queryByTestId('parent-switch-profile-child_3')).toBeNull();
    expect(screen.queryByText('Bé Bin')).toBeNull();
    expect(screen.queryByText('Bé Na')).toBeNull();
  });
});
