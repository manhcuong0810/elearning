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

  const handleStageSelect = (stage: Stage) => {
    if (!unlockedStages.includes(stage.id)) {
      return;
    }
    onSelectStage?.(stage);
  };

  return (
    <div
      data-testid="adventure-map"
      className="w-full max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-8"
    >
      {/* Top Mascot Guide & Student Progress Header */}
      <div className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-white flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative Cloud SVG */}
        <svg
          viewBox="0 0 120 60"
          className="w-24 h-12 absolute -top-2 right-8 opacity-30 fill-white pointer-events-none"
          aria-hidden="true"
        >
          <circle cx="35" cy="35" r="20" />
          <circle cx="60" cy="25" r="25" />
          <circle cx="85" cy="35" r="18" />
        </svg>

        {/* Owl Mascot Guide */}
        <div
          data-testid="adventure-map-mascot"
          className="flex items-center gap-4 z-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-4 border-amber-400 shadow-lg flex items-center justify-center shrink-0">
            {/* Friendly Owl Mascot SVG */}
            <svg
              viewBox="0 0 64 64"
              className="w-12 h-12 sm:w-14 sm:h-14"
              aria-label="Cú Mèo Thông Thái"
            >
              <ellipse cx="32" cy="36" rx="20" ry="22" fill="#8B5CF6" />
              <ellipse cx="32" cy="40" rx="13" ry="14" fill="#EDE9FE" />
              <circle cx="24" cy="26" r="7" fill="#FFFFFF" />
              <circle cx="40" cy="26" r="7" fill="#FFFFFF" />
              <circle cx="24" cy="26" r="3.5" fill="#1E293B" />
              <circle cx="40" cy="26" r="3.5" fill="#1E293B" />
              <polygon points="32,30 28,36 36,36" fill="#F59E0B" />
              <polygon points="16,16 24,20 18,24" fill="#7C3AED" />
              <polygon points="48,16 40,20 46,24" fill="#7C3AED" />
            </svg>
          </div>
          <div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/90 text-sky-900 text-xs font-extrabold uppercase tracking-wider mb-1">
              Cú Mèo Thông Thái
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 drop-shadow-sm">
              {data.title}
            </h1>
            <p className="text-sm font-bold text-slate-800">
              Chọn một ải đã mở khóa để bắt đầu cuộc phiêu lưu toán học nhé!
            </p>
          </div>
        </div>

        {/* Student Reward Counters */}
        <div className="flex items-center gap-3 z-10 flex-wrap justify-center">
          <div
            data-testid="map-total-stars"
            className="flex items-center gap-1.5 bg-white/95 px-3.5 py-2 rounded-2xl shadow-md border-2 border-amber-300"
          >
            <span className="text-lg" role="img" aria-label="Sao">
              ⭐
            </span>
            <span className="font-black text-slate-800">{totalStarsEarned}</span>
          </div>
          <div
            data-testid="map-total-coins"
            className="flex items-center gap-1.5 bg-white/95 px-3.5 py-2 rounded-2xl shadow-md border-2 border-amber-300"
          >
            <span className="text-lg" role="img" aria-label="Xu vàng">
              🪙
            </span>
            <span className="font-black text-slate-800">{totalCoins}</span>
          </div>
          <div
            data-testid="map-total-exp"
            className="flex items-center gap-1.5 bg-white/95 px-3.5 py-2 rounded-2xl shadow-md border-2 border-purple-300"
          >
            <span className="text-lg" role="img" aria-label="Điểm kinh nghiệm">
              ⚡
            </span>
            <span className="font-black text-slate-800">{totalExp} EXP</span>
          </div>
        </div>
      </div>

      {/* Chapters & Winding Adventure Path */}
      <div className="flex flex-col gap-10">
        {data.chapters.map((chapter, chapterIdx) => {
          const isForest = chapter.theme === 'forest' || chapterIdx % 2 === 1;

          return (
            <section
              key={chapter.id}
              data-testid={`chapter-section-${chapter.id}`}
              className={`rounded-3xl p-6 sm:p-8 shadow-xl border-4 relative overflow-hidden ${
                isForest
                  ? 'bg-gradient-to-b from-emerald-100 via-teal-50 to-lime-100 border-emerald-300'
                  : 'bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100 border-amber-300'
              }`}
            >
              {/* Decorative SVG Islands and Trees in Background */}
              <svg
                viewBox="0 0 200 80"
                className="w-36 h-16 absolute bottom-2 right-4 opacity-25 pointer-events-none"
                aria-hidden="true"
              >
                <ellipse cx="100" cy="65" rx="85" ry="15" fill="#10B981" />
                <polygon points="60,60 75,20 90,60" fill="#059669" />
                <polygon points="110,60 130,15 150,60" fill="#047857" />
              </svg>

              {/* Chapter Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-4 border-b-2 border-slate-200/80">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white text-slate-800 text-xs font-black uppercase tracking-wider shadow-sm mb-1">
                    Chương {chapter.order}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                    {chapter.title}
                  </h2>
                  {chapter.description && (
                    <p className="text-sm sm:text-base font-medium text-slate-600 mt-1">
                      {chapter.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Winding Path of Stage Nodes */}
              <div className="flex flex-col items-center gap-8 relative py-4">
                {chapter.stages.map((stage, stageIdx) => {
                  const isUnlocked = unlockedStages.includes(stage.id);
                  const stars = stageStars[stage.id] ?? 0;

                  // Winding zigzag horizontal offset for visual adventure feel
                  const offsetClass =
                    stageIdx % 3 === 1
                      ? 'sm:translate-x-16'
                      : stageIdx % 3 === 2
                      ? 'sm:-translate-x-16'
                      : 'sm:translate-x-0';

                  return (
                    <React.Fragment key={stage.id}>
                      {/* Winding SVG Path Connector between stages */}
                      {stageIdx > 0 && (
                        <svg
                          viewBox="0 0 100 60"
                          className="w-20 h-12 -my-4 pointer-events-none"
                          aria-hidden="true"
                        >
                          <path
                            d="M 50 0 Q 75 30, 50 60"
                            fill="none"
                            stroke={isUnlocked ? '#F59E0B' : '#CBD5E1'}
                            strokeWidth="6"
                            strokeDasharray="10 8"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}

                      <div className={`transition-transform ${offsetClass}`}>
                        <StageNode
                          stage={stage}
                          isUnlocked={isUnlocked}
                          stars={stars}
                          onSelect={handleStageSelect}
                          index={stageIdx}
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
