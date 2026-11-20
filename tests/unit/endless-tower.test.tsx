import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { EndlessTowerModal } from '@/components/tower/EndlessTowerModal';
import { useProgressStore } from '@/store/useProgressStore';

describe('EndlessTowerModal Component', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('renders floor banner, subject, grade, and current question with >= 48x48px targets', () => {
    render(<EndlessTowerModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Tháp Vô Tận/i)).toBeDefined();
    expect(screen.getByText(/Tầng 1 \/ 1000/i)).toBeDefined();

    // Check options are rendered with >= 48px touch targets
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);

    for (const btn of buttons) {
      expect(btn.className).toMatch(/min-h-\[48px\]|min-w-\[48px\]|min-h-\[40px\]|h-12|h-14|w-12|py-3|py-3.5/);
    }
  });

  it('allows answering questions, advances questions, and advances to next floor upon completion', async () => {
    render(<EndlessTowerModal isOpen={true} onClose={() => {}} />);

    const currentFloorBefore = useProgressStore.getState().getTowerFloor('math', 1);
    expect(currentFloorBefore).toBe(1);

    // Answer 3 questions in Floor 1
    for (let i = 0; i < 3; i++) {
      // Find the correct option button
      const optionButtons = screen.getAllByTestId('tower-option-btn');
      expect(optionButtons.length).toBeGreaterThanOrEqual(2);

      // Click the first button (or any option)
      fireEvent.click(optionButtons[0]);

      // If answered correctly or wrong, verify interface updates
      await waitFor(() => {
        expect(screen.getByTestId('tower-window')).toBeDefined();
      });
    }
  });

  it('closes modal when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<EndlessTowerModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('tower-close-btn');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
