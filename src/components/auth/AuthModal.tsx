'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { defaultAudioManager } from '@/lib/audio-manager';
import { ParentUser } from '@/types/auth';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: ParentUser) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
  const registerWithEmail = useAuthStore((state) => state.registerWithEmail);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isOpen) return null;

  const handleClose = () => {
    defaultAudioManager.playSfx('click');
    setLocalError(null);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      defaultAudioManager.playSfx('click');
      const user = await loginWithGoogle();
      defaultAudioManager.playSfx('cheer');
      onSuccess?.(user);
      onClose();
    } catch (err: unknown) {
      defaultAudioManager.playSfx('wrong');
      setLocalError(
        err instanceof Error ? err.message : 'Đăng nhập Google thất bại!'
      );
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      defaultAudioManager.playSfx('click');
      let user: ParentUser;

      if (activeTab === 'login') {
        user = await loginWithEmail(email, password);
      } else {
        user = await registerWithEmail(fullName, email, password);
      }

      defaultAudioManager.playSfx('cheer');
      onSuccess?.(user);
      onClose();
    } catch (err: unknown) {
      defaultAudioManager.playSfx('wrong');
      setLocalError(
        err instanceof Error ? err.message : 'Thao tác không thành công!'
      );
    }
  };

  const modalElement = (
    <div
      data-testid="auth-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập hoặc đăng ký tài khoản"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-8 sm:py-12 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md my-auto max-h-[85vh] overflow-y-auto bg-gradient-to-b from-sky-50 via-white to-sky-50 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-sky-300 flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex items-center justify-between sticky top-0 bg-sky-50/90 backdrop-blur-xs py-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-hidden="true">
              👨‍👩‍👧
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Tài Khoản Gia Đình
            </h2>
          </div>
          <button
            type="button"
            data-testid="auth-modal-close-btn"
            onClick={handleClose}
            aria-label="Đóng cửa sổ đăng nhập"
            className="btn-3d min-w-[48px] min-h-[48px] rounded-2xl bg-slate-100 text-slate-700 font-black border-2 border-slate-300 border-b-4 flex items-center justify-center text-lg hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-600">
          Đăng nhập tài khoản phụ huynh để lưu tiến trình học tập, mở khóa Đấu
          trường và theo dõi sự tiến bộ của bé!
        </p>

        {/* 1-Click Google Sign-In Button */}
        <button
          type="button"
          data-testid="google-sign-in-btn"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
          className="btn-3d w-full min-h-[52px] px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-md flex items-center justify-center gap-3 font-black text-slate-700 text-sm sm:text-base transition-all active:scale-98"
        >
          {/* Official Google 'G' icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Tiếp tục với Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-[2px] bg-slate-200" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            hoặc email
          </span>
          <div className="flex-1 h-[2px] bg-slate-200" />
        </div>

        {/* Tabs: Đăng Nhập / Đăng Ký */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border-2 border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setLocalError(null);
            }}
            className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'login'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setLocalError(null);
            }}
            className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'register'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Error message */}
        {localError && (
          <div
            data-testid="auth-error-message"
            className="p-3 rounded-2xl bg-red-50 border-2 border-red-300 text-red-700 text-xs font-black flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{localError}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form
          noValidate
          onSubmit={handleSubmitForm}
          className="flex flex-col gap-3.5"
        >
          {activeTab === 'register' && (
            <div className="flex flex-col gap-1 text-left">
              <label
                htmlFor="auth-fullname"
                className="text-xs font-black text-slate-700"
              >
                Họ và tên Phụ huynh:
              </label>
              <input
                id="auth-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Mẹ Lan Chi"
                className="w-full min-h-[48px] px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-bold text-slate-800"
              />
            </div>
          )}

          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="auth-email"
              className="text-xs font-black text-slate-700"
            >
              Email của Ba Mẹ:
            </label>
            <input
              id="auth-email"
              type="email"
              data-testid="auth-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ba_me@gmail.com"
              className="w-full min-h-[48px] px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-bold text-slate-800"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label
              htmlFor="auth-password"
              className="text-xs font-black text-slate-700"
            >
              Mật khẩu:
            </label>
            <input
              id="auth-password"
              type="password"
              data-testid="auth-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full min-h-[48px] px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-bold text-slate-800"
            />
          </div>

          <button
            type="submit"
            data-testid="auth-submit-btn"
            disabled={isLoading}
            className="btn-3d w-full min-h-[48px] py-3 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-white border-b-4 border-b-sky-700 text-white font-black text-sm sm:text-base shadow-lg mt-2 transition-all active:scale-98"
          >
            {activeTab === 'login' ? 'Đăng Nhập Ngay 🚀' : 'Tạo Tài Khoản Bé 🎉'}
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
