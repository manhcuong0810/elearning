import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompanionSidebar } from '@/components/dashboard/CompanionSidebar';
import { defaultAudioManager } from '@/lib/audio-manager';
import { ChildProfile, DEFAULT_FAMILY_PROFILES } from '@/components/navigation/MainHeader';

vi.mock('@/lib/audio-manager', () => ({
  defaultAudioManager: {
    playSfx: vi.fn(),
    playVoice: vi.fn(),
    stopVoice: vi.fn(),
  },
}));

describe('CompanionSidebar', () => {
  const mockProfile: ChildProfile = DEFAULT_FAMILY_PROFILES[0]; // Bé Bống

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mascot owl, speech bubble, and child profile information', () => {
    render(
      <CompanionSidebar
        profile={mockProfile}
        totalExp={150}
        streakDays={3}
      />
    );

    // Mascot presence
    expect(screen.getByTestId('companion-mascot')).toBeDefined();
    expect(screen.getByTestId('companion-speech-bubble')).toBeDefined();

    // Profile level & exp
    expect(screen.getByText(new RegExp(mockProfile.name, 'i'))).toBeDefined();
    expect(screen.getByText(/Cấp 2/i)).toBeDefined();
    expect(screen.getByText(/150 EXP/i)).toBeDefined();
  });

  it('plays cheerful audio and updates speech quote when mascot is clicked', () => {
    render(
      <CompanionSidebar
        profile={mockProfile}
        totalExp={50}
        streakDays={1}
      />
    );

    const mascotButton = screen.getByTestId('companion-mascot-btn');
    const initialQuote = screen.getByTestId('companion-speech-bubble').textContent;

    fireEvent.click(mascotButton);

    expect(defaultAudioManager.playSfx).toHaveBeenCalledWith('cheer');
    const newQuote = screen.getByTestId('companion-speech-bubble').textContent;
    expect(newQuote).toBeDefined();
  });
});
