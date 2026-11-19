'use client';

import React, { useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export type NavigationTab = 'adventure-map' | 'arena' | 'avatar-room' | 'parent-portal';

export interface ChildProfile {
  id: string;
  name: string;
  gradeLabel: string;
  avatarEmoji: string;
  pinIcons: string[];
  studyMinutesToday: number;
}

export const DEFAULT_FAMILY_PROFILES: ChildProfile[] = [
  {
    id: 'child_1',
    name: 'Bé Bin',
    gradeLabel: 'Lớp 1A',
    avatarEmoji: '🦁',
    pinIcons: ['🍎', '⭐', '🦆', '🌈'],
    studyMinutesToday: 25,
  },
  {
    id: 'child_2',
    name: 'Bé Na',
    gradeLabel: 'Lớp 1B',
    avatarEmoji: '🐰',
    pinIcons: ['🍓', '🌙', '🦋', '🌸'],
    studyMinutesToday: 18,
  },
];

export interface MainHeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeProfile?: ChildProfile;
  profiles?: ChildProfile[];
  onSelectProfile?: (profile: ChildProfile) => void;
  audioManager?: AudioManager;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
  activeTab,
  onSelectTab,
  activeProfile = DEFAULT_FAMILY_PROFILES[0],
  profiles = DEFAULT_FAMILY_PROFILES,
  onSelectProfile,
  audioManager = defaultAudioManager,
}) => {
  const stageStars = useProgressStore((state) => state.stageStars);
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);

  const totalStars = Object.values(stageStars).reduce((sum, s) => sum + s, 0);

  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleTabClick = (tab: NavigationTab) => {
    audioManager.playSfx('click');
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
    activeClass: string;
    inactiveClass: string;
  }> = [
    {
      tab: 'adventure-map',
      testId: 'nav-adventure-map',
      label: 'Bản Đồ',
      icon: '🏝️',
      activeClass: 'btn-3d-yellow scale-105 shadow-xl',
      inactiveClass: 'btn-3d-white hover:bg-amber-50',
    },
    {
      tab: 'arena',
      testId: 'nav-arena',
      label: 'Đấu Trường',
      icon: '🏟️',
      activeClass: 'btn-3d-green scale-105 shadow-xl',
      inactiveClass: 'btn-3d-white hover:bg-emerald-50',
    },
    {
      tab: 'avatar-room',
      testId: 'nav-avatar-room',
      label: 'Nhà Của Bé',
      icon: '🎒',
      activeClass: 'btn-3d-purple scale-105 shadow-xl',
      inactiveClass: 'btn-3d-white hover:bg-purple-50',
    },
    {
      tab: 'parent-portal',
      testId: 'nav-parent-portal',
      label: 'Phụ Huynh',
      icon: '👨‍👩‍👧',
      activeClass: 'btn-3d-blue scale-105 shadow-xl',
      inactiveClass: 'btn-3d-white hover:bg-sky-50',
    },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Brand Logo & 3D Active Profile Badge */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-2xl animate-bounce-gentle">
              🦉
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 block leading-tight">
                Toán Lớp 1 Diệu Kỳ
              </span>
              <span className="text-lg font-black text-slate-800 leading-tight">
                Xứ Sở Cú Mèo
              </span>
            </div>
          </div>

          {/* 3D Child Profile Switcher Badge (>= 48x48px) */}
          <button
            type="button"
            data-testid="active-profile-badge"
            onClick={() => {
              audioManager.playSfx('click');
              setIsProfileModalOpen(true);
            }}
            className="btn-3d min-h-[48px] min-w-[48px] px-3.5 py-2 rounded-2xl bg-gradient-to-b from-sky-50 to-sky-100 border-2 border-sky-300 border-b-4 border-b-sky-400 flex items-center gap-2"
            aria-label={`Đổi hồ sơ bé: hiện tại là ${activeProfile.name}`}
          >
            <span className="text-2xl drop-shadow-sm" role="img" aria-hidden="true">
              {activeProfile.avatarEmoji}
            </span>
            <div className="text-left">
              <span className="text-sm font-black text-slate-800 block leading-tight">
                {activeProfile.name}
              </span>
              <span className="text-[10px] font-extrabold text-sky-700 block leading-tight">
                {activeProfile.gradeLabel} ▾
              </span>
            </div>
          </button>
        </div>

        {/* Center: 3D Chunky Bouncy Navigation Tabs (all >= 48x48px) */}
        <nav
          aria-label="Điều hướng chính"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
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
                className={`btn-3d min-h-[48px] min-w-[48px] px-4 py-2.5 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2 ${
                  isActive ? item.activeClass : item.inactiveClass
                }`}
              >
                <span className="text-xl" role="img" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Shiny 3D Star/Coin/EXP Badges & Audio Mute Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            data-testid="header-total-stars"
            className="btn-3d flex items-center gap-1.5 bg-gradient-to-b from-amber-50 to-amber-100 px-3.5 py-2 rounded-2xl border-2 border-amber-300 border-b-4 border-b-amber-400 font-black text-amber-950 text-sm shadow-sm"
            title="Tổng số Sao"
          >
            <span className="text-lg animate-wiggle" role="img" aria-label="Sao">
              ⭐
            </span>
            <span className="text-base font-black">{totalStars}</span>
          </div>

          <div
            data-testid="header-total-coins"
            className="btn-3d flex items-center gap-1.5 bg-gradient-to-b from-yellow-50 to-yellow-100 px-3.5 py-2 rounded-2xl border-2 border-yellow-300 border-b-4 border-b-yellow-400 font-black text-yellow-950 text-sm shadow-sm"
            title="Tổng số Xu Vàng"
          >
            <span className="text-lg animate-wiggle" role="img" aria-label="Xu vàng">
              🪙
            </span>
            <span className="text-base font-black">{totalCoins}</span>
          </div>

          <div
            data-testid="header-total-exp"
            className="hidden sm:flex btn-3d items-center gap-1.5 bg-gradient-to-b from-purple-50 to-purple-100 px-3.5 py-2 rounded-2xl border-2 border-purple-300 border-b-4 border-b-purple-400 font-black text-purple-950 text-sm shadow-sm"
            title="Điểm kinh nghiệm EXP"
          >
            <span className="text-lg" role="img" aria-label="EXP">
              ⚡
            </span>
            <span className="text-base font-black">{totalExp}</span>
          </div>

          <button
            type="button"
            data-testid="audio-mute-toggle"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className={`btn-3d min-w-[48px] min-h-[48px] rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${
              isMuted
                ? 'bg-gradient-to-b from-rose-50 to-rose-100 border-rose-300 border-b-4 border-b-rose-400 text-rose-700'
                : 'bg-gradient-to-b from-emerald-50 to-emerald-100 border-emerald-300 border-b-4 border-b-emerald-400 text-emerald-800'
            }`}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Child Profile Switcher Modal (4-Icon PIN Family Account selector) */}
      {isProfileModalOpen && (
        <div
          data-testid="profile-switcher-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Chọn hồ sơ học sinh"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-amber-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <span>👧👦</span>
                <span>Chọn Hồ Sơ Của Bé</span>
              </h2>
              <button
                type="button"
                data-testid="close-profile-modal-btn"
                onClick={() => setIsProfileModalOpen(false)}
                className="btn-3d min-w-[48px] min-h-[48px] rounded-2xl bg-slate-100 text-slate-700 font-black border-2 border-slate-300 border-b-4"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-bold text-slate-600">
              Mỗi bé có mã PIN 4 biểu tượng ngộ nghĩnh riêng trong tài khoản Gia đình:
            </p>

            <div className="flex flex-col gap-3">
              {profiles.map((profile) => {
                const isSelected = profile.id === activeProfile.id;
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
