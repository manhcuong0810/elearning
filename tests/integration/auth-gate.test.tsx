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
});
