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

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('shows Guest profile when unauthenticated, prompts to log in, and supports dynamic Google Sign-In', async () => {
    render(<HomePage />);

    // 1. Unauthenticated state: Shows Bé Học Thử (Khách), not default family kids!
    const profileBadge = screen.getByTestId('active-profile-badge');
    expect(profileBadge.textContent).toContain('Bé Học Thử');
    expect(profileBadge.textContent).toContain('Khách');

    // 2. Clicking profile badge when unauthenticated prompts parent to login
    fireEvent.click(profileBadge);
    expect(screen.getByTestId('auth-modal')).toBeDefined();

    // 3. Click Google Sign-In button -> opens interactive Google account input
    fireEvent.click(screen.getByTestId('google-sign-in-btn'));
    expect(screen.getByTestId('google-email-input')).toBeDefined();

    // 4. Enter parent's real Google email and name
    fireEvent.change(screen.getByTestId('google-email-input'), {
      target: { value: 'nguyen.van.a@gmail.com' },
    });
    fireEvent.change(screen.getByTestId('google-name-input'), {
      target: { value: 'Ba Văn A' },
    });
    fireEvent.click(screen.getByTestId('confirm-google-sign-in-btn'));

    // 5. Successfully authenticated with that exact user data
    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).toBeNull();
      expect(screen.getByTestId('parent-user-menu-btn')).toBeDefined();
      expect(useAuthStore.getState().user?.email).toBe('nguyen.van.a@gmail.com');
      expect(useAuthStore.getState().user?.fullName).toBe('Ba Văn A');
    });

    // 6. Onboarding modal automatically appears for new parent with 0 children
    await waitFor(() => {
      expect(screen.getByTestId('create-child-modal')).toBeDefined();
    });

    // Create first child
    fireEvent.change(screen.getByTestId('child-name-input'), {
      target: { value: 'Bé Tít' },
    });
    fireEvent.click(screen.getByTestId('pin-option-🍎'));
    fireEvent.click(screen.getByTestId('pin-option-⭐'));
    fireEvent.click(screen.getByTestId('pin-option-🦆'));
    fireEvent.click(screen.getByTestId('pin-option-🌈'));
    fireEvent.click(screen.getByTestId('submit-create-child-btn'));

    // Child profile in header now switches to created child
    await waitFor(() => {
      expect(screen.getByTestId('active-profile-badge').textContent).toContain('Bé Tít');
    });

    // 7. Logout and confirm return to Guest profile
    fireEvent.click(screen.getByTestId('parent-user-menu-btn'));
    fireEvent.click(screen.getByTestId('auth-logout-btn'));

    expect(screen.getByTestId('active-profile-badge').textContent).toContain('Bé Học Thử');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
