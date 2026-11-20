import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SubjectGradeSelector } from '@/components/navigation/SubjectGradeSelector';
import { useProgressStore } from '@/store/useProgressStore';

describe('SubjectGradeSelector Component', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('renders all 5 Grade pills (Lớp 1-5) and 3 Subject pills (Toán, Tiếng Việt, Tiếng Anh)', () => {
    render(<SubjectGradeSelector />);

    // Grades 1 to 5
    expect(screen.getByRole('button', { name: /Lớp 1/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lớp 2/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lớp 3/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lớp 4/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lớp 5/i })).toBeDefined();

    // Subjects
    expect(screen.getByRole('button', { name: /Toán/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiếng Việt/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Tiếng Anh/i })).toBeDefined();
  });

  it('ensures all buttons have at least 48x48px touch targets for small fingers', () => {
    render(<SubjectGradeSelector />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(8);

    for (const btn of buttons) {
      expect(btn.className).toMatch(/min-h-\[48px\]|min-w-\[48px\]|h-12|h-14|py-3/);
    }
  });

  it('switches grade when a grade pill is clicked and updates store', () => {
    render(<SubjectGradeSelector />);

    expect(useProgressStore.getState().selectedGrade).toBe(1);

    const grade3Btn = screen.getByRole('button', { name: /Lớp 3/i });
    fireEvent.click(grade3Btn);

    expect(useProgressStore.getState().selectedGrade).toBe(3);
  });

  it('switches subject when a subject pill is clicked and updates store', () => {
    render(<SubjectGradeSelector />);

    expect(useProgressStore.getState().selectedSubject).toBe('math');

    const vnBtn = screen.getByRole('button', { name: /Tiếng Việt/i });
    fireEvent.click(vnBtn);
    expect(useProgressStore.getState().selectedSubject).toBe('vietnamese');

    const enBtn = screen.getByRole('button', { name: /Tiếng Anh/i });
    fireEvent.click(enBtn);
    expect(useProgressStore.getState().selectedSubject).toBe('english');
  });
});
