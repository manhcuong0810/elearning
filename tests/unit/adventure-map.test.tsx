import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StageNode } from '@/components/map/StageNode';
import { AdventureMap } from '@/components/map/AdventureMap';
import { useProgressStore } from '@/store/useProgressStore';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { Stage } from '@/types/curriculum';

describe('StageNode', () => {
  const normalStage: Stage = {
    id: 'stage_1',
    chapterId: 'chapter_1',
    name: 'Đếm Quả Táo Ngọt',
    order: 1,
    isBoss: false,
    description: 'Bé tập đếm các loại hoa quả thơm ngon',
    icon: 'apple',
    questions: [],
  };

  const bossStage: Stage = {
    id: 'boss_c1',
    chapterId: 'chapter_1',
    name: 'Quái Vật Kẹo Ngọt',
    order: 3,
    isBoss: true,
    bossMaxHp: 3,
    bossName: 'Quái Vật Kẹo Ngọt',
    questions: [],
  };

  it('renders an unlocked stage button with >= 48x48px touch target, stars, and fires onSelect', () => {
    const onSelectMock = vi.fn();
    render(
      <StageNode
        stage={normalStage}
        isUnlocked={true}
        stars={2}
        onSelect={onSelectMock}
      />
    );

    const btn = screen.getByTestId('stage-node-stage_1');
    expect(btn).toBeDefined();
    expect(btn.className).toContain('min-w-[48px]');
    expect(btn.className).toContain('min-h-[48px]');
    expect(screen.getByText('Đếm Quả Táo Ngọt')).toBeDefined();

    // Check earned stars count
    const filledStars = screen.getAllByTestId('stage-star-filled');
    expect(filledStars).toHaveLength(2);

    fireEvent.click(btn);
    expect(onSelectMock).toHaveBeenCalledWith(normalStage);
  });

  it('renders a locked stage node that cannot be selected when clicked', () => {
    const onSelectMock = vi.fn();
    render(
      <StageNode
        stage={normalStage}
        isUnlocked={false}
        stars={0}
        onSelect={onSelectMock}
      />
    );

    const btn = screen.getByTestId('stage-node-stage_1');
    expect(btn).toHaveProperty('disabled', true);
    expect(screen.getByTestId('stage-lock-icon')).toBeDefined();

    fireEvent.click(btn);
    expect(onSelectMock).not.toHaveBeenCalled();
  });

  it('renders special boss badge and crown/dragon indicator when stage.isBoss is true', () => {
    const onSelectMock = vi.fn();
    render(
      <StageNode
        stage={bossStage}
        isUnlocked={true}
        stars={3}
        onSelect={onSelectMock}
      />
    );

    expect(screen.getByTestId('stage-boss-badge')).toBeDefined();
    expect(screen.getByText('Quái Vật Kẹo Ngọt')).toBeDefined();
  });
});

describe('AdventureMap', () => {
  const curriculum = loadGrade1MathData();

  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('renders chapters, owl mascot guide, SVG decorations, and all curriculum stages', () => {
    const onSelectStageMock = vi.fn();
    render(
      <AdventureMap
        curriculum={curriculum}
        onSelectStage={onSelectStageMock}
      />
    );

    expect(screen.getByText(/Thung lũng Số đếm/i)).toBeDefined();
    expect(screen.getByText(/Rừng Phép cộng/i)).toBeDefined();
    expect(screen.getByTestId('adventure-map-mascot')).toBeDefined();

    // Verify all 5 stages from seed curriculum are rendered
    expect(screen.getByTestId('stage-node-stage_1')).toBeDefined();
    expect(screen.getByTestId('stage-node-stage_2')).toBeDefined();
    expect(screen.getByTestId('stage-node-boss_c1')).toBeDefined();
    expect(screen.getByTestId('stage-node-stage_3')).toBeDefined();
    expect(screen.getByTestId('stage-node-boss_c2')).toBeDefined();
  });

  it('allows selecting an unlocked stage and blocks clicking locked stages', () => {
    const onSelectStageMock = vi.fn();
    render(
      <AdventureMap
        curriculum={curriculum}
        onSelectStage={onSelectStageMock}
      />
    );

    // stage_2 is initially locked
    const stage2Btn = screen.getByTestId('stage-node-stage_2');
    fireEvent.click(stage2Btn);
    expect(onSelectStageMock).not.toHaveBeenCalled();

    // stage_1 is unlocked initially
    const stage1Btn = screen.getByTestId('stage-node-stage_1');
    fireEvent.click(stage1Btn);
    expect(onSelectStageMock).toHaveBeenCalledTimes(1);
    expect(onSelectStageMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'stage_1', name: 'Đếm Quả Táo Ngọt' })
    );
  });

  it('reflects newly unlocked stages and star ratings from useProgressStore', () => {
    useProgressStore.getState().completeStage('stage_1', {
      stars: 3,
      earnedCoins: 15,
      earnedExp: 30,
    });

    const onSelectStageMock = vi.fn();
    render(
      <AdventureMap
        curriculum={curriculum}
        onSelectStage={onSelectStageMock}
      />
    );

    // Now stage_2 should be unlocked and clickable
    const stage2Btn = screen.getByTestId('stage-node-stage_2');
    expect(stage2Btn).toHaveProperty('disabled', false);

    fireEvent.click(stage2Btn);
    expect(onSelectStageMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'stage_2', name: 'Nông Trại Vui Vẻ' })
    );
  });
});
