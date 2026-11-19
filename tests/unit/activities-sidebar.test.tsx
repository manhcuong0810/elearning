import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivitiesSidebar } from '@/components/dashboard/ActivitiesSidebar';
import { defaultAudioManager } from '@/lib/audio-manager';

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

    // Leaderboard shows guest lock notice and zero mock learners
    expect(screen.getByTestId('mini-leaderboard')).toBeDefined();
    expect(screen.getByTestId('guest-leaderboard-lock')).toBeDefined();
    expect(screen.queryByText(/Bé Bo/i)).toBeNull();

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

  it('renders only authentic child profile on the leaderboard and contains zero mock learners', () => {
    render(
      <ActivitiesSidebar
        isAuthenticated={true}
        childName="Bé Khôi Nguyên"
        childEmoji="🦁"
        totalStars={9}
        todayStars={3}
        stagesCompletedToday={2}
        arenaMatchesToday={1}
        onClaimReward={mockOnClaimReward}
      />
    );

    expect(screen.getByTestId('mini-leaderboard')).toBeDefined();

    // Must show real child
    expect(screen.getByText(/Bé Khôi Nguyên \(Bạn\)/i)).toBeDefined();
    expect(screen.getByText('9')).toBeDefined();

    // Must NEVER contain mock learners
    expect(screen.queryByText(/Bé Bo/i)).toBeNull();
    expect(screen.queryByText(/Bé Tuấn Minh/i)).toBeNull();
    expect(screen.queryByText(/Bé Bảo An/i)).toBeNull();
    expect(screen.queryByText(/Bé Mai Chi/i)).toBeNull();
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
});
