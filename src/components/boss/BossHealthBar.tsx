'use client';

import React from 'react';

export interface BossHealthBarProps {
  currentHp: number;
  maxHp: number;
  bossName: string;
}

export const BossHealthBar: React.FC<BossHealthBarProps> = ({
  currentHp,
  maxHp,
  bossName,
}) => {
  const safeMaxHp = Math.max(1, maxHp);
  const safeCurrentHp = Math.max(0, Math.min(currentHp, safeMaxHp));
  const hpPercentage = Math.round((safeCurrentHp / safeMaxHp) * 100);

  return (
    <div
      data-testid="boss-hp-bar"
      className="w-full max-w-xl mx-auto bg-white/95 rounded-3xl p-4 sm:p-5 shadow-lg border-4 border-amber-300 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-amber-100 text-xl"
            aria-hidden="true"
          >
            👑
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            {bossName}
          </h3>
        </div>
        <div
          data-testid="boss-hp-counter"
          className="px-3.5 py-1 rounded-full bg-rose-100 border-2 border-rose-300 text-rose-800 font-extrabold text-base sm:text-lg"
        >
          ❤️ {safeCurrentHp} / {safeMaxHp}
        </div>
      </div>

      {/* Progress Bar Track */}
      <div
        role="progressbar"
        aria-valuenow={safeCurrentHp}
        aria-valuemin={0}
        aria-valuemax={safeMaxHp}
        aria-label={`Năng lượng của ${bossName}`}
        className="w-full h-7 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300 p-1 shadow-inner"
      >
        <div
          data-testid="boss-hp-fill"
          style={{ width: `${hpPercentage}%` }}
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 transition-all duration-500 ease-out"
        />
      </div>

      {/* Heart Segments for Grade 1 visual counting */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {Array.from({ length: safeMaxHp }, (_, idx) => {
          const isFilled = idx < safeCurrentHp;
          return (
            <span
              key={`boss-heart-${idx}`}
              data-testid={isFilled ? 'boss-heart-active' : 'boss-heart-empty'}
              className={`text-xl transition-transform duration-300 ${
                isFilled ? 'scale-100 opacity-100' : 'scale-75 opacity-30 grayscale'
              }`}
              aria-hidden="true"
            >
              💖
            </span>
          );
        })}
      </div>
    </div>
  );
};
