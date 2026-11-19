'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useProgressStore } from '@/store/useProgressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/auth/AuthModal';
import { CreateChildModal } from '@/components/profile/CreateChildModal';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export type NavigationTab = 'adventure-map' | 'arena' | 'avatar-room' | 'parent-portal';

import {
  ChildProfile,
  GUEST_CHILD_PROFILE,
  DEFAULT_CHILDREN,
} from '@/types/auth';

export type { ChildProfile };
export { GUEST_CHILD_PROFILE, DEFAULT_CHILDREN };
export const DEFAULT_FAMILY_PROFILES = DEFAULT_CHILDREN;

export interface MainHeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeProfile?: ChildProfile;
  profiles?: ChildProfile[];
  onSelectProfile?: (profile: ChildProfile) => void;
  audioManager?: AudioManager;
  isAuthModalOpen?: boolean;
  onOpenAuthModal?: () => void;
  onCloseAuthModal?: () => void;
  authPromptMessage?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  activeTab,
  onSelectTab,
  activeProfile,
  profiles,
  onSelectProfile,
  audioManager = defaultAudioManager,
  isAuthModalOpen: propsIsAuthModalOpen,
  onOpenAuthModal,
  onCloseAuthModal,
  authPromptMessage: propsAuthPromptMessage,
}) => {
  const stageStars = useProgressStore((state) => state.stageStars);
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);

  const totalStars = Object.values(stageStars).reduce((sum, s) => sum + s, 0);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const addChildProfile = useAuthStore((state) => state.addChildProfile);

  const effectiveProfiles =
    profiles ||
    (isAuthenticated && user?.children && user.children.length > 0
      ? user.children
      : [GUEST_CHILD_PROFILE]);

  const effectiveActiveProfile =
    activeProfile ||
    (isAuthenticated && user?.children && user.children.length > 0
      ? user.children[0]
      : GUEST_CHILD_PROFILE);

  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [internalAuthModalOpen, setInternalAuthModalOpen] = useState<boolean>(false);
  const [isCreateChildModalOpen, setIsCreateChildModalOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(
    undefined
  );

  const isAuthModalOpen =
    propsIsAuthModalOpen !== undefined ? propsIsAuthModalOpen : internalAuthModalOpen;

  const openAuthModal = (promptMsg?: string) => {
    if (promptMsg) setAuthPromptMessage(promptMsg);
    onOpenAuthModal?.();
    setInternalAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    onCloseAuthModal?.();
    setInternalAuthModalOpen(false);
  };

  const handleTabClick = (tab: NavigationTab) => {
    audioManager.playSfx('click');
    if (!isAuthenticated && tab !== 'adventure-map') {
      if (tab === 'arena') {
        openAuthModal('Ba Mẹ hãy đăng nhập để cho bé tham gia Đấu Trường 1vs1 nhé!');
      } else if (tab === 'avatar-room') {
        openAuthModal('Ba Mẹ hãy đăng nhập để vào Nhà Của Bé và trang trí phòng nhé!');
      } else if (tab === 'parent-portal') {
        openAuthModal('Ba Mẹ hãy đăng nhập để xem Cổng Thông Tin Phụ Huynh nhé!');
      }
      return;
    }
    onSelectTab(tab);
  };

  const handleToggleMute = () => {
    const nextMuted = audioManager.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioManager.playSfx('pop');
    }
  };

  const handleProfileChoose = (profile: ChildProfile) => {
    audioManager.playSfx('cheer');
    onSelectProfile?.(profile);
    setIsProfileModalOpen(false);
  };

  const navItems: Array<{
    tab: NavigationTab;
    testId: string;
    label: string;
    icon: string;
    activeStyle: string;
  }> = [
    {
      tab: 'adventure-map',
      testId: 'nav-adventure-map',
      label: 'Bản Đồ',
      icon: '🏝️',
      activeStyle: 'btn-3d-yellow scale-105 ring-4 ring-amber-300/60 shadow-lg',
    },
    {
      tab: 'arena',
      testId: 'nav-arena',
      label: 'Đấu Trường',
      icon: '🏟️',
      activeStyle: 'btn-3d-green scale-105 ring-4 ring-emerald-300/60 shadow-lg',
    },
    {
      tab: 'avatar-room',
      testId: 'nav-avatar-room',
      label: 'Nhà Của Bé',
      icon: '🎒',
      activeStyle: 'btn-3d-purple scale-105 ring-4 ring-purple-300/60 shadow-lg',
    },
    {
      tab: 'parent-portal',
      testId: 'nav-parent-portal',
      label: 'Phụ Huynh',
      icon: '👨‍👩‍👧',
      activeStyle: 'btn-3d-blue scale-105 ring-4 ring-sky-300/60 shadow-lg',
    },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-300/80 shadow-md sticky top-0 z-40">
      {/* Top Status Bar: Logo + Profile on Left, Currency Counters + Mute on Right */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Profile Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-xl sm:text-2xl animate-bounce-gentle">
              🦉
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block leading-none">
                Toán Lớp 1 Diệu Kỳ
              </span>
              <span className="text-base font-black text-slate-800 leading-tight">
                Xứ Sở Cú Mèo
              </span>
            </div>
          </div>

          <div className="h-7 w-[2px] bg-slate-200 hidden sm:block" />

          {/* Child Profile Switcher Badge */}
          <button
            type="button"
            data-testid="active-profile-badge"
            onClick={() => {
              audioManager.playSfx('click');
              if (!isAuthenticated) {
                openAuthModal(
                  'Ba Mẹ hãy đăng nhập hoặc tạo tài khoản để tạo hồ sơ riêng cho bé và đặt mã PIN nhé!'
                );
              } else {
                setIsProfileModalOpen(true);
              }
            }}
            className="btn-3d min-h-[48px] px-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-sky-300 border-b-4 border-b-sky-400 flex items-center gap-2"
            aria-label={
              isAuthenticated
                ? `Đổi hồ sơ bé: hiện tại là ${effectiveActiveProfile.name}`
                : 'Đăng nhập để tạo hồ sơ bé'
            }
          >
            <span
              className="text-xl sm:text-2xl drop-shadow-sm"
              role="img"
              aria-hidden="true"
            >
              {effectiveActiveProfile.avatarEmoji}
            </span>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-black text-slate-800 block leading-tight">
                {effectiveActiveProfile.name}
              </span>
              <span className="text-[10px] font-black text-sky-700 block leading-tight">
                {isAuthenticated
                  ? `${effectiveActiveProfile.gradeLabel} ▾`
                  : 'Khách (Đăng nhập để thêm bé ▾)'}
              </span>
            </div>
          </button>
        </div>

        {/* Right: Currency Counters & Sound Mute Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Star Counter */}
          <div
            data-testid="header-total-stars"
            className="flex items-center gap-1.5 bg-gradient-to-b from-amber-50 to-amber-100 px-3 py-1.5 rounded-2xl border-2 border-amber-300 border-b-4 border-b-amber-400 shadow-sm"
            title="Tổng số Sao"
          >
            <span className="text-lg animate-wiggle" role="img" aria-label="Sao">
              ⭐
            </span>
            <span className="text-sm sm:text-base font-black text-amber-950">{totalStars}</span>
          </div>

          {/* Coin Counter */}
          <div
            data-testid="header-total-coins"
            className="flex items-center gap-1.5 bg-gradient-to-b from-yellow-50 to-yellow-100 px-3 py-1.5 rounded-2xl border-2 border-yellow-300 border-b-4 border-b-yellow-400 shadow-sm"
            title="Tổng số Xu Vàng"
          >
            <span className="text-lg animate-wiggle" role="img" aria-label="Xu vàng">
              🪙
            </span>
            <span className="text-sm sm:text-base font-black text-yellow-950">{totalCoins}</span>
          </div>

          {/* EXP Counter */}
          <div
            data-testid="header-total-exp"
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-b from-purple-50 to-purple-100 px-3 py-1.5 rounded-2xl border-2 border-purple-300 border-b-4 border-b-purple-400 shadow-sm"
            title="Điểm kinh nghiệm EXP"
          >
            <span className="text-lg" role="img" aria-label="EXP">
              ⚡
            </span>
            <span className="text-sm sm:text-base font-black text-purple-950">{totalExp}</span>
          </div>

          {/* Mute Toggle */}
          <button
            type="button"
            data-testid="audio-mute-toggle"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className={`btn-3d min-w-[48px] min-h-[48px] rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl transition-all ${
              isMuted
                ? 'bg-rose-50 border-rose-300 border-b-4 border-b-rose-400 text-rose-700'
                : 'bg-emerald-50 border-emerald-300 border-b-4 border-b-emerald-400 text-emerald-800'
            }`}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Parent Auth Section */}
          {!isAuthenticated ? (
            <button
              type="button"
              data-testid="auth-open-modal-btn"
              onClick={() => {
                audioManager.playSfx('click');
                openAuthModal();
              }}
              className="btn-3d min-h-[48px] px-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-white border-b-4 border-b-sky-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 hover:brightness-105 active:scale-95"
            >
              <span>👤</span>
              <span className="hidden sm:inline">Đăng Nhập</span>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                data-testid="parent-user-menu-btn"
                onClick={() => {
                  audioManager.playSfx('click');
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="btn-3d min-h-[48px] px-3 py-1.5 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-sky-300 border-b-4 border-b-sky-400 text-slate-800 font-black text-xs sm:text-sm shadow-sm flex items-center gap-2"
                aria-label={`Tài khoản phụ huynh: ${user?.fullName || user?.email}`}
              >
                {user?.avatarUrl?.startsWith('http') ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.fullName || 'Avatar'}
                    className="w-7 h-7 rounded-full object-cover border-2 border-sky-400 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xl">{user?.avatarUrl || '👩‍👧'}</span>
                )}
                <span className="hidden md:inline font-black text-xs text-sky-900 truncate max-w-[120px]">
                  {user?.fullName || user?.email?.split('@')[0] || 'Phụ Huynh'}
                </span>
                <span className="text-[10px] text-sky-600">▾</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-3 border-sky-200 py-2 z-50 flex flex-col gap-1">
                  <div className="px-3.5 py-2 border-b border-slate-100 text-left flex items-center gap-2.5">
                    {user?.avatarUrl?.startsWith('http') ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-sky-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-2xl">{user?.avatarUrl || '👩‍👧'}</span>
                    )}
                    <div className="truncate flex-1">
                      <span className="text-xs font-black text-slate-800 truncate block">
                        {user?.fullName || 'Phụ Huynh'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate block">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-testid="auth-logout-btn"
                    onClick={() => {
                      audioManager.playSfx('click');
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dedicated Floating Navigation Dock (Clean, Organized, Highly Accessible) */}
      <div className="bg-gradient-to-r from-amber-100/60 via-sky-100/60 to-emerald-100/60 border-t border-amber-200/60 py-2 px-3">
        <nav
          aria-label="Điều hướng chính"
          className="max-w-2xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                data-testid={item.testId}
                onClick={() => handleTabClick(item.tab)}
                aria-current={isActive ? 'page' : undefined}
                className={`btn-3d flex-1 sm:flex-initial min-h-[48px] min-w-[48px] px-3 sm:px-6 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                  isActive ? item.activeStyle : 'btn-3d-white hover:bg-white/90'
                }`}
              >
                <span className="text-lg sm:text-xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Child Profile Switcher Modal (4-Icon PIN Family Account selector) */}
      {isProfileModalOpen && (() => {
        const modalElement = (
          <div
            data-testid="profile-switcher-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Chọn hồ sơ học sinh"
            className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-start sm:items-center justify-center min-h-screen py-8 sm:py-12 animate-in fade-in duration-200"
          >
            <div className="relative w-full max-w-md my-auto max-h-[85vh] overflow-y-auto bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col gap-5">
              <div className="flex items-center justify-between sticky top-0 bg-amber-50/90 backdrop-blur-xs py-1 z-10">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <span>👧👦</span>
                  <span>Chọn Hồ Sơ Của Bé</span>
                </h2>
                <button
                  type="button"
                  data-testid="close-profile-modal-btn"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="btn-3d min-w-[48px] min-h-[48px] rounded-2xl bg-slate-100 text-slate-700 font-black border-2 border-slate-300 border-b-4 flex items-center justify-center text-lg hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm font-bold text-slate-600">
                Mỗi bé có mã PIN 4 biểu tượng ngộ nghĩnh riêng trong tài khoản Gia đình:
              </p>

              <div className="flex flex-col gap-3">
                {effectiveProfiles.map((profile) => {
                  const isSelected = profile.id === effectiveActiveProfile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      data-testid={`select-profile-${profile.id}`}
                      onClick={() => handleProfileChoose(profile)}
                      className={`btn-3d min-h-[64px] w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 border-b-4 border-b-amber-600 ring-2 ring-amber-300'
                          : 'bg-white hover:bg-sky-50 border-slate-200 border-b-4 border-b-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl drop-shadow-sm">{profile.avatarEmoji}</span>
                        <div className="text-left">
                          <span className="font-black text-slate-800 text-lg block leading-tight">
                            {profile.name} ({profile.gradeLabel})
                          </span>
                          <span className="text-xs font-bold text-slate-500 block mt-0.5">
                            Mã hình: {profile.pinIcons.join(' ')}
                          </span>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 rounded-full bg-kid-yellow text-slate-900 text-xs font-black shadow-sm">
                        {isSelected ? 'Đang học' : 'Chọn bé'}
                      </span>
                    </button>
                  );
                })}

                {/* Add new child button for parents */}
                {isAuthenticated && (
                  <button
                    type="button"
                    data-testid="add-child-profile-btn"
                    onClick={() => {
                      audioManager.playSfx('click');
                      setIsProfileModalOpen(false);
                      setIsCreateChildModalOpen(true);
                    }}
                    className="btn-3d w-full min-h-[48px] py-2 px-4 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 border-2 border-white border-b-4 border-b-sky-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    <span>➕</span>
                    <span>Thêm Hồ Sơ Bé Mới</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );

        if (typeof document !== 'undefined' && document.body) {
          return createPortal(modalElement, document.body);
        }
        return modalElement;
      })()}

      {/* Parent Auth Modal (Email/Password & Google Sign-In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          closeAuthModal();
          setAuthPromptMessage(undefined);
        }}
        initialPromptMessage={propsAuthPromptMessage ?? authPromptMessage}
      />

      {/* Create Child Profile Modal */}
      <CreateChildModal
        isOpen={isCreateChildModalOpen}
        onClose={() => setIsCreateChildModalOpen(false)}
        onCreate={(childData) => {
          const newChild = addChildProfile(childData);
          onSelectProfile?.(newChild);
        }}
        isFirstChild={effectiveProfiles.length === 0 || effectiveProfiles[0].id === 'guest'}
      />
    </header>
  );
};
