import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';
import { useAuthStore } from '@/store/useAuthStore';
import { useProgressStore } from '@/store/useProgressStore';

describe('Auth Gate Enforcement (Mandatory Login)', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useProgressStore.getState().reset();
  });

  it('prevents unauthenticated guest from playing stage and prompts AuthModal', () => {
    render(<HomePage />);

    // Stage 1 node should be visible on map
    const stage1Node = screen.getByTestId('stage-node-stage_1');
    fireEvent.click(stage1Node);

    // Stage learning session should NOT be opened
    expect(screen.queryByTestId('stage-learning-session')).toBeNull();

    // AuthModal should be opened with parent guidance
    expect(screen.getByTestId('auth-modal')).toBeDefined();
    expect(screen.getByText(/Ba Mẹ hãy đăng nhập/i)).toBeDefined();
  });

  it('prevents unauthenticated guest from entering Arena, Avatar Room, and Parent Portal', () => {
    render(<HomePage />);

    // Click Arena tab
    fireEvent.click(screen.getByTestId('nav-arena'));
    expect(screen.queryByTestId('arena-lobby-screen')).toBeNull();
    expect(screen.getByTestId('auth-modal')).toBeDefined();

    // Close AuthModal
    fireEvent.click(screen.getByTestId('auth-modal-close-btn'));
    expect(screen.queryByTestId('auth-modal')).toBeNull();

    // Click Avatar Room tab
    fireEvent.click(screen.getByTestId('nav-avatar-room'));
    expect(screen.queryByTestId('avatar-room')).toBeNull();
    expect(screen.getByTestId('auth-modal')).toBeDefined();

    // Close AuthModal
    fireEvent.click(screen.getByTestId('auth-modal-close-btn'));

    // Click Parent Portal tab
    fireEvent.click(screen.getByTestId('nav-parent-portal'));
    expect(screen.queryByTestId('parental-gate-modal')).toBeNull();
    expect(screen.queryByTestId('parent-dashboard')).toBeNull();
    expect(screen.getByTestId('auth-modal')).toBeDefined();
  });

  it('ensures that unauthenticated guests see zero stars, zero coins, and no leftover progress', () => {
    // Simulate leftover stars in localStorage from an old session
    window.localStorage.setItem(
      'math-g1-progress-storage',
      JSON.stringify({
        state: {
          stageStars: { stage_1: 2 },
          totalCoins: 20,
          totalExp: 50,
        },
      })
    );

    render(<HomePage />);

    // Adventure map stars must be 0 for guest
    expect(screen.getByTestId('map-total-stars').textContent).toBe('0');
    expect(screen.getByTestId('map-total-coins').textContent).toBe('0');

    // Stage 1 must show 0 filled stars for guest
    const stage1Node = screen.getByTestId('stage-node-stage_1');
    expect(stage1Node.getAttribute('aria-label')).toContain('0 sao');

    // Header progress counters must be completely hidden
    expect(screen.queryByTestId('header-total-stars')).toBeNull();
    expect(screen.queryByTestId('header-total-coins')).toBeNull();
  });
});
