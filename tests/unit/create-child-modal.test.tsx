import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateChildModal } from '@/components/profile/CreateChildModal';
import { defaultAudioManager } from '@/lib/audio-manager';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
  },
}));

describe('CreateChildModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders child creation modal with inputs, avatar picker, and PIN icon slots', () => {
    render(
      <CreateChildModal
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        isFirstChild={true}
      />
    );

    expect(screen.getByTestId('create-child-modal')).toBeDefined();
    expect(screen.getByTestId('child-name-input')).toBeDefined();
    expect(screen.getByTestId('avatar-picker-grid')).toBeDefined();
    expect(screen.getByTestId('pin-slots-container')).toBeDefined();
    expect(screen.getByTestId('pin-palette-grid')).toBeDefined();
  });

  it('validates child name and requires 4 PIN icons before submission', async () => {
    render(
      <CreateChildModal
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // Click submit when name is empty
    fireEvent.click(screen.getByTestId('submit-create-child-btn'));

    await waitFor(() => {
      expect(screen.getByText(/Vui lòng nhập tên của bé/i)).toBeDefined();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });

    // Enter name
    fireEvent.change(screen.getByTestId('child-name-input'), {
      target: { value: 'Bé Bống' },
    });

    // Click submit when PIN is empty
    fireEvent.click(screen.getByTestId('submit-create-child-btn'));

    await waitFor(() => {
      expect(screen.getByText(/Vui lòng chọn đủ 4 biểu tượng/i)).toBeDefined();
      expect(mockOnCreate).not.toHaveBeenCalled();
    });
  });

  it('allows selecting avatar and 4 PIN icons and creates child profile', async () => {
    render(
      <CreateChildModal
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );

    // Enter name
    fireEvent.change(screen.getByTestId('child-name-input'), {
      target: { value: 'Bé Bống' },
    });

    // Select avatar (e.g. 🐼)
    fireEvent.click(screen.getByTestId('avatar-option-🐼'));

    // Select 4 PIN icons from palette
    fireEvent.click(screen.getByTestId('pin-option-🍎'));
    fireEvent.click(screen.getByTestId('pin-option-⭐'));
    fireEvent.click(screen.getByTestId('pin-option-🦆'));
    fireEvent.click(screen.getByTestId('pin-option-🌈'));

    // Submit
    fireEvent.click(screen.getByTestId('submit-create-child-btn'));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bé Bống',
          gradeLabel: 'Lớp 1',
          avatarEmoji: '🐼',
          pinIcons: ['🍎', '⭐', '🦆', '🌈'],
        })
      );
      expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('cheer');
    });
  });
});
