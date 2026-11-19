import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AvatarRoom } from '@/components/avatar/AvatarRoom';
import { useProgressStore } from '@/store/useProgressStore';
import { defaultAudioManager } from '@/lib/audio-manager';

describe('AvatarRoom', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
    vi.restoreAllMocks();
  });

  it('allows child to purchase item if they have enough coins', () => {
    const playSfxSpy = vi
      .spyOn(defaultAudioManager, 'playSfx')
      .mockImplementation(() => {});
    useProgressStore.setState({
      totalCoins: 50,
      totalExp: 120,
      inventory: [],
      equippedItems: [],
    });
    render(<AvatarRoom />);

    expect(screen.getByTestId('avatar-room-coins')).toHaveTextContent('50');
    expect(screen.getByTestId('avatar-room-exp')).toHaveTextContent('120');

    const buyBtn = screen.getByTestId('buy-item-hat_knight');
    expect(buyBtn.className).toContain('min-w-[48px]');
    expect(buyBtn.className).toContain('min-h-[48px]');

    fireEvent.click(buyBtn);

    expect(useProgressStore.getState().inventory).toContain('hat_knight');
    expect(useProgressStore.getState().totalCoins).toBeLessThan(50);
    expect(playSfxSpy).toHaveBeenCalledWith('cheer');
  });

  it('prevents purchase when coins are insufficient and shows encouraging message', () => {
    const playSfxSpy = vi
      .spyOn(defaultAudioManager, 'playSfx')
      .mockImplementation(() => {});
    useProgressStore.setState({
      totalCoins: 5,
      inventory: [],
      equippedItems: [],
    });
    render(<AvatarRoom />);

    const buyBtn = screen.getByTestId('buy-item-hat_knight');
    fireEvent.click(buyBtn);

    expect(useProgressStore.getState().inventory).not.toContain('hat_knight');
    expect(useProgressStore.getState().totalCoins).toBe(5);
    expect(
      screen.getByText(
        /Bé hãy đi thêm ải trên bản đồ để tích thêm Xu vàng nhé!/i
      )
    ).toBeInTheDocument();
    expect(playSfxSpy).toHaveBeenCalledWith('pop');
  });

  it('allows equipping and unequipping owned items and reflects them visually on avatar/mascot', () => {
    vi.spyOn(defaultAudioManager, 'playSfx').mockImplementation(() => {});
    useProgressStore.setState({
      totalCoins: 100,
      inventory: ['hat_knight', 'food_apple_gold'],
      equippedItems: [],
    });
    render(<AvatarRoom />);

    const equipHatBtn = screen.getByTestId('equip-item-hat_knight');
    expect(equipHatBtn.className).toContain('min-w-[48px]');
    expect(equipHatBtn.className).toContain('min-h-[48px]');

    // Equip hat_knight
    fireEvent.click(equipHatBtn);
    expect(useProgressStore.getState().equippedItems).toContain('hat_knight');
    expect(screen.getByTestId('equipped-visual-hat_knight')).toBeInTheDocument();

    // Equip food_apple_gold for Cú Mèo
    const equipFoodBtn = screen.getByTestId('equip-item-food_apple_gold');
    fireEvent.click(equipFoodBtn);
    expect(useProgressStore.getState().equippedItems).toContain(
      'food_apple_gold'
    );
    expect(
      screen.getByTestId('equipped-visual-food_apple_gold')
    ).toBeInTheDocument();

    // Unequip hat_knight by clicking equip button again
    fireEvent.click(equipHatBtn);
    expect(useProgressStore.getState().equippedItems).not.toContain(
      'hat_knight'
    );
  });
});
