import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/useAuthStore';
import { defaultAudioManager } from '@/lib/audio-manager';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
  },
}));

describe('AuthModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it('renders Google sign in button and email inputs when open', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByTestId('auth-modal')).toBeDefined();
    expect(screen.getByTestId('google-sign-in-btn')).toBeDefined();
    expect(screen.getByTestId('auth-email-input')).toBeDefined();
    expect(screen.getByTestId('auth-password-input')).toBeDefined();
  });

  it('calls loginWithGoogle and onSuccess when Google button is clicked', async () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByTestId('google-sign-in-btn'));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('cheer');
    });
  });

  it('shows error message when email or password is invalid', async () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByTestId('auth-email-input'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByTestId('auth-password-input'), {
      target: { value: '12' },
    });
    fireEvent.click(screen.getByTestId('auth-submit-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-error-message')).toBeDefined();
    });
  });

  it('closes modal when close button is clicked', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByTestId('auth-modal-close-btn'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
