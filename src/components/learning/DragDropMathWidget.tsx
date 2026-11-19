'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, DragDropPayload } from '@/types/curriculum';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';
import { renderItemVector } from './CountingQuestionWidget';

export interface DragDropMathWidgetProps {
  question: Question;
  payload?: DragDropPayload;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
  audioManager?: AudioManager;
}

export const DragDropMathWidget: React.FC<DragDropMathWidgetProps> = ({
  question,
  payload,
  onAnswer,
  disabled = false,
  audioManager = defaultAudioManager,
}) => {
  const activePayload = payload ?? question.interactivePayload ?? {};
  const targetCount = activePayload.targetCount ?? 3;
  const sourcePoolCount = activePayload.sourcePool ?? Math.max(targetCount + 2, 5);
  const itemType = activePayload.itemType ?? 'apple';

  const allItemIds = Array.from(
    { length: sourcePoolCount },
    (_, i) => `${question.id}-drag-item-${i + 1}`
  );

  const [droppedIds, setDroppedIds] = useState<string[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDragOverTarget, setIsDragOverTarget] = useState(false);
  const [returnedItemId, setReturnedItemId] = useState<string | null>(null);
  const [lastDropStatus, setLastDropStatus] = useState<'idle' | 'dropped-in-target' | 'returned-to-origin'>('idle');
  const dropHandledInTargetRef = useRef(false);

  useEffect(() => {
    setDroppedIds([]);
    setActiveDragId(null);
    setIsDragOverTarget(false);
    setReturnedItemId(null);
    setLastDropStatus('idle');
  }, [question.id]);

  const sourceIds = allItemIds.filter((id) => !droppedIds.includes(id));

  const moveItemToTarget = (itemId: string) => {
    if (disabled || !itemId) return;
    setDroppedIds((prev) => {
      if (prev.includes(itemId)) return prev;
      const next = [...prev, itemId];
      if (next.length === targetCount) {
        onAnswer(true);
      }
      return next;
    });
    setReturnedItemId(null);
    setLastDropStatus('dropped-in-target');
    audioManager.playSfx('pop');
  };

  const returnItemToSource = (itemId: string) => {
    if (disabled || !itemId) return;
    setDroppedIds((prev) => {
      const next = prev.filter((id) => id !== itemId);
      if (prev.length === targetCount && next.length !== targetCount) {
        onAnswer(false);
      }
      return next;
    });
    setReturnedItemId(itemId);
    setLastDropStatus('returned-to-origin');
    audioManager.playSfx('click');
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, itemId: string) => {
    if (disabled) return;
    dropHandledInTargetRef.current = false;
    setActiveDragId(itemId);
    if (e.dataTransfer && typeof e.dataTransfer.setData === 'function') {
      e.dataTransfer.setData('text/plain', itemId);
    }
  };

  const handleDragOverTarget = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOverTarget(true);
    }
  };

  const handleDragLeaveTarget = () => {
    setIsDragOverTarget(false);
  };

  const handleDropInTarget = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverTarget(false);
    if (disabled) return;

    dropHandledInTargetRef.current = true;
    const transferredId =
      e.dataTransfer && typeof e.dataTransfer.getData === 'function'
        ? e.dataTransfer.getData('text/plain')
        : '';
    const itemIdToMove = transferredId || activeDragId;

    if (itemIdToMove) {
      moveItemToTarget(itemIdToMove);
    }
    setActiveDragId(null);
  };

  const handleDropOutside = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverTarget(false);
    if (activeDragId) {
      // Smoothly return item to origin pool without losing it
      setDroppedIds((prev) => prev.filter((id) => id !== activeDragId));
      setReturnedItemId(activeDragId);
      setLastDropStatus('returned-to-origin');
      dropHandledInTargetRef.current = false;
    }
    setActiveDragId(null);
  };

  const handleDragEnd = (itemId: string) => {
    setIsDragOverTarget(false);
    if (!dropHandledInTargetRef.current) {
      // Item was released outside valid drop zone -> smoothly snap back to origin
      setReturnedItemId(itemId);
      setLastDropStatus('returned-to-origin');
    }
    setActiveDragId(null);
  };

  const handleSubmit = () => {
    if (disabled) return;
    const isCorrect = droppedIds.length === targetCount;
    onAnswer(isCorrect);
  };

  return (
    <div
      data-testid="drag-drop-widget"
      data-last-drop-status={lastDropStatus}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOutside}
      className="flex flex-col items-center gap-6 w-full select-none"
    >
      {/* Out-of-bounds area & Source Pool */}
      <div
        data-testid="drag-drop-outside-boundary"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOutside}
        className="w-full bg-sky-50/90 border-2 border-sky-200 rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-sky-900">
            Kho đồ vật (Chạm hoặc kéo vào giỏ bên dưới):
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-200 text-sky-900">
            Còn lại: {sourceIds.length}
          </span>
        </div>

        <div
          data-testid="drag-drop-source-pool"
          className="flex flex-wrap items-center justify-center gap-3 min-h-[96px]"
        >
          {sourceIds.map((itemId) => {
            const isReturning = returnedItemId === itemId;
            return (
              <button
                key={itemId}
                type="button"
                draggable={!disabled}
                data-testid="draggable-source-item"
                data-item-id={itemId}
                data-returned={isReturning ? 'true' : 'false'}
                onDragStart={(e) => handleDragStart(e, itemId)}
                onDragEnd={() => handleDragEnd(itemId)}
                onClick={() => moveItemToTarget(itemId)}
                className={`p-3 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 shadow-sm border-2 border-sky-200 transition-all duration-300 cursor-grab active:cursor-grabbing min-w-[64px] min-h-[64px] flex items-center justify-center ${
                  isReturning ? 'animate-bounce ring-2 ring-amber-400' : ''
                }`}
                aria-label={`Kéo hoặc chạm để chọn vật phẩm`}
              >
                {renderItemVector(itemType)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Valid Drop Zone Target */}
      <div
        data-testid="drop-zone-target"
        onDragOver={handleDragOverTarget}
        onDragLeave={handleDragLeaveTarget}
        onDrop={handleDropInTarget}
        className={`w-full min-h-[150px] rounded-3xl border-4 border-dashed p-5 transition-all duration-200 flex flex-col items-center justify-between ${
          isDragOverTarget
            ? 'border-kid-green bg-emerald-50/90 scale-[1.01]'
            : 'border-amber-400 bg-amber-50/70'
        }`}
      >
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-base font-extrabold text-amber-900">
            Giỏ của bé (Chạm vào vật trong giỏ để cất lại):
          </span>
          <span
            data-testid="drop-zone-counter"
            className="px-4 py-1 rounded-full bg-kid-yellow text-amber-950 font-extrabold text-base shadow-sm"
          >
            {droppedIds.length} / {targetCount}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 py-3 min-h-[88px] w-full">
          {droppedIds.length === 0 ? (
            <p className="text-amber-700/80 font-semibold text-center">
              Bé hãy kéo hoặc chạm vào {targetCount} đồ vật để đưa vào đây nhé!
            </p>
          ) : (
            droppedIds.map((itemId) => (
              <button
                key={itemId}
                type="button"
                data-testid="dropped-target-item"
                data-item-id={itemId}
                onClick={() => returnItemToSource(itemId)}
                className="p-3 rounded-2xl bg-white hover:bg-rose-50 shadow-md border-2 border-amber-300 transition-transform duration-200 hover:scale-105 min-w-[64px] min-h-[64px] flex items-center justify-center"
                aria-label="Chạm để đưa vật phẩm về chỗ cũ"
              >
                {renderItemVector(itemType)}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        type="button"
        data-testid="drag-drop-submit-button"
        disabled={disabled}
        onClick={handleSubmit}
        className="btn-3d btn-3d-green min-h-[56px] min-w-[220px] px-8 py-4 rounded-2xl text-white font-black text-xl shadow-xl transition-all duration-150 disabled:opacity-60"
      >
        Kiểm tra đáp án ({droppedIds.length})
      </button>
    </div>
  );
};
