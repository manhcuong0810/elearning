'use client';

import React from 'react';
import { Stage } from '@/types/curriculum';

export interface StageNodeProps {
  stage: Stage;
  isUnlocked: boolean;
  stars: number;
  onSelect: (stage: Stage) => void;
  index?: number;
}

export const StageNode: React.FC<StageNodeProps> = ({
  stage,
  isUnlocked,
  stars,
  onSelect,
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
    <div className="flex flex-col items-center gap-2 relative select-none">
      {/* Boss Crown / Dragon Badge */}
      {isBoss && (
        <div
          data-testid="stage-boss-badge"
          className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-extrabold shadow-md border-2 border-amber-200 animate-bounce"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-amber-200"
            aria-hidden="true"
          >
            <path d="M3 18h18v2H3v-2zm0-2l2-9 5 4 2-6 2 6 5-4 2 9H3z" />
          </svg>
          <span>TRÙM CUỐI VÙNG</span>
        </div>
      )}

      {/* Main Stage Interactive Button (>= 48x48px touch target for Grade 1 children) */}
      <button
        type="button"
        data-testid={`stage-node-${stage.id}`}
        disabled={!isUnlocked}
        onClick={handleClick}
        aria-label={`${stage.name} - ${isUnlocked ? `Đã mở khóa, ${clampedStars} sao` : 'Đang khóa'}`}
        className={`min-w-[48px] min-h-[48px] w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center relative transition-all duration-200 shadow-xl border-4 ${
          !isUnlocked
            ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-85'
            : isBoss
            ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400 border-amber-200 text-white hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-rose-300/60'
            : 'bg-gradient-to-br from-kid-yellow via-amber-400 to-kid-orange border-white text-slate-900 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-amber-300/50'
        }`}
      >
        {!isUnlocked ? (
          <div
            data-testid="stage-lock-icon"
            className="flex flex-col items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-9 h-9 fill-slate-400"
              aria-hidden="true"
            >
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
            <span className="text-xs font-bold mt-1">Khóa</span>
          </div>
        ) : isBoss ? (
          <div className="flex flex-col items-center justify-center">
            <span className="text-3xl" role="img" aria-label="Boss">
              🐉
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wide mt-1">
              Ải Boss
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black leading-none">
              {stage.order}
            </span>
            <span className="text-xs font-extrabold mt-1">Ải {stage.order}</span>
          </div>
        )}
      </button>

      {/* 0-3 Stars Rating Row */}
      <div
        className="flex items-center gap-1 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-amber-200"
        aria-label={`${clampedStars} trên 3 sao`}
      >
        {[1, 2, 3].map((starIndex) => {
          const isEarned = isUnlocked && starIndex <= clampedStars;
          return (
            <svg
              key={starIndex}
              data-testid={isEarned ? 'stage-star-filled' : 'stage-star-empty'}
              viewBox="0 0 24 24"
              className={`w-5 h-5 transition-transform ${
                isEarned ? 'fill-amber-400 scale-110 drop-shadow-sm' : 'fill-slate-200'
              }`}
              aria-hidden="true"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        })}
      </div>

      {/* Stage Title Banner */}
      <div className="bg-white/95 px-4 py-1.5 rounded-2xl shadow-md border-2 border-amber-200 text-center max-w-[180px]">
        <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
          {stage.name}
        </p>
        {stage.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {stage.description}
          </p>
        )}
      </div>
    </div>
  );
};
