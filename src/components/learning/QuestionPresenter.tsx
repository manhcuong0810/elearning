'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionOption } from '@/types/curriculum';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';
import { AudioPromptButton } from './AudioPromptButton';
import { CountingQuestionWidget, renderItemVector } from './CountingQuestionWidget';
import { DragDropMathWidget } from './DragDropMathWidget';

export interface QuestionPresenterProps {
  question: Question;
  onAnswer: (isCorrect: boolean, question: Question) => void;
  audioManager?: AudioManager;
  disabled?: boolean;
}

export const QuestionPresenter: React.FC<QuestionPresenterProps> = ({
  question,
  onAnswer,
  audioManager = defaultAudioManager,
  disabled = false,
}) => {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const submissionLockRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFeedbackState('idle');
    setSelectedOptionId(null);
    submissionLockRef.current = false;
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
      }
    };
  }, [question.id]);

  const handleAnswerSubmission = (isCorrect: boolean, option?: QuestionOption) => {
    if (disabled || submissionLockRef.current) {
      return;
    }

    // Lock immediately to prevent duplicate rapid submissions
    submissionLockRef.current = true;

    if (option) {
      setSelectedOptionId(option.id);
    }

    if (isCorrect) {
      setFeedbackState('correct');
      audioManager.playSfx('correct');
      audioManager.playVoice(question.feedbackAudio?.correct || '', {
        text: 'Bé làm đúng rồi! Giỏi quá!',
      });
    } else {
      setFeedbackState('wrong');
      audioManager.playSfx('wrong');
      audioManager.playVoice(question.feedbackAudio?.wrong || '', {
        text: 'Bé thử lại nhé, cố lên nào!',
      });
      // Allow retry after a short cooldown if wrong
      lockTimerRef.current = setTimeout(() => {
        submissionLockRef.current = false;
      }, 450);
    }

    onAnswer(isCorrect, question);
  };

  const renderQuestionBody = () => {
    if (question.type === 'COUNTING') {
      return (
        <CountingQuestionWidget
          question={question}
          onAnswer={(isCorrect) => handleAnswerSubmission(isCorrect)}
          disabled={disabled || feedbackState === 'correct'}
          audioManager={audioManager}
        />
      );
    }

    if (question.type === 'DRAG_DROP') {
      return (
        <DragDropMathWidget
          question={question}
          onAnswer={(isCorrect) => handleAnswerSubmission(isCorrect)}
          disabled={disabled || feedbackState === 'correct'}
          audioManager={audioManager}
        />
      );
    }

    // MULTIPLE_CHOICE
    const options = question.options ?? [];
    const targetCount = question.interactivePayload?.targetCount;
    const itemType = question.interactivePayload?.itemType ?? 'star';

    return (
      <div className="flex flex-col items-center gap-6 w-full" data-testid="multiple-choice-widget">
        {typeof targetCount === 'number' && targetCount > 0 && (
          <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100/80 border-4 border-amber-300 rounded-[2rem] p-6 flex flex-wrap items-center justify-center gap-4 shadow-inner">
            {Array.from({ length: targetCount }, (_, i) => (
              <div
                key={`${question.id}-mc-visual-${i}`}
                data-testid="mc-visual-item"
                className="p-3 bg-white rounded-2xl shadow-md border-2 border-amber-200"
              >
                {renderItemVector(itemType)}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || feedbackState === 'correct'}
                onClick={() => handleAnswerSubmission(option.isCorrect, option)}
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
      </div>
    );
  };

  return (
    <div
      data-testid="question-presenter"
      className="w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border-4 border-amber-300 border-b-[10px] border-b-amber-500 p-6 sm:p-8 flex flex-col gap-6"
    >
      {/* 3D Header with Audio Prompt Button (>48x48px) and Prompt Text */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 p-4 sm:p-5 rounded-3xl border-2 border-amber-300 shadow-sm">
        <AudioPromptButton
          promptAudioUrl={question.promptAudioUrl}
          promptText={question.promptText}
          audioManager={audioManager}
        />
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
          {question.promptText}
        </h2>
      </div>

      {/* Interactive Question Content */}
      {renderQuestionBody()}

      {/* Encouraging Kid-Friendly Feedback Banner */}
      {feedbackState !== 'idle' && (
        <div
          data-testid="question-feedback-banner"
          role="status"
          className={`w-full p-4 sm:p-5 rounded-2xl text-center font-black text-lg sm:text-xl shadow-lg border-b-4 animate-in fade-in zoom-in-95 duration-150 ${
            feedbackState === 'correct'
              ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-950 border-emerald-400 border-b-emerald-600'
              : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-950 border-amber-400 border-b-amber-600'
          }`}
        >
          {feedbackState === 'correct'
            ? '🌟 Giỏi quá! Bé trả lời chính xác rồi! Tuyệt vời! 🎉'
            : '💪 Gần đúng rồi! Bé bình tĩnh đếm kỹ và thử lại nhé, cố lên! 🌈'}
        </div>
      )}
    </div>
  );
};
