import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import HomePage from '@/app/page';
import { useProgressStore } from '@/store/useProgressStore';
import { useAuthStore } from '@/store/useAuthStore';

describe('Multi-Grade & Multi-Subject Integration Flow with Endless Tower', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
    useAuthStore.getState().logout();
  });

  it('renders Grade selector, Subject selector, and Endless Tower banner on home page', () => {
    render(<HomePage />);

    // Subject & Grade Selector
    expect(screen.getByRole('button', { name: /Lớp 1/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lớp 5/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Toán Học/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiếng Việt/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiếng Anh/i })).toBeDefined();

    // Endless Tower Promo Banner
    expect(screen.getByText(/Tháp Vô Tận 1000 Ải/i)).toBeDefined();
    expect(screen.getByTestId('open-endless-tower-btn')).toBeDefined();
  });

  it('switches subject to Tiếng Việt and updates the adventure map stages', async () => {
    render(<HomePage />);

    // Initially Math G1
    expect(useProgressStore.getState().selectedSubject).toBe('math');

    // Click Tiếng Việt
    const vnBtn = screen.getByRole('button', { name: /Tiếng Việt/i });
    fireEvent.click(vnBtn);

    expect(useProgressStore.getState().selectedSubject).toBe('vietnamese');

    // The map should now reflect Vietnamese curriculum stages
    await waitFor(() => {
      expect(screen.getByText(/Vườn Hoa Chữ Cái & Dấu Thanh/i)).toBeDefined();
    });
  });

  it('switches grade to Lớp 3 and subject to Tiếng Anh', async () => {
    render(<HomePage />);

    // Click Grade 3
    const grade3Btn = screen.getByRole('button', { name: 'Chọn Lớp 3' });
    fireEvent.click(grade3Btn);
    expect(useProgressStore.getState().selectedGrade).toBe(3);

    // Click Tiếng Anh
    const enBtn = screen.getByRole('button', { name: /Tiếng Anh/i });
    fireEvent.click(enBtn);
    expect(useProgressStore.getState().selectedSubject).toBe('english');

    await waitFor(() => {
      expect(screen.getByText(/Hobbies and Abilities/i)).toBeDefined();
    });
  });

  it('opens and closes Endless Tower modal from the banner button', () => {
    render(<HomePage />);

    expect(screen.queryByTestId('tower-window')).toBeNull();

    // Click open tower
    const openBtn = screen.getByTestId('open-endless-tower-btn');
    fireEvent.click(openBtn);

    expect(screen.getByTestId('tower-window')).toBeDefined();
    expect(screen.getAllByText(/Tháp Vô Tận 1000 Ải/i).length).toBeGreaterThanOrEqual(2);

    // Click close
    const closeBtn = screen.getByTestId('tower-close-btn');
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('tower-window')).toBeNull();
  });
});
