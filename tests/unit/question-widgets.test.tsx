import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { QuestionPresenter } from '@/components/learning/QuestionPresenter';
import { AudioPromptButton } from '@/components/learning/AudioPromptButton';
import { CountingQuestionWidget } from '@/components/learning/CountingQuestionWidget';
import { DragDropMathWidget } from '@/components/learning/DragDropMathWidget';
import { Question } from '@/types/curriculum';
import { AudioManager, audioManager } from '@/lib/audio-manager';

describe('AudioPromptButton', () => {
  beforeEach(() => {
    if (typeof HTMLMediaElement !== 'undefined') {
      HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
      HTMLMediaElement.prototype.pause = vi.fn();
    }
  });

  it('enforces at least 48x48px touch target and triggers playVoice via AudioManager', () => {
    const customManager = new AudioManager({ debounceMs: 0 });
    const playVoiceSpy = vi.spyOn(customManager, 'playVoice');

    render(
      <AudioPromptButton
        promptAudioUrl="/audio/math/count_apples.mp3"
        audioManager={customManager}
      />
    );

    const btn = screen.getByTestId('audio-prompt-button');
    expect(btn).toBeDefined();
    expect(btn.className).toContain('min-w-[48px]');
    expect(btn.className).toContain('min-h-[48px]');

    fireEvent.click(btn);
    expect(playVoiceSpy).toHaveBeenCalledWith('/audio/math/count_apples.mp3');
  });

  it('uses default audioManager singleton when no custom manager is passed', () => {
    const playVoiceSpy = vi.spyOn(audioManager, 'playVoice');

    render(<AudioPromptButton promptAudioUrl="/audio/test-default.mp3" />);

    const btn = screen.getByTestId('audio-prompt-button');
    fireEvent.click(btn);

    expect(playVoiceSpy).toHaveBeenCalledWith('/audio/test-default.mp3');
    playVoiceSpy.mockRestore();
  });
});

describe('CountingQuestionWidget', () => {
  const countingQuestion: Question = {
    id: 'q_count_1',
    type: 'COUNTING',
    promptText: 'Có bao nhiêu quả táo đỏ trong tranh?',
    promptAudioUrl: '/audio/math/count_apples.mp3',
    interactivePayload: {
      targetCount: 3,
      itemType: 'apple',
      sourcePool: 5,
    },
    options: [
      { id: 'opt1', text: '2', isCorrect: false },
      { id: 'opt2', text: '3', isCorrect: true },
      { id: 'opt3', text: '4', isCorrect: false },
    ],
  };

  it('renders exact number of visual SVG items based on targetCount and allows interactive counting and option selection', () => {
    const onAnswerMock = vi.fn();
    render(
      <CountingQuestionWidget
        question={countingQuestion}
        onAnswer={onAnswerMock}
      />
    );

    const items = screen.getAllByTestId('counting-visual-item');
    expect(items).toHaveLength(3);

    // Clicking an item highlights/counts it interactively
    fireEvent.click(items[0]);
    expect(items[0].getAttribute('data-counted')).toBe('true');

    // Selecting the correct option triggers onAnswer(true)
    const option3 = screen.getByText('3');
    fireEvent.click(option3);
    expect(onAnswerMock).toHaveBeenCalledWith(true);
  });
});

describe('DragDropMathWidget', () => {
  const dragDropQuestion: Question = {
    id: 'q_drag_1',
    type: 'DRAG_DROP',
    promptText: 'Bé hãy kéo 4 chú vịt vàng vào ao nước nhé!',
    promptAudioUrl: '/audio/math/drag_ducks.mp3',
    interactivePayload: {
      targetCount: 4,
      itemType: 'duck',
      sourcePool: 6,
    },
    options: [{ id: 'opt1', text: '4', isCorrect: true }],
  };

  it('supports mouse drag-and-drop into valid drop zone and verifies targetCount', () => {
    const onAnswerMock = vi.fn();
    render(
      <DragDropMathWidget question={dragDropQuestion} onAnswer={onAnswerMock} />
    );

    const sourceItems = screen.getAllByTestId('draggable-source-item');
    expect(sourceItems).toHaveLength(6);

    const dropZone = screen.getByTestId('drop-zone-target');

    // Drag 4 items into drop zone using HTML5 Drag & Drop events
    for (let i = 0; i < 4; i++) {
      const currentSourceItems = screen.getAllByTestId('draggable-source-item');
      fireEvent.dragStart(currentSourceItems[0], {
        dataTransfer: {
          setData: vi.fn(),
          getData: () => currentSourceItems[0].getAttribute('data-item-id') || '',
        },
      });
      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          getData: () => currentSourceItems[0].getAttribute('data-item-id') || '',
        },
      });
    }

    expect(screen.getAllByTestId('dropped-target-item')).toHaveLength(4);
    expect(screen.getAllByTestId('draggable-source-item')).toHaveLength(2);

    const submitBtn = screen.getByTestId('drag-drop-submit-button');
    fireEvent.click(submitBtn);

    expect(onAnswerMock).toHaveBeenCalledWith(true);
  });

  it('supports touch / tap-to-move interaction for iPad/Tablet accessibility and moving back from drop zone', () => {
    const onAnswerMock = vi.fn();
    render(
      <DragDropMathWidget question={dragDropQuestion} onAnswer={onAnswerMock} />
    );

    // Tap 4 items to move to drop zone
    for (let i = 0; i < 4; i++) {
      const currentSourceItems = screen.getAllByTestId('draggable-source-item');
      fireEvent.click(currentSourceItems[0]);
    }

    expect(screen.getAllByTestId('dropped-target-item')).toHaveLength(4);

    // Tap 1 dropped item to return it back to source pool
    const droppedItems = screen.getAllByTestId('dropped-target-item');
    fireEvent.click(droppedItems[0]);
    expect(screen.getAllByTestId('dropped-target-item')).toHaveLength(3);
    expect(screen.getAllByTestId('draggable-source-item')).toHaveLength(3);

    // Submit with 3 items (wrong answer when targetCount is 4)
    const submitBtn = screen.getByTestId('drag-drop-submit-button');
    fireEvent.click(submitBtn);
    expect(onAnswerMock).toHaveBeenCalledWith(false);
  });

  it('smoothly returns item to source pool when dropped outside valid drop zone without losing it', () => {
    const onAnswerMock = vi.fn();
    render(
      <DragDropMathWidget question={dragDropQuestion} onAnswer={onAnswerMock} />
    );

    const sourceItems = screen.getAllByTestId('draggable-source-item');
    const firstItem = sourceItems[0];
    const firstItemId = firstItem.getAttribute('data-item-id');

    // Start dragging item and drop outside valid drop zone
    fireEvent.dragStart(firstItem);
    const outsideArea = screen.getByTestId('drag-drop-outside-boundary');
    fireEvent.drop(outsideArea);
    fireEvent.dragEnd(firstItem);

    // All 6 items remain safely in source pool and returned-to-origin indicator is recorded
    const afterItems = screen.getAllByTestId('draggable-source-item');
    expect(afterItems).toHaveLength(6);
    expect(
      afterItems.some((el) => el.getAttribute('data-item-id') === firstItemId)
    ).toBe(true);
    expect(screen.queryAllByTestId('dropped-target-item')).toHaveLength(0);
    expect(screen.getByTestId('drag-drop-widget').getAttribute('data-last-drop-status')).toBe(
      'returned-to-origin'
    );
  });
});

describe('QuestionPresenter', () => {
  const sampleQuestion: Question = {
    id: 'q1',
    type: 'MULTIPLE_CHOICE',
    promptText: 'Có bao nhiêu quả táo trong tranh?',
    promptAudioUrl: '/audio/test.mp3',
    options: [
      { id: 'opt1', text: '2', isCorrect: false },
      { id: 'opt2', text: '3', isCorrect: true },
    ],
    rewardCoins: 5,
    rewardExp: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders prompt text, audio button, and handles correct answer selection', () => {
    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={sampleQuestion} onAnswer={onAnswerMock} />);

    expect(screen.getByText('Có bao nhiêu quả táo trong tranh?')).toBeDefined();
    expect(screen.getByTestId('audio-prompt-button')).toBeDefined();

    const correctBtn = screen.getByText('3');
    fireEvent.click(correctBtn);

    expect(onAnswerMock).toHaveBeenCalledWith(true, sampleQuestion);
    // Encouraging feedback banner appears
    expect(screen.getByTestId('question-feedback-banner')).toBeDefined();
    expect(screen.getByTestId('question-feedback-banner').textContent).toMatch(/Giỏi quá|Tuyệt vời|Chính xác/i);
  });

  it('shows gentle encouraging hint on wrong answer and allows retry or reports wrong answer', () => {
    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={sampleQuestion} onAnswer={onAnswerMock} />);

    const wrongBtn = screen.getByText('2');
    fireEvent.click(wrongBtn);

    expect(onAnswerMock).toHaveBeenCalledWith(false, sampleQuestion);
    const feedback = screen.getByTestId('question-feedback-banner');
    expect(feedback.textContent).toMatch(/Gần đúng rồi|Thử lại|Cố lên/i);
  });

  it('guards against duplicate rapid submissions when child spam-clicks an answer button', () => {
    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={sampleQuestion} onAnswer={onAnswerMock} />);

    const correctBtn = screen.getByText('3');
    // Rapid triple click
    fireEvent.click(correctBtn);
    fireEvent.click(correctBtn);
    fireEvent.click(correctBtn);

    expect(onAnswerMock).toHaveBeenCalledTimes(1);
  });

  it('renders COUNTING question widget and forwards answer callback', () => {
    const countingQ: Question = {
      id: 'q2',
      type: 'COUNTING',
      promptText: 'Đếm số ngôi sao lấp lánh:',
      promptAudioUrl: '/audio/stars.mp3',
      interactivePayload: {
        targetCount: 4,
        itemType: 'star',
      },
      options: [
        { id: 'o1', text: '3', isCorrect: false },
        { id: 'o2', text: '4', isCorrect: true },
      ],
    };

    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={countingQ} onAnswer={onAnswerMock} />);

    expect(screen.getAllByTestId('counting-visual-item')).toHaveLength(4);
    fireEvent.click(screen.getByText('4'));
    expect(onAnswerMock).toHaveBeenCalledWith(true, countingQ);
  });

  it('renders DRAG_DROP question widget and forwards answer callback', () => {
    const dragQ: Question = {
      id: 'q3',
      type: 'DRAG_DROP',
      promptText: 'Bé kéo 2 quả táo vào giỏ nhé!',
      promptAudioUrl: '/audio/drag_apples.mp3',
      interactivePayload: {
        targetCount: 2,
        itemType: 'apple',
        sourcePool: 4,
      },
      options: [{ id: 'o1', text: '2', isCorrect: true }],
    };

    const onAnswerMock = vi.fn();
    render(<QuestionPresenter question={dragQ} onAnswer={onAnswerMock} />);

    // Tap 2 apples to move them into the basket
    const items = screen.getAllByTestId('draggable-source-item');
    fireEvent.click(items[0]);
    fireEvent.click(screen.getAllByTestId('draggable-source-item')[0]);

    fireEvent.click(screen.getByTestId('drag-drop-submit-button'));
    expect(onAnswerMock).toHaveBeenCalledWith(true, dragQ);
  });
});
