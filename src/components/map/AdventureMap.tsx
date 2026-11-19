'use client';

import React from 'react';
import { Curriculum, Stage } from '@/types/curriculum';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { useProgressStore } from '@/store/useProgressStore';
import { StageNode } from './StageNode';

export interface AdventureMapProps {
  curriculum?: Curriculum;
  onSelectStage?: (stage: Stage) => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  curriculum,
  onSelectStage,
}) => {
  const data = curriculum ?? loadGrade1MathData();
  const unlockedStages = useProgressStore((state) => state.unlockedStages);
  const stageStars = useProgressStore((state) => state.stageStars);
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);

  const totalStarsEarned = Object.values(stageStars).reduce(
    (sum, s) => sum + s,
    0
  );

  // Find the current active stage (first unlocked stage with < 3 stars, or the latest unlocked)
  const allStages = data.chapters.flatMap((c) => c.stages);
  const currentActiveStageId =
    allStages.find((s) => unlockedStages.includes(s.id) && (stageStars[s.id] ?? 0) < 3)?.id ??
    unlockedStages[unlockedStages.length - 1];

  const handleStageSelect = (stage: Stage) => {
    if (!unlockedStages.includes(stage.id)) {
      return;
    }
    onSelectStage?.(stage);
  };

  return (
    <div
      data-testid="adventure-map"
      className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-8 relative select-none"
    >
      {/* Background Animated Sky Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Animated Sun */}
        <div className="absolute top-2 left-6 w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full blur-sm opacity-80" />
        <div className="absolute top-4 left-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg border-2 border-yellow-100 flex items-center justify-center text-3xl animate-bounce-gentle">
          ☀️
        </div>

        {/* Drifting Clouds */}
        <div className="absolute top-10 -left-20 w-40 h-16 bg-white/80 rounded-full blur-[1px] animate-cloud-slow" />
        <div className="absolute top-48 -left-32 w-52 h-20 bg-white/60 rounded-full blur-[1px] animate-cloud-slow" style={{ animationDelay: '12s' }} />

        {/* Rainbow Arc */}
        <div className="absolute top-12 right-10 text-6xl opacity-75 animate-float">
          🌈
        </div>
      </div>

      {/* Top Banner: Owl Mascot Guide + Daily Quest Motivation */}
      <div className="relative rounded-[2.5rem] p-5 sm:p-6 shadow-2xl border-4 border-white bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 overflow-hidden">
        {/* Decorative Light Rays */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-8 border-yellow-300/40 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          {/* Owl Mascot Guide */}
          <div
            data-testid="adventure-map-mascot"
            className="flex items-center gap-4 text-center sm:text-left"
          >
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-22 sm:h-22 p-2 rounded-3xl bg-gradient-to-br from-amber-200 to-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-4xl sm:text-5xl animate-bounce-gentle">
                🦉
              </div>
              <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black border-2 border-white shadow">
                SẴN SÀNG
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-sky-950 text-xs font-black uppercase tracking-wider shadow-sm mb-1.5">
                <span>✨</span>
                <span>Cú Mèo Đồng Hành</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {data.title}
              </h1>
              <p className="text-xs sm:text-sm font-extrabold text-sky-950 mt-0.5">
                Hôm nay: Hãy vượt ải có biểu tượng Cú Mèo đang vẫy tay nhé! 🚀
              </p>
            </div>
          </div>

          {/* Quick Quest Progress Badge */}
          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl border-2 border-amber-300 shadow-md flex flex-col items-center sm:items-end gap-1">
            <span className="text-[11px] font-black uppercase text-amber-800 tracking-wider">
              🎯 Thử Thách Ngày
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">
                ⭐ {totalStarsEarned}/15 Sao
              </span>
              <span className="text-sm font-black text-amber-600">
                🪙 {totalCoins} Xu
              </span>
            </div>
            <div className="w-32 h-2.5 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalStarsEarned / 15) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hidden test-id hooks for test compatibility */}
        <div className="hidden" aria-hidden="true">
          <span data-testid="map-total-stars">{totalStarsEarned}</span>
          <span data-testid="map-total-coins">{totalCoins}</span>
          <span data-testid="map-total-exp">{totalExp}</span>
        </div>
      </div>

      {/* Chapters & Adventure Trail */}
      <div className="flex flex-col gap-12">
        {data.chapters.map((chapter, chapterIdx) => {
          const isForest = chapter.theme === 'forest' || chapterIdx % 2 === 1;

          return (
            <section
              key={chapter.id}
              data-testid={`chapter-section-${chapter.id}`}
              className={`rounded-[3rem] p-6 sm:p-10 shadow-2xl border-4 border-white relative overflow-hidden transition-all ${
                isForest
                  ? 'bg-gradient-to-b from-emerald-100 via-teal-50 to-lime-100'
                  : 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100'
              }`}
              style={{
                boxShadow: isForest
                  ? '0 20px 40px -15px rgba(5, 150, 105, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
                  : '0 20px 40px -15px rgba(217, 119, 6, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Lively Cartoon Scenic Landmarks */}
              <div className="absolute top-4 left-6 text-4xl select-none animate-float opacity-70">
                {isForest ? '🍄' : '🌻'}
              </div>
              <div className="absolute top-12 right-8 text-4xl select-none animate-bounce-gentle opacity-70">
                {isForest ? '🌲' : '🍎'}
              </div>
              <div className="absolute bottom-6 left-8 text-4xl select-none opacity-60">
                {isForest ? '🦋' : '🐝'}
              </div>
              <div className="absolute bottom-8 right-6 text-4xl select-none opacity-60">
                {isForest ? '🦌' : '🏡'}
              </div>

              {/* 3D Chapter Banner Header */}
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div
                  className={`inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl border-4 border-white shadow-xl ${
                    isForest
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}
                >
                  <span className="text-xl">📍</span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-black tracking-wider block opacity-90">
                      Chương {chapter.order}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm">
                      {chapter.title}
                    </h2>
                  </div>
                </div>

                {chapter.description && (
                  <p className="text-xs sm:text-sm font-extrabold text-slate-700 mt-2 max-w-md bg-white/60 px-4 py-1.5 rounded-full border border-white">
                    {chapter.description}
                  </p>
                )}
              </div>

              {/* Serpentine Adventure Path */}
              <div className="flex flex-col items-center gap-10 relative py-4 z-10">
                {chapter.stages.map((stage, stageIdx) => {
                  const isUnlocked = unlockedStages.includes(stage.id);
                  const stars = stageStars[stage.id] ?? 0;
                  const isCurrentActive = stage.id === currentActiveStageId;

                  // Smooth alternating S-curve offset
                  const offsetClass =
                    stageIdx % 3 === 1
                      ? 'sm:translate-x-24'
                      : stageIdx % 3 === 2
                      ? 'sm:-translate-x-24'
                      : 'sm:translate-x-0';

                  return (
                    <React.Fragment key={stage.id}>
                      {/* Cobblestone connectors */}
                      {stageIdx > 0 && (
                        <div className="flex flex-col items-center gap-2 -my-4 pointer-events-none z-0">
                          <div
                            className={`w-4 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                              isUnlocked ? 'bg-amber-400' : 'bg-slate-300'
                            }`}
                          />
                          <div
                            className={`w-5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors ${
                              isUnlocked ? 'bg-amber-400' : 'bg-slate-300'
                            }`}
                          />
                          <div
                            className={`w-4 h-3 rounded-full border-2 border-white shadow-sm transition-colors ${
                              isUnlocked ? 'bg-amber-400' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                      )}

                      <div className={`transition-transform duration-300 ${offsetClass} z-10`}>
                        <StageNode
                          stage={stage}
                          isUnlocked={isUnlocked}
                          stars={stars}
                          onSelect={handleStageSelect}
                          index={stageIdx}
                          isCurrentActive={isCurrentActive}
                        />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
