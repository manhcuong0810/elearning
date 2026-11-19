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
  }> = [
    {
      tab: 'adventure-map',
      testId: 'nav-adventure-map',
      label: 'Bản Đồ',
      icon: '🏝️',
      activeClass: 'bg-kid-yellow text-slate-900 border-amber-500 shadow-md scale-105',
    },
    {
      tab: 'arena',
      testId: 'nav-arena',
      label: 'Đấu Trường',
      icon: '🏟️',
      activeClass: 'bg-kid-green text-white border-green-700 shadow-md scale-105',
    },
    {
      tab: 'avatar-room',
      testId: 'nav-avatar-room',
      label: 'Nhà Của Bé',
      icon: '🎒',
      activeClass: 'bg-kid-purple text-white border-purple-700 shadow-md scale-105',
    },
    {
      tab: 'parent-portal',
      testId: 'nav-parent-portal',
      label: 'Phụ Huynh',
      icon: '👨‍👩‍👧',
      activeClass: 'bg-sky-500 text-white border-sky-700 shadow-md scale-105',
    },
  ];

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Active Child Profile Switcher */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-kid-orange border-2 border-white shadow flex items-center justify-center text-2xl">
              🦉
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 block">
                Toán Lớp 1 Diệu Kỳ
              </span>
              <span className="text-base sm:text-lg font-black text-slate-800">
                Xứ Sở Cú Mèo
              </span>
            </div>
          </div>

          {/* Child Profile Switcher Badge (>= 48x48px) */}
          <button
            type="button"
            data-testid="active-profile-badge"
            onClick={() => {
              audioManager.playSfx('click');
              setIsProfileModalOpen(true);
            }}
            className="min-h-[48px] min-w-[48px] px-3.5 py-2 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 flex items-center gap-2 transition-all shadow-sm"
            aria-label={`Đổi hồ sơ bé: hiện tại là ${activeProfile.name}`}
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {activeProfile.avatarEmoji}
            </span>
            <div className="text-left">
              <span className="text-sm font-black text-slate-800 block leading-tight">
                {activeProfile.name}
              </span>
              <span className="text-xs font-bold text-sky-700 block">
                {activeProfile.gradeLabel} ▾
              </span>
            </div>
          </button>
        </div>

        {/* Center: Main Kid-Friendly Navigation Tabs (all >= 48x48px) */}
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
                className={`min-h-[48px] min-w-[48px] px-4 py-2.5 rounded-2xl font-extrabold text-sm sm:text-base border-b-4 transition-all flex items-center gap-2 ${
                  isActive
                    ? item.activeClass
                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-300'
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

        {/* Right: Live Star/Coin/EXP Counters & Audio Mute Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            data-testid="header-total-stars"
            className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-2xl border-2 border-amber-300 font-black text-slate-800 text-sm"
            title="Tổng số Sao"
          >
            <span role="img" aria-label="Sao">
              ⭐
            </span>
            <span>{totalStars}</span>
          </div>

          <div
            data-testid="header-total-coins"
            className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-2xl border-2 border-amber-300 font-black text-slate-800 text-sm"
            title="Tổng số Xu Vàng"
          >
            <span role="img" aria-label="Xu vàng">
              🪙
            </span>
            <span>{totalCoins}</span>
          </div>

          <div
            data-testid="header-total-exp"
            className="hidden sm:flex items-center gap-1 bg-purple-50 px-3 py-2 rounded-2xl border-2 border-purple-300 font-black text-slate-800 text-sm"
            title="Điểm kinh nghiệm EXP"
          >
            <span role="img" aria-label="EXP">
              ⚡
            </span>
            <span>{totalExp}</span>
          </div>

          <button
            type="button"
            data-testid="audio-mute-toggle"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className={`min-w-[48px] min-h-[48px] rounded-2xl border-2 flex items-center justify-center text-xl transition-all ${
              isMuted
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800'
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">
                👧👦 Chọn Hồ Sơ Của Bé
              </h2>
              <button
                type="button"
                data-testid="close-profile-modal-btn"
                onClick={() => setIsProfileModalOpen(false)}
                className="min-w-[48px] min-h-[48px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-600">
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
                    className={`min-h-[64px] w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white hover:bg-sky-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{profile.avatarEmoji}</span>
                      <div className="text-left">
                        <span className="font-black text-slate-800 text-base block">
                          {profile.name} ({profile.gradeLabel})
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Mã hình: {profile.pinIcons.join(' ')}
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-kid-yellow text-slate-900 text-xs font-extrabold">
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
