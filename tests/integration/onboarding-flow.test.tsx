import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';
import { useAuthStore } from '@/store/useAuthStore';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
    isMuted: vi.fn(() => false),
    toggleMute: vi.fn(() => false),
  },
}));

describe('New Parent Onboarding & Child Profile Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('triggers CreateChildModal onboarding when a new parent signs in with 0 children, and switches to created child', async () => {
    render(<HomePage />);

    // 1. Initial state is unauthenticated Guest (no profile badge and no currency counters)
    expect(screen.queryByTestId('active-profile-badge')).toBeNull();
    expect(screen.queryByTestId('header-total-stars')).toBeNull();

    // 2. Open auth modal and register a new parent account
    fireEvent.click(screen.getByTestId('auth-open-modal-btn'));
    fireEvent.click(screen.getByText(/Đăng Ký Mới/i));

    fireEvent.change(screen.getByLabelText(/Họ và tên Phụ huynh/i), {
      target: { value: 'Mẹ Lan Chi' },
    });
    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'melanchi@gmail.com' },
    });
    fireEvent.change(screen.getByTestId('auth-password-input'), {
      target: { value: 'matkhau123' },
    });
    fireEvent.click(screen.getByTestId('auth-submit-btn'));

    // 3. Auth modal closes, and CreateChildModal ONBOARDING automatically appears!
    await waitFor(() => {
      expect(screen.getByTestId('create-child-modal')).toBeDefined();
      expect(screen.getByText(/Tạo Hồ Sơ Bé Đầu Tiên/i)).toBeDefined();
    });

    // 4. Fill child profile details
    fireEvent.change(screen.getByTestId('child-name-input'), {
      target: { value: 'Bé Bống' },
    });
    fireEvent.click(screen.getByTestId('avatar-option-🐼'));
    fireEvent.click(screen.getByTestId('pin-option-🍎'));
    fireEvent.click(screen.getByTestId('pin-option-⭐'));
    fireEvent.click(screen.getByTestId('pin-option-🦆'));
    fireEvent.click(screen.getByTestId('pin-option-🌈'));

    fireEvent.click(screen.getByTestId('submit-create-child-btn'));

    // 5. Onboarding completes: Modal closes, Header now displays Bé Bống!
    await waitFor(() => {
      expect(screen.queryByTestId('create-child-modal')).toBeNull();
      expect(screen.getByTestId('active-profile-badge').textContent).toContain('Bé Bống');
      expect(useAuthStore.getState().user?.children.length).toBe(1);
    });

    // 6. Profile switcher has "➕ Thêm Bé Mới" button for adding subsequent kids
    fireEvent.click(screen.getByTestId('active-profile-badge'));
    expect(screen.getByTestId('add-child-profile-btn')).toBeDefined();
  });
});
