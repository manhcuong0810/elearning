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
      className="w-full max-w-4xl mx-auto p-3 sm:p-6 flex flex-col gap-8 relative"
    >
      {/* Background Floating Sky Elements (Clouds, Hot Air Balloon, Rainbow) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Sun */}
        <div className="absolute top-2 left-6 w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full blur-sm opacity-80" />
        <div className="absolute top-4 left-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg border-2 border-yellow-100 flex items-center justify-center text-2xl animate-spin-slow">
          ☀️
        </div>

        {/* Drifting Fluffy Clouds */}
        <div className="absolute top-10 -left-20 w-36 h-16 bg-white/70 rounded-full blur-[1px] animate-cloud-slow" />
        <div className="absolute top-36 -left-32 w-48 h-20 bg-white/60 rounded-full blur-[1px] animate-cloud-slow" style={{ animationDelay: '15s' }} />

        {/* Hot Air Balloon */}
        <div className="absolute top-20 right-8 text-4xl animate-float opacity-80">
          🎈
        </div>
      </div>

      {/* Top 3D Mascot Banner & Student Treasure Counters */}
      <div className="relative rounded-[2.5rem] p-5 sm:p-7 shadow-2xl border-4 border-white bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 overflow-hidden">
        {/* Rainbow Accent Arc */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full border-8 border-pink-400/40 border-t-yellow-300/60 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
          {/* Owl Mascot Guide with speech bubble */}
          <div
            data-testid="adventure-map-mascot"
            className="flex items-center gap-4 text-center sm:text-left"
          >
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-200 to-amber-400 border-4 border-white shadow-xl flex items-center justify-center text-4xl sm:text-5xl animate-bounce-gentle">
                🦉
              </div>
              <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black border-2 border-white shadow">
                ONLINE
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-sky-900 text-xs font-black uppercase tracking-wider shadow-sm mb-1.5">
                <span>🌟</span>
                <span>Cú Mèo Thông Thái</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                {data.title}
              </h1>
              <p className="text-sm sm:text-base font-extrabold text-sky-950/90 mt-0.5">
                Bé hãy chạm vào ải vàng để bắt đầu cuộc phiêu lưu nhé! 🚀
              </p>
            </div>
          </div>

          {/* 3D Student Reward Badges */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div
              data-testid="map-total-stars"
              className="flex items-center gap-2 bg-gradient-to-b from-amber-100 to-amber-200 px-4 py-2.5 rounded-2xl shadow-lg border-2 border-amber-400 border-b-4"
            >
              <span className="text-2xl animate-wiggle" role="img" aria-label="Sao">
                ⭐
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-black text-amber-800 block leading-tight">
                  Ngôi Sao
                </span>
                <span className="text-xl font-black text-amber-950 leading-tight">
                  {totalStarsEarned}
                </span>
              </div>
            </div>

            <div
              data-testid="map-total-coins"
              className="flex items-center gap-2 bg-gradient-to-b from-yellow-100 to-yellow-200 px-4 py-2.5 rounded-2xl shadow-lg border-2 border-yellow-400 border-b-4"
            >
              <span className="text-2xl animate-wiggle" role="img" aria-label="Xu vàng">
                🪙
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-black text-yellow-800 block leading-tight">
                  Xu Vàng
                </span>
                <span className="text-xl font-black text-yellow-950 leading-tight">
                  {totalCoins}
                </span>
              </div>
            </div>

            <div
              data-testid="map-total-exp"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-b from-purple-100 to-purple-200 px-4 py-2.5 rounded-2xl shadow-lg border-2 border-purple-400 border-b-4"
            >
              <span className="text-2xl" role="img" aria-label="Điểm kinh nghiệm">
                ⚡
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-black text-purple-800 block leading-tight">
                  Cấp Độ
                </span>
                <span className="text-xl font-black text-purple-950 leading-tight">
                  {totalExp} EXP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters & 3D Winding Adventure Islands */}
      <div className="flex flex-col gap-14">
        {data.chapters.map((chapter, chapterIdx) => {
          const isForest = chapter.theme === 'forest' || chapterIdx % 2 === 1;

          return (
            <section
              key={chapter.id}
              data-testid={`chapter-section-${chapter.id}`}
              className={`rounded-[3rem] p-6 sm:p-10 shadow-2xl border-4 border-white relative overflow-hidden ${
                isForest
                  ? 'bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-200/80'
                  : 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100/90'
              }`}
              style={{
                boxShadow: isForest
                  ? '0 20px 40px -15px rgba(5, 150, 105, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
                  : '0 20px 40px -15px rgba(217, 119, 6, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Decorative 3D Island Hills & Flora */}
              <div className="absolute -top-6 -left-6 text-5xl opacity-40 select-none">
                {isForest ? '🌲' : '🌴'}
              </div>
              <div className="absolute top-10 -right-4 text-4xl opacity-30 select-none">
                {isForest ? '🌳' : '🌺'}
              </div>
              <div className="absolute bottom-6 left-6 text-4xl opacity-30 select-none">
                {isForest ? '🍄' : '🌻'}
              </div>

              {/* 3D Chapter Wooden / Candy Signboard */}
              <div className="flex items-center justify-center mb-10">
                <div
                  className={`px-6 sm:px-8 py-3.5 rounded-3xl border-4 border-white shadow-xl text-center transform -rotate-1 hover:rotate-0 transition-transform ${
                    isForest
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}
                >
                  <span className="inline-block px-3 py-0.5 rounded-full bg-white/30 text-white text-xs font-black uppercase tracking-wider mb-1">
                    📍 Chương {chapter.order}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">
                    {chapter.title}
                  </h2>
                  {chapter.description && (
                    <p className="text-xs sm:text-sm font-bold text-white/90 mt-0.5">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </div>

              {/* 3D Winding Path of Stage Nodes with Stepping Stones */}
              <div className="flex flex-col items-center gap-10 relative py-6">
                {chapter.stages.map((stage, stageIdx) => {
                  const isUnlocked = unlockedStages.includes(stage.id);
                  const stars = stageStars[stage.id] ?? 0;
                  const isCurrentActive = stage.id === currentActiveStageId;

                  // Winding zigzag horizontal offset for organic adventure path
                  const offsetClass =
                    stageIdx % 3 === 1
                      ? 'sm:translate-x-20'
                      : stageIdx % 3 === 2
                      ? 'sm:-translate-x-20'
                      : 'sm:translate-x-0';

                  return (
                    <React.Fragment key={stage.id}>
                      {/* 3D Stepping Stone Connectors between stages */}
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
