'use client';

import React from 'react';
import { Stage } from '@/types/curriculum';

export interface StageNodeProps {
  stage: Stage;
  isUnlocked: boolean;
  stars: number;
  onSelect: (stage: Stage) => void;
  index?: number;
  isCurrentActive?: boolean;
}

export const StageNode: React.FC<StageNodeProps> = ({
  stage,
  isUnlocked,
  stars,
  onSelect,
  isCurrentActive = false,
}) => {
  const clampedStars = Math.max(0, Math.min(3, stars));
  const isBoss = Boolean(stage.isBoss);

  const handleClick = () => {
    if (!isUnlocked) {
      return;
    }
    onSelect(stage);
  };

  return (
    <div className="flex flex-col items-center gap-2 relative select-none group">
      {/* 3D Floating Mascot Avatar standing on the active stage */}
      {isUnlocked && isCurrentActive && (
        <div className="absolute -top-16 z-20 flex flex-col items-center animate-bounce-gentle pointer-events-none">
          {/* Speech Bubble */}
          <div className="bg-white px-3 py-1 rounded-2xl shadow-lg border-2 border-amber-400 text-xs font-black text-amber-900 mb-1 relative whitespace-nowrap">
            Vào chơi nào! ✨
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-amber-400 rotate-45" />
          </div>

          {/* Cute 3D Owl Sprite */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-xl">
            🦉
          </div>
        </div>
      )}

      {/* Boss Crown / Dragon 3D Banner */}
      {isBoss && (
        <div
          data-testid="stage-boss-badge"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white text-xs font-black shadow-lg border-2 border-amber-200 animate-wiggle uppercase tracking-wider -mb-1 z-10"
        >
          <span className="text-sm">👑</span>
          <span>TRÙM CUỐI VÙNG</span>
          <span className="text-sm">🔥</span>
        </div>
      )}

      {/* Glowing Pulsing Aura Ring around Unlocked Stages */}
      {isUnlocked && (
        <div
          className={`absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full pointer-events-none animate-pulse-ring ${
            isBoss ? 'bg-rose-400/30' : 'bg-amber-400/30'
          }`}
          style={{ top: isBoss ? '1.25rem' : '0' }}
        />
      )}

      {/* 3D Chunky Pedestal Base (Stone / Grass) */}
      <div className="relative">
        {/* Grass Tuft / Pedestal Underneath */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-6 bg-emerald-600/30 rounded-full blur-[2px]" />

        {/* Main Stage 3D Pushable Button */}
        <button
          type="button"
          data-testid={`stage-node-${stage.id}`}
          disabled={!isUnlocked}
          onClick={handleClick}
          aria-label={`${stage.name} - ${isUnlocked ? `Đã mở khóa, ${clampedStars} sao` : 'Đang khóa'}`}
          className={`min-w-[48px] min-h-[48px] w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] flex flex-col items-center justify-center relative transition-all duration-150 select-none ${
            !isUnlocked
              ? 'bg-gradient-to-b from-slate-200 to-slate-300 border-b-[8px] border-slate-400 text-slate-400 cursor-not-allowed opacity-80'
              : isBoss
              ? 'bg-gradient-to-b from-rose-400 via-rose-500 to-red-600 border-4 border-amber-200 border-b-[10px] border-b-rose-800 text-white shadow-xl hover:brightness-105 active:border-b-2 active:translate-y-[8px] cursor-pointer'
              : 'bg-gradient-to-b from-yellow-300 via-amber-400 to-kid-orange border-4 border-white border-b-[10px] border-b-amber-700 text-slate-900 shadow-xl hover:brightness-105 active:border-b-2 active:translate-y-[8px] cursor-pointer'
          }`}
        >
          {/* Top Gloss Reflection */}
          {isUnlocked && (
            <div className="absolute top-1.5 left-4 right-4 h-3 bg-white/40 rounded-full pointer-events-none" />
          )}

          {!isUnlocked ? (
            <div
              data-testid="stage-lock-icon"
              className="flex flex-col items-center justify-center"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 fill-slate-400 drop-shadow-sm"
                aria-hidden="true"
              >
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
              </svg>
              <span className="text-[11px] font-black uppercase text-slate-500 mt-1">
                Khóa
              </span>
            </div>
          ) : isBoss ? (
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl drop-shadow" role="img" aria-label="Boss">
                🐉
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-100 mt-0.5">
                Ải Boss
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-amber-950 leading-none drop-shadow-sm">
                {stage.order}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 mt-0.5">
                Ải {stage.order}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* 3D 0-3 Stars Rating Pill */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full shadow-md border-2 transition-all ${
          clampedStars > 0
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white/80 border-slate-200'
        }`}
        aria-label={`${clampedStars} trên 3 sao`}
      >
        {[1, 2, 3].map((starNum) => {
          const isFilled = starNum <= clampedStars;
          return (
            <svg
              key={starNum}
              data-testid={isFilled ? 'stage-star-filled' : 'stage-star-empty'}
              viewBox="0 0 24 24"
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                isFilled
                  ? 'fill-amber-400 stroke-amber-600 stroke-1 drop-shadow-sm scale-110'
                  : 'fill-slate-200 stroke-slate-300 stroke-1'
              }`}
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        })}
      </div>

      {/* Stage Name Card */}
      <div className="text-center max-w-[130px] sm:max-w-[150px]">
        <span className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1 group-hover:text-amber-700 transition-colors drop-shadow-sm">
          {stage.name}
        </span>
      </div>
    </div>
  );
};
