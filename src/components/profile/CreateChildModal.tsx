'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChildProfile } from '@/types/auth';
import { defaultAudioManager } from '@/lib/audio-manager';

export interface CreateChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (child: Omit<ChildProfile, 'id' | 'studyMinutesToday'>) => void;
  isFirstChild?: boolean;
}

const AVATAR_OPTIONS = ['🦁', '🐰', '🐼', '🐯', '🐱', '🦉', '🦊', '🐶'];
const PIN_PALETTE = ['🍎', '⭐', '🦆', '🌈', '🍓', '🚀', '⚽', '🍕', '🎈', '🌙'];

export function CreateChildModal({
  isOpen,
  onClose,
  onCreate,
  isFirstChild = false,
}: CreateChildModalProps) {
  const [childName, setChildName] = useState('');
  const [gradeLabel, setGradeLabel] = useState('Lớp 1');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [selectedPinIcons, setSelectedPinIcons] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAvatar = (emoji: string) => {
    defaultAudioManager.playSfx('click');
    setSelectedAvatar(emoji);
  };

  const handleAddPinIcon = (emoji: string) => {
    if (selectedPinIcons.length >= 4) return;
    defaultAudioManager.playSfx('pop');
    setErrorMessage(null);
    setSelectedPinIcons((prev) => [...prev, emoji]);
  };

  const handleRemovePinIcon = (index: number) => {
    defaultAudioManager.playSfx('click');
    setSelectedPinIcons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!childName || childName.trim().length < 2) {
      setErrorMessage('Vui lòng nhập tên của bé (tối thiểu 2 ký tự)!');
      defaultAudioManager.playSfx('wrong');
      return;
    }

    if (selectedPinIcons.length !== 4) {
      setErrorMessage('Vui lòng chọn đủ 4 biểu tượng mã PIN cho bé!');
      defaultAudioManager.playSfx('wrong');
      return;
    }

    defaultAudioManager.playSfx('cheer');
    onCreate({
      name: childName.trim(),
      gradeLabel,
      avatarEmoji: selectedAvatar,
      pinIcons: selectedPinIcons,
    });
    onClose();
  };

  const modalElement = (
    <div
      data-testid="create-child-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Tạo hồ sơ cho bé"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-8 sm:py-12 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg my-auto max-h-[85vh] overflow-y-auto bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-amber-50/90 backdrop-blur-xs py-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-hidden="true">
              {selectedAvatar}
            </span>
            <div className="text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                {isFirstChild ? '🎉 Tạo Hồ Sơ Bé Đầu Tiên' : '➕ Thêm Hồ Sơ Bé Mới'}
              </h2>
              <span className="text-xs font-bold text-amber-700 block">
                Thiết lập hồ sơ học tập và mã PIN bảo mật
              </span>
            </div>
          </div>

          {!isFirstChild && (
            <button
              type="button"
              data-testid="close-create-child-btn"
              onClick={onClose}
              aria-label="Đóng"
              className="btn-3d min-w-[44px] min-h-[44px] rounded-2xl bg-slate-100 text-slate-700 font-black border-2 border-slate-300 border-b-4 flex items-center justify-center text-lg hover:bg-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs sm:text-sm font-black flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* Child Name & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label
                htmlFor="child-name-input"
                className="text-xs font-black text-slate-700"
              >
                Tên thường gọi của bé:
              </label>
              <input
                id="child-name-input"
                type="text"
                data-testid="child-name-input"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Ví dụ: Bé Bống"
                className="w-full min-h-[48px] px-4 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-slate-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="grade-select"
                className="text-xs font-black text-slate-700"
              >
                Khối lớp:
              </label>
              <select
                id="grade-select"
                value={gradeLabel}
                onChange={(e) => setGradeLabel(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-slate-800 bg-white"
              >
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
              </select>
            </div>
          </div>

          {/* Avatar Animal Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-700">
              Chọn linh vật đại diện cho bé:
            </label>
            <div
              data-testid="avatar-picker-grid"
              className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-slate-50 p-3 rounded-2xl border-2 border-slate-200"
            >
              {AVATAR_OPTIONS.map((emoji) => {
                const isSelected = selectedAvatar === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    data-testid={`avatar-option-${emoji}`}
                    onClick={() => handleSelectAvatar(emoji)}
                    className={`h-12 rounded-xl flex items-center justify-center text-2xl transition-transform ${
                      isSelected
                        ? 'bg-amber-300 border-2 border-amber-500 scale-110 shadow-md ring-2 ring-amber-300'
                        : 'bg-white hover:bg-amber-100 border border-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Icon PIN Code Builder */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-700">
                Mã PIN 4 biểu tượng (để bé tự đổi hồ sơ nhanh):
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                {selectedPinIcons.length}/4 biểu tượng
              </span>
            </div>

            {/* Chosen PIN slots */}
            <div
              data-testid="pin-slots-container"
              className="flex items-center justify-center gap-3 bg-amber-100/60 p-3 rounded-2xl border-2 border-amber-300"
            >
              {[0, 1, 2, 3].map((slotIdx) => {
                const icon = selectedPinIcons[slotIdx];
                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => icon && handleRemovePinIcon(slotIdx)}
                    title={icon ? 'Bấm để xóa' : 'Chưa chọn'}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                      icon
                        ? 'bg-white border-amber-400 shadow-md animate-bounce-gentle cursor-pointer hover:bg-rose-50 hover:border-rose-300'
                        : 'bg-white/40 border-dashed border-amber-300 text-amber-300'
                    }`}
                  >
                    {icon || '?'}
                  </button>
                );
              })}
            </div>

            {/* PIN Icons Palette */}
            <div
              data-testid="pin-palette-grid"
              className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 bg-slate-50 p-2.5 rounded-2xl border-2 border-slate-200"
            >
              {PIN_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  data-testid={`pin-option-${emoji}`}
                  disabled={selectedPinIcons.length >= 4}
                  onClick={() => handleAddPinIcon(emoji)}
                  className="h-10 rounded-xl bg-white hover:bg-amber-100 border border-slate-200 flex items-center justify-center text-xl transition-all disabled:opacity-40"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-400">
              👉 Bấm vào các biểu tượng ở trên để ghép thành mã 4 hình vẽ cho bé!
            </p>
          </div>

          <button
            type="submit"
            data-testid="submit-create-child-btn"
            className="btn-3d w-full min-h-[50px] py-3 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white border-b-4 border-b-amber-700 text-slate-900 font-black text-sm sm:text-base shadow-lg mt-2 transition-all active:scale-98"
          >
            {isFirstChild ? 'Hoàn Tất & Bắt Đầu Học Ngay 🚀' : 'Lưu Hồ Sơ Bé 🎉'}
          </button>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalElement, document.body);
  }
  return modalElement;
}
