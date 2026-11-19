'use client';

import React, { useState } from 'react';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export interface ParentalGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  challengeText?: string;
  expectedAnswer?: number;
  audioManager?: AudioManager;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  challengeText = '12 × 4 = ?',
  expectedAnswer = 48,
  audioManager = defaultAudioManager,
}) => {
  const [answerInput, setAnswerInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericVal = Number(answerInput.trim());

    if (answerInput.trim() !== '' && numericVal === expectedAnswer) {
      setErrorMessage(null);
      setAnswerInput('');
      audioManager.playSfx('correct');
      onSuccess();
    } else {
      audioManager.playSfx('wrong');
      setErrorMessage(
        'Đáp án chưa chính xác. Khu vực này chỉ dành cho Ba Mẹ và Phụ Huynh!'
      );
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setAnswerInput('');
    audioManager.playSfx('click');
    onClose();
  };

  return (
    <div
      data-testid="parental-gate-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parental-gate-title"
      className="fixed inset-0 z-[9999] overflow-y-auto flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 min-h-screen py-8 sm:py-12"
    >
      <div className="relative w-full max-w-md my-auto max-h-[85vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sky-300 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-extrabold uppercase tracking-wider">
            🔒 Cổng Bảo Vệ Phụ Huynh
          </span>
          <button
            type="button"
            data-testid="parental-gate-close-btn"
            onClick={handleClose}
            aria-label="Đóng cổng phụ huynh"
            className="min-w-[48px] min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="text-center">
          <h2
            id="parental-gate-title"
            className="text-2xl font-black text-slate-800 mb-2"
          >
            Xác Thực Dành Cho Ba Mẹ
          </h2>
          <p className="text-sm font-medium text-slate-600">
            Để tránh các bé Lớp 1 vô tình bấm nhầm vào phần cài đặt, vui lòng giải phép tính nhân dưới đây:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
            <span className="text-3xl font-black text-amber-900 tracking-wide">
              {challengeText}
            </span>
          </div>

          <input
            type="number"
            inputMode="numeric"
            data-testid="parental-gate-input"
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Nhập kết quả..."
            aria-label="Kết quả phép tính xác thực phụ huynh"
            className="w-full min-h-[52px] px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none text-center text-2xl font-extrabold text-slate-900"
          />

          {errorMessage && (
            <div
              data-testid="parental-gate-error"
              role="alert"
              className="p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm font-bold text-center"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-base transition-colors"
            >
              Quay lại
            </button>
            <button
              type="submit"
              data-testid="parental-gate-submit-btn"
              className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-base shadow-md border-b-4 border-sky-700 active:translate-y-0.5 transition-all"
            >
              Mở Cổng Phụ Huynh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
