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
      if (question.feedbackAudio?.correct) {
        audioManager.playVoice(question.feedbackAudio.correct);
      }
    } else {
      setFeedbackState('wrong');
      audioManager.playSfx('wrong');
      if (question.feedbackAudio?.wrong) {
        audioManager.playVoice(question.feedbackAudio.wrong);
      }
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
          <div className="w-full bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 flex flex-wrap items-center justify-center gap-4">
            {Array.from({ length: targetCount }, (_, i) => (
              <div
                key={`${question.id}-mc-visual-${i}`}
                data-testid="mc-visual-item"
                className="p-2 bg-white rounded-2xl shadow-sm"
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
                className={`min-h-[64px] min-w-[64px] py-4 px-6 rounded-2xl text-2xl font-extrabold transition-all duration-150 shadow-md border-b-4 active:translate-y-0.5 ${
                  isSelected
                    ? option.isCorrect
                      ? 'bg-kid-green text-white border-green-600 scale-105'
                      : 'bg-amber-400 text-slate-900 border-amber-600'
                    : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300'
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
      className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border-4 border-amber-200 p-6 sm:p-8 flex flex-col gap-6"
    >
      {/* Header with Audio Prompt Button (>48x48px) and Prompt Text */}
      <div className="flex items-center gap-4 bg-amber-50/90 p-4 rounded-2xl border border-amber-200">
        <AudioPromptButton
          promptAudioUrl={question.promptAudioUrl}
          audioManager={audioManager}
        />
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">
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
          className={`w-full p-4 rounded-2xl text-center font-extrabold text-lg transition-all duration-200 ${
            feedbackState === 'correct'
              ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
              : 'bg-amber-100 text-amber-900 border-2 border-amber-400'
          }`}
        >
          {feedbackState === 'correct'
            ? '🌟 Giỏi quá! Bé trả lời chính xác rồi! Tuyệt vời!'
            : '💪 Gần đúng rồi! Bé bình tĩnh đếm kỹ và thử lại nhé, cố lên!'}
        </div>
      )}
    </div>
  );
};
