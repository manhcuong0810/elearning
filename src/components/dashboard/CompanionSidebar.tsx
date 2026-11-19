'use client';

import React, { useState } from 'react';
import { ChildProfile } from '@/components/navigation/MainHeader';
import { defaultAudioManager } from '@/lib/audio-manager';

export interface CompanionSidebarProps {
  profile: ChildProfile;
  totalExp: number;
  streakDays?: number;
}

const CHEERFUL_QUOTES = [
  'Hôm nay cùng tớ săn thêm thật nhiều sao nhé! ✨',
  'Bé tính toán siêu quá, cố lên nào! 🚀',
  'Mỗi ngày một ải toán, bé sẽ thông minh hơn! 💡',
  'Cú Mèo luôn đồng hành cùng bé đấy! 🦉',
  'Thử thách Đấu trường hôm nay rất vui nha! 🏟️',
];

export function CompanionSidebar({
  profile,
  totalExp,
  streakDays = 3,
}: CompanionSidebarProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Level calculation
  const getLevelInfo = (exp: number) => {
    if (exp < 100) {
      return {
        level: 1,
        title: 'Tập Sự Tí Hon',
        currentLevelMin: 0,
        nextLevelExp: 100,
      };
    }
    if (exp < 250) {
      return {
        level: 2,
        title: 'Thám Hiểm Nhí',
        currentLevelMin: 100,
        nextLevelExp: 250,
      };
    }
    if (exp < 500) {
      return {
        level: 3,
        title: 'Nhà Toán Học Nhí',
        currentLevelMin: 250,
        nextLevelExp: 500,
      };
    }
    return {
      level: 4,
      title: 'Phù Thủy Toán Học',
      currentLevelMin: 500,
      nextLevelExp: 1000,
    };
  };

  const levelInfo = getLevelInfo(totalExp);
  const expInLevel = Math.max(0, totalExp - levelInfo.currentLevelMin);
  const expRequiredForNext = levelInfo.nextLevelExp - levelInfo.currentLevelMin;
  const progressPercent = Math.min(
    100,
    Math.round((expInLevel / expRequiredForNext) * 100)
  );

  const handleMascotClick = () => {
    defaultAudioManager.playSfx('cheer');
    setIsWiggling(true);
    setQuoteIndex((prev) => (prev + 1) % CHEERFUL_QUOTES.length);
    setTimeout(() => setIsWiggling(false), 600);
  };

  return (
    <aside
      data-testid="companion-sidebar"
      className="flex flex-col gap-5 w-full select-none"
      aria-label="Thông tin bạn đồng hành và cấp độ"
    >
      {/* 1. Mascot Interactive Stage Card */}
      <div
        data-testid="companion-mascot"
        className="bg-white rounded-3xl p-5 shadow-lg border-4 border-amber-300 relative flex flex-col items-center text-center overflow-hidden"
      >
        {/* Decorative Floating Background Orbs */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-amber-100/60 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-sky-100/60 pointer-events-none" />

        {/* Speech Bubble */}
        <div
          data-testid="companion-speech-bubble"
          className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black text-amber-900 shadow-sm mb-4 max-w-[240px] leading-snug"
        >
          {CHEERFUL_QUOTES[quoteIndex]}
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-300" />
        </div>

        {/* Clickable Animated Owl Mascot */}
        <button
          type="button"
          data-testid="companion-mascot-btn"
          onClick={handleMascotClick}
          aria-label="Trò chuyện cùng Cú Mèo"
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-6xl sm:text-7xl cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 ${
            isWiggling ? 'animate-bounce' : 'animate-bounce-gentle'
          }`}
        >
          <span role="img" aria-label="Cú Mèo" className="drop-shadow-md">
            🦉
          </span>
        </button>

        <p className="text-[11px] font-bold text-slate-400 mt-2">
          👉 Bấm vào Cú Mèo để trò chuyện!
        </p>
      </div>

      {/* 2. Child Profile & Level EXP Card */}
      <div className="bg-white rounded-3xl p-5 shadow-lg border-4 border-sky-300 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200 border-2 border-sky-300 flex items-center justify-center text-2xl shadow-inner">
            {profile.avatarEmoji}
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-base font-black text-slate-800 leading-tight">
              {profile.name}
            </h3>
            <span className="inline-block bg-sky-100 text-sky-800 text-[11px] font-black px-2 py-0.5 rounded-full mt-0.5">
              Cấp {levelInfo.level}: {levelInfo.title}
            </span>
          </div>
        </div>

        {/* EXP Progress Bar */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between text-xs font-black text-slate-600">
            <span>Tiến độ kinh nghiệm</span>
            <span className="text-sky-700 font-extrabold">{totalExp} EXP</span>
          </div>
          <div
            className="w-full h-4 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden p-0.5"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-slate-400 text-right">
            Còn {levelInfo.nextLevelExp - totalExp} EXP để lên cấp kế tiếp
          </span>
        </div>
      </div>

      {/* 3. Streak Card */}
      <div className="bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-4 text-white shadow-lg border-4 border-amber-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-2xl shadow-inner">
            🔥
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-orange-100 block uppercase tracking-wider">
              Chuỗi học tập
            </span>
            <span className="text-base font-black leading-tight">
              {streakDays} ngày chăm chỉ!
            </span>
          </div>
        </div>
        <span className="text-2xl animate-pulse">⭐</span>
      </div>
    </aside>
  );
}
