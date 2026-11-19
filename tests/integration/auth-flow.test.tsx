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

  it('allows parent to open auth modal, log in via Google, and log out', async () => {
    render(<HomePage />);

    // Header has login button when unauthenticated
    const loginBtn = screen.getByTestId('auth-open-modal-btn');
    expect(loginBtn).toBeDefined();

    // Click to open AuthModal
    fireEvent.click(loginBtn);
    expect(screen.getByTestId('auth-modal')).toBeDefined();

    // Log in via Google button
    fireEvent.click(screen.getByTestId('google-sign-in-btn'));

    // Modal closes and header now shows parent user profile menu
    await waitFor(() => {
      expect(screen.queryByTestId('auth-modal')).toBeNull();
      expect(screen.getByTestId('parent-user-menu-btn')).toBeDefined();
    });

    // Click parent user menu and logout
    fireEvent.click(screen.getByTestId('parent-user-menu-btn'));
    const logoutBtn = screen.getByTestId('auth-logout-btn');
    fireEvent.click(logoutBtn);

    // State returns to unauthenticated
    expect(screen.getByTestId('auth-open-modal-btn')).toBeDefined();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
