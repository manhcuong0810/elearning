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
  initialPromptMessage?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialPromptMessage,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Interactive Google Sign-In Prompt State (when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured)
  const [isGooglePromptOpen, setIsGooglePromptOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
  const registerWithEmail = useAuthStore((state) => state.registerWithEmail);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isOpen) return null;

  const handleClose = () => {
    defaultAudioManager.playSfx('click');
    setLocalError(null);
    setIsGooglePromptOpen(false);
    onClose();
  };

  const handleStartGoogleSignIn = () => {
    defaultAudioManager.playSfx('click');
    setLocalError(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const winGoogle =
      typeof window !== 'undefined'
        ? (window as unknown as {
            google?: {
              accounts?: {
                oauth2?: {
                  initTokenClient: (config: unknown) => {
                    requestAccessToken: (opts?: unknown) => void;
                  };
                };
                id?: {
                  initialize: (opts: unknown) => void;
                  prompt: () => void;
                };
              };
            };
          }).google
        : null;

    if (clientId && winGoogle?.accounts) {
      // 1. Try OAuth 2.0 Token Client (Popup window, modern & most reliable)
      if (winGoogle.accounts.oauth2?.initTokenClient) {
        try {
          const tokenClient = winGoogle.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: {
              access_token?: string;
              error?: string;
            }) => {
              if (tokenResponse.error) {
                setLocalError(`Google OAuth: ${tokenResponse.error}`);
                return;
              }
              if (tokenResponse.access_token) {
                try {
                  const res = await fetch(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    {
                      headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                      },
                    }
                  );
                  const info = await res.json();
                  const user = await loginWithGoogle({
                    email: info.email,
                    fullName: info.name || info.email?.split('@')[0] || 'Phụ Huynh Google',
                    avatarUrl: info.picture || '👩‍👧',
                  });
                  defaultAudioManager.playSfx('cheer');
                  onSuccess?.(user);
                  onClose();
                } catch {
                  setLocalError(
                    'Không thể lấy thông tin từ Google API. Vui lòng thử lại!'
                  );
                }
              }
            },
          });
          tokenClient.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (err) {
          console.warn('Google initTokenClient failed, falling back to ID prompt', err);
        }
      }

      // 2. Try Google ID initialize / prompt
      if (winGoogle.accounts.id?.initialize) {
        try {
          winGoogle.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response.credential) {
                try {
                  const base64Url = response.credential.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const payload = JSON.parse(
                    decodeURIComponent(escape(atob(base64)))
                  );
                  const user = await loginWithGoogle({
                    email: payload.email,
                    fullName: payload.name || payload.email.split('@')[0],
                    avatarUrl: payload.picture || '👩‍👧',
                  });
                  defaultAudioManager.playSfx('cheer');
                  onSuccess?.(user);
                  onClose();
                } catch {
                  setLocalError('Lỗi xác thực chứng chỉ Google. Vui lòng thử lại!');
                }
              }
            },
          });
          winGoogle.accounts.id.prompt();
          return;
        } catch (err) {
          console.warn('Google ID prompt failed, falling back to interactive modal', err);
        }
      }
    }

    // In local development / test without client ID, open interactive Google Account Picker
    setIsGooglePromptOpen(true);
  };

  const handleConfirmGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const emailToUse = googleEmailInput.trim();
    const nameToUse = googleNameInput.trim() || emailToUse.split('@')[0] || 'Phụ Huynh Google';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailToUse && !emailRegex.test(emailToUse)) {
      setLocalError('Email Google không đúng định dạng. Vui lòng kiểm tra lại!');
      return;
    }

    try {
      const user = await loginWithGoogle({
        email: emailToUse || 'phuhuynh@gmail.com',
        fullName: nameToUse,
        avatarUrl: '👩‍👧',
      });
      defaultAudioManager.playSfx('cheer');
      setIsGooglePromptOpen(false);
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
        user = await registerWithEmail(fullName, email, password, childName);
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

        {initialPromptMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm font-black flex items-center gap-2">
            <span>💡</span>
            <span>{initialPromptMessage}</span>
          </div>
        )}

        {/* GOOGLE INTERACTIVE ACCOUNT INPUT DIALOG */}
        {isGooglePromptOpen ? (
          <div className="p-4 rounded-2xl bg-white border-2 border-sky-300 shadow-md flex flex-col gap-3 text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
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
                Xác Nhận Tài Khoản Google
              </span>
              <button
                type="button"
                onClick={() => setIsGooglePromptOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Quay lại
              </button>
            </div>

            <p className="text-xs font-medium text-slate-600">
              Nhập email Google thật của bạn để đăng nhập và kết nối với hồ sơ bé:
            </p>

            <form onSubmit={handleConfirmGoogleSignIn} className="flex flex-col gap-2.5">
              <input
                type="email"
                data-testid="google-email-input"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                placeholder="ba_me@gmail.com"
                required
                className="w-full min-h-[44px] px-3.5 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-xs sm:text-sm font-bold text-slate-800"
              />

              <input
                type="text"
                data-testid="google-name-input"
                value={googleNameInput}
                onChange={(e) => setGoogleNameInput(e.target.value)}
                placeholder="Tên phụ huynh (Ví dụ: Mẹ Lan Anh)"
                className="w-full min-h-[44px] px-3.5 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-xs sm:text-sm font-bold text-slate-800"
              />

              <button
                type="submit"
                data-testid="confirm-google-sign-in-btn"
                className="btn-3d w-full min-h-[46px] py-2 rounded-xl bg-gradient-to-b from-sky-500 to-sky-700 text-white font-black text-xs sm:text-sm shadow-md mt-1"
              >
                Tiếp Tục Đăng Nhập Với Google 🚀
              </button>
            </form>

            <span className="text-[10px] text-slate-400">
              💡 Ghi chú: Thêm <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> vào <code>.env.local</code> để mở popup One-Tap tự động của Google Cloud.
            </span>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Đăng nhập tài khoản phụ huynh để lưu tiến trình học tập, mở khóa Đấu
              trường và tạo hồ sơ riêng cho bé!
            </p>

            {/* 1-Click Google Sign-In Button */}
            <button
              type="button"
              data-testid="google-sign-in-btn"
              disabled={isLoading}
              onClick={handleStartGoogleSignIn}
              className="btn-3d w-full min-h-[52px] px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-md flex items-center justify-center gap-3 font-black text-slate-700 text-sm sm:text-base transition-all active:scale-98"
            >
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
                <>
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

                  <div className="flex flex-col gap-1 text-left">
                    <label
                      htmlFor="auth-childname"
                      className="text-xs font-black text-slate-700"
                    >
                      Tên của bé:
                    </label>
                    <input
                      id="auth-childname"
                      type="text"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Ví dụ: Bé Bống"
                      className="w-full min-h-[48px] px-4 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-sm font-bold text-slate-800"
                    />
                  </div>
                </>
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
          </>
        )}
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalElement, document.body);
  }
  return modalElement;
}
