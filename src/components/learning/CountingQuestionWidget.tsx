'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuestionOption, CountingPayload } from '@/types/curriculum';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export interface CountingQuestionWidgetProps {
  question: Question;
  payload?: CountingPayload;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
  audioManager?: AudioManager;
}

export const renderItemVector = (itemType = 'apple') => {
  const normalized = itemType.toLowerCase();

  switch (normalized) {
    case 'apple':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Quả táo">
          <path
            d="M32 14 C28 6, 36 4, 38 10"
            stroke="#5D4037"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M34 11 C42 6, 48 12, 36 15 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          <path
            d="M32 16 C20 14, 10 24, 12 38 C14 50, 24 58, 32 54 C40 58, 50 50, 52 38 C54 24, 44 14, 32 16 Z"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth="2"
          />
          <ellipse cx="22" cy="28" rx="3.5" ry="7" fill="#FCA5A5" opacity="0.8" transform="rotate(-20 22 28)" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Ngôi sao">
          <polygon
            points="32,6 39,22 57,24 43,36 47,54 32,45 17,54 21,36 7,24 25,22"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="27" cy="28" r="2" fill="#713F12" />
          <circle cx="37" cy="28" r="2" fill="#713F12" />
          <path d="M28 34 Q32 38 36 34" stroke="#713F12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'duck':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Chú vịt">
          <ellipse cx="30" cy="42" rx="18" ry="12" fill="#FDE047" stroke="#EAB308" strokeWidth="2.5" />
          <circle cx="40" cy="24" r="11" fill="#FDE047" stroke="#EAB308" strokeWidth="2.5" />
          <polygon points="50,22 58,25 50,28" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
          <circle cx="43" cy="21" r="2" fill="#1E293B" />
          <path d="M22 40 Q30 47 36 40" stroke="#CA8A04" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'sheep':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Chú cừu">
          <circle cx="22" cy="34" r="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="32" cy="28" r="12" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="42" cy="34" r="10" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="32" cy="38" r="11" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
          <ellipse cx="46" cy="30" rx="7" ry="6" fill="#334155" />
          <circle cx="48" cy="29" r="1.5" fill="#FFFFFF" />
        </svg>
      );
    case 'carrot':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Củ cà rốt">
          <path d="M36 10 C32 4, 28 12, 32 16 C28 10, 40 6, 36 16" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M24 18 L42 18 L33 54 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'butterfly':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Chú bướm">
          <ellipse cx="20" cy="24" rx="12" ry="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <ellipse cx="44" cy="24" rx="12" ry="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <ellipse cx="22" cy="40" rx="9" ry="8" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
          <ellipse cx="42" cy="40" rx="9" ry="8" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
          <rect x="30" y="18" width="4" height="28" rx="2" fill="#334155" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-md transition-transform hover:scale-110 active:scale-95" aria-label="Đồ vật">
          <circle cx="32" cy="32" r="20" fill="#C084FC" stroke="#7E22CE" strokeWidth="2.5" />
          <circle cx="25" cy="25" r="4" fill="#F3E8FF" />
        </svg>
      );
  }
};

export const CountingQuestionWidget: React.FC<CountingQuestionWidgetProps> = ({
  question,
  payload,
  onAnswer,
  disabled = false,
  audioManager = defaultAudioManager,
}) => {
  const activePayload = payload ?? question.interactivePayload ?? {};
  const targetCount = activePayload.targetCount ?? 3;
  const itemType = activePayload.itemType ?? 'apple';
  const options = question.options ?? [];

  const [countedIndices, setCountedIndices] = useState<number[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    setCountedIndices([]);
    setSelectedOptionId(null);
  }, [question.id]);

  const handleToggleItemCount = (index: number) => {
    audioManager.playSfx('pop');
    setCountedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleOptionClick = (option: QuestionOption) => {
    if (disabled) return;
    setSelectedOptionId(option.id);
    onAnswer(option.isCorrect);
  };

  const visualItems = Array.from({ length: targetCount }, (_, index) => index);

  return (
    <div className="flex flex-col items-center gap-6 w-full" data-testid="counting-question-widget">
      {/* 3D Visual Counting Board (Garden Blanket theme) */}
      <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100/90 border-4 border-amber-300 rounded-[2rem] p-6 sm:p-8 flex flex-wrap items-center justify-center gap-5 min-h-[160px] shadow-inner relative overflow-hidden">
        {/* Soft cartoon grass tufts decoration */}
        <div className="absolute top-2 left-3 text-xl opacity-30 select-none">🌱</div>
        <div className="absolute bottom-2 right-4 text-xl opacity-30 select-none">🌼</div>

        {visualItems.map((idx) => {
          const countedOrder = countedIndices.indexOf(idx);
          const isCounted = countedOrder !== -1;

          return (
            <button
              key={`${question.id}-item-${idx}`}
              type="button"
              data-testid="counting-visual-item"
              data-counted={isCounted ? 'true' : 'false'}
              data-item-type={itemType}
              onClick={() => handleToggleItemCount(idx)}
              className={`btn-3d relative p-3.5 rounded-2xl flex flex-col items-center justify-center min-w-[64px] min-h-[64px] ${
                isCounted
                  ? 'bg-gradient-to-b from-yellow-200 to-amber-300 border-2 border-amber-400 border-b-4 border-b-amber-600 scale-110 shadow-lg'
                  : 'bg-white hover:bg-amber-50 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-md'
              }`}
              aria-label={`Vật thể đếm thứ ${idx + 1}`}
            >
              {renderItemVector(itemType)}
              {isCounted && (
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-base flex items-center justify-center shadow-lg border-2 border-white animate-bounce-gentle">
                  {countedOrder + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Options with 3D Bouncy Buttons */}
      {options.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => handleOptionClick(option)}
                className={`btn-3d min-h-[64px] min-w-[64px] py-4 px-6 rounded-2xl text-3xl font-black ${
                  isSelected
                    ? option.isCorrect
                      ? 'btn-3d-green scale-105 shadow-xl'
                      : 'btn-3d-orange'
                    : 'btn-3d-white hover:bg-sky-50'
                }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
