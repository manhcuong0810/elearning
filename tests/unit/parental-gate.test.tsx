import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParentalGateModal } from '@/components/parent/ParentalGateModal';
import { defaultAudioManager } from '@/lib/audio-manager';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
    isMuted: vi.fn().mockReturnValue(false),
  },
}));

describe('ParentalGateModal (Random Challenges)', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ParentalGateModal
        isOpen={false}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByTestId('parental-gate-modal')).toBeNull();
  });

  it('generates a dynamic adult math challenge and allows answering correctly', () => {
    const { unmount } = render(
      <ParentalGateModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    const modal = screen.getByTestId('parental-gate-modal');
    expect(modal).toBeDefined();

    // Verify challenge container exists and contains math symbols (+, ×, −)
    const challengeBox = screen.getByTestId('parental-gate-challenge-text');
    expect(challengeBox).toBeDefined();
    const challengeText = challengeBox.textContent || '';
    expect(challengeText).toMatch(/(\+|-|−|×|x|\*)/i);
    expect(challengeText).toContain('= ?');

    // Parse the arithmetic challenge to get the correct answer
    // format is either "a × b = ?" or "a + b = ?" or "a − b = ?"
    const match = /^(\d+)\s*([+×x*\-−])\s*(\d+)\s*=\s*\?$/.exec(challengeText.trim());
    expect(match).not.toBeNull();
    const a = Number(match![1]);
    const op = match![2];
    const b = Number(match![3]);
    let expected = 0;
    if (op === '+' ) expected = a + b;
    else if (op === '-' || op === '−') expected = a - b;
    else expected = a * b;

    const input = screen.getByTestId('parental-gate-input');
    const submitBtn = screen.getByTestId('parental-gate-submit-btn');

    // Wrong answer first
    fireEvent.change(input, { target: { value: `${expected + 99}` } });
    fireEvent.click(submitBtn);

    expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('wrong');
    expect(screen.getByTestId('parental-gate-error')).toBeDefined();
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Correct answer
    fireEvent.change(input, { target: { value: `${expected}` } });
    fireEvent.click(submitBtn);

    expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('correct');
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);

    unmount();
  });

  it('supports explicit challengeText and expectedAnswer props when passed (backward compatibility)', () => {
    render(
      <ParentalGateModal
        isOpen={true}
        challengeText="12 × 4 = ?"
        expectedAnswer={48}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('12 × 4 = ?')).toBeDefined();
    const input = screen.getByTestId('parental-gate-input');
    const submitBtn = screen.getByTestId('parental-gate-submit-btn');

    fireEvent.change(input, { target: { value: '48' } });
    fireEvent.click(submitBtn);

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});
