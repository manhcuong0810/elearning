import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivitiesSidebar } from '@/components/dashboard/ActivitiesSidebar';
import { defaultAudioManager } from '@/lib/audio-manager';

import { useProgressStore } from '@/store/useProgressStore';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
  },
}));

describe('ActivitiesSidebar', () => {
  const mockOnClaimReward = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useProgressStore.getState().reset();
  });

  it('renders daily quests, mystery chest, and mini leaderboard when authenticated', () => {
    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        todayStars={4}
        stagesCompletedToday={1}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    expect(screen.getByTestId('daily-quests-card')).toBeDefined();
    expect(screen.getByTestId('mystery-chest-btn')).toBeDefined();
    expect(screen.getByTestId('mini-leaderboard')).toBeDefined();

    // Check quest titles
    expect(screen.getByText(/Thu hoạch 5 Ngôi sao/i)).toBeDefined();
    expect(screen.getByText(/Vượt qua 1 ải toán/i)).toBeDefined();
  });

  it('renders guest lock banner and hides daily quests & mystery chest when not authenticated', () => {
    const mockOnOpenAuthModal = vi.fn();
    render(
      <ActivitiesSidebar
        isAuthenticated={false}
        todayStars={2}
        stagesCompletedToday={0}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
        onOpenAuthModal={mockOnOpenAuthModal}
      />
    );

    // Guest lock card should be visible
    expect(screen.getByTestId('guest-activities-lock')).toBeDefined();
    expect(screen.getByText(/Đăng nhập để mở khóa/i)).toBeDefined();

    // Quests and Mystery chest should be hidden for guests
    expect(screen.queryByTestId('daily-quests-card')).toBeNull();
    expect(screen.queryByTestId('mystery-chest-btn')).toBeNull();

    // Leaderboard shows guest prompt with zero mock learners
    expect(screen.getByTestId('mini-leaderboard')).toBeDefined();
    expect(screen.getByText(/Bảng vinh danh chỉ ghi nhận thành tích từ học sinh thật/i)).toBeDefined();
    expect(screen.queryByText(/Bé Bo/i)).toBeNull();
    expect(screen.queryByText(/Bé Tuấn Minh/i)).toBeNull();
    expect(screen.queryByText(/\(Bạn\)/i)).toBeNull();

    // Clicking CTA button triggers auth modal
    const ctaBtn = screen.getByTestId('guest-login-cta-btn');
    fireEvent.click(ctaBtn);
    expect(mockOnOpenAuthModal).toHaveBeenCalled();
  });

  it('allows claiming completed quest rewards and triggers sfx', () => {
    render(
      <ActivitiesSidebar
        todayStars={5}
        stagesCompletedToday={1}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    const claimButtons = screen.getAllByRole('button', { name: /nhận thưởng/i });
    expect(claimButtons.length).toBeGreaterThan(0);

    fireEvent.click(claimButtons[0]);
    expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('cheer');
    expect(mockOnClaimReward).toHaveBeenCalled();
  });

  it('allows opening mystery chest and rewards coins', () => {
    render(
      <ActivitiesSidebar
        todayStars={2}
        stagesCompletedToday={0}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    const chestBtn = screen.getByTestId('mystery-chest-btn');
    fireEvent.click(chestBtn);

    expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('cheer');
    expect(mockOnClaimReward).toHaveBeenCalledWith(expect.any(Number));
    expect(screen.getByText(/Đã mở rương báu/i)).toBeDefined();
  });

  it('renders leaderboard with logged in child tagged with (Bạn) and zero mock learners', () => {
    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        childName="Bé Khôi Nguyên"
        childEmoji="🦁"
        totalStars={50}
        todayStars={3}
        stagesCompletedToday={2}
        arenaMatchesToday={1}
        onClaimReward={mockOnClaimReward}
      />
    );

    expect(screen.getByTestId('mini-leaderboard')).toBeDefined();

    // With 50 stars, Bé Khôi Nguyên (Bạn) should be Rank 1
    expect(screen.getByText(/Bé Khôi Nguyên \(Bạn\)/i)).toBeDefined();
    expect(screen.getByText('50')).toBeDefined();

    // Zero mock learners
    expect(screen.queryByText(/Bé Bo/i)).toBeNull();
    expect(screen.queryByText(/Bé Tuấn Minh/i)).toBeNull();
    expect(screen.queryByText(/Bé Bảo An/i)).toBeNull();
    expect(screen.queryByText(/Bé Mai Chi/i)).toBeNull();
  });

  it('renders family profiles on leaderboard and marks active child with (Bạn)', () => {
    const familyProfiles = [
      { id: 'c1', name: 'Bé Anh', avatarEmoji: '👦' },
      { id: 'c2', name: 'Bé Em', avatarEmoji: '👧' },
    ];

    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        childName="Bé Anh"
        childEmoji="👦"
        totalStars={12}
        todayStars={3}
        stagesCompletedToday={1}
        arenaMatchesToday={0}
        familyProfiles={familyProfiles}
        onClaimReward={mockOnClaimReward}
      />
    );

    // Active child should have (Bạn)
    expect(screen.getByText(/Bé Anh \(Bạn\)/i)).toBeDefined();
    expect(screen.getByText(/Bé Em/i)).toBeDefined();
    expect(screen.queryByText(/Bé Em \(Bạn\)/i)).toBeNull();
  });

  it('displays correct grade label on leaderboard badge and filters family profiles by grade', () => {
    const familyProfiles = [
      { id: 'c1', name: 'Moon', avatarEmoji: '🌙', gradeLabel: 'Lớp 3' },
      { id: 'c2', name: 'Bé Bi', avatarEmoji: '⭐', gradeLabel: 'Lớp 1' },
      { id: 'c3', name: 'Bé Bắp', avatarEmoji: '🌽', gradeLabel: 'Lớp 3' },
    ];

    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        childName="Moon"
        childEmoji="🌙"
        gradeLabel="Lớp 3"
        totalStars={35}
        familyProfiles={familyProfiles}
        onClaimReward={mockOnClaimReward}
      />
    );

    // Leaderboard badge should display "Lớp 3"
    const gradeBadge = screen.getByTestId('leaderboard-grade-badge');
    expect(gradeBadge.textContent).toBe('Lớp 3');

    // Moon (Bạn) and Bé Bắp (Lớp 3) should appear, but Bé Bi (Lớp 1) should be filtered out
    expect(screen.getByText(/Moon \(Bạn\)/i)).toBeDefined();
    expect(screen.getByText(/Bé Bắp/i)).toBeDefined();
    expect(screen.queryByText(/Bé Bi/i)).toBeNull();
  });

  it('preserves claimed quests and opened chest status on remount (preventing duplicate claims on page reload)', () => {
    const { unmount } = render(
      <ActivitiesSidebar
        todayStars={5}
        stagesCompletedToday={1}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    // Claim quest
    const claimButtons = screen.getAllByRole('button', { name: /nhận thưởng/i });
    fireEvent.click(claimButtons[0]);

    // Open chest
    const chestBtn = screen.getByTestId('mystery-chest-btn');
    fireEvent.click(chestBtn);

    expect(screen.getByText(/Đã mở rương báu/i)).toBeDefined();

    // Simulate page reload by unmounting and re-rendering
    unmount();

    render(
      <ActivitiesSidebar
        todayStars={5}
        stagesCompletedToday={1}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    // After reload: chest must STILL be opened!
    expect(screen.getByText(/Đã mở rương báu/i)).toBeDefined();

    // Claimed quest button must show "✓ Đã nhận" and NOT "Nhận thưởng"
    expect(screen.getAllByText(/✓ Đã nhận/i).length).toBeGreaterThan(0);
  });

  it('displays quest rewards and progress without "Đã nhận thưởng" text when user has 0 progress today', () => {
    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        todayStars={0}
        stagesCompletedToday={0}
        arenaMatchesToday={0}
        onClaimReward={mockOnClaimReward}
      />
    );

    // No quests should be marked as claimed
    expect(screen.queryByText(/✓ Đã nhận thưởng/i)).toBeNull();
    // No claim reward buttons should be visible
    expect(screen.queryByRole('button', { name: /nhận thưởng/i })).toBeNull();

    // Reward previews should be visible
    expect(screen.getByText(/\+15 Xu/i)).toBeDefined();
    expect(screen.getAllByText(/\+20 Xu/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+25 Xu/i)).toBeDefined();

    // Progress should be 0/5, 0/1, 0/1
    expect(screen.getByText('0/5')).toBeDefined();
    expect(screen.getAllByText('0/1').length).toBe(2);
  });
});
