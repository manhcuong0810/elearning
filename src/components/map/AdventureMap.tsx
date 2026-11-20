'use client';

import React from 'react';
import { Curriculum, Stage } from '@/types/curriculum';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { useProgressStore } from '@/store/useProgressStore';
import { StageNode } from './StageNode';

export interface AdventureMapProps {
  curriculum?: Curriculum;
  onSelectStage?: (stage: Stage) => void;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  curriculum,
  onSelectStage,
  isAuthenticated = true,
  onRequireAuth,
}) => {
  const data = curriculum ?? loadGrade1MathData();
  const unlockedStages = useProgressStore((state) => state.unlockedStages);
  const stageStars = useProgressStore((state) => state.stageStars);
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);

  const totalStarsEarned = isAuthenticated
    ? Object.values(stageStars).reduce((sum, s) => sum + s, 0)
    : 0;
  const effectiveCoins = isAuthenticated ? totalCoins : 0;
  const effectiveExp = isAuthenticated ? totalExp : 0;

  // Find the current active stage (first unlocked stage with < 3 stars, or the latest unlocked)
  const allStages = data.chapters.flatMap((c) => c.stages);
  const currentActiveStageId =
    allStages.find((s) => unlockedStages.includes(s.id) && (stageStars[s.id] ?? 0) < 3)?.id ??
    unlockedStages[unlockedStages.length - 1];

  const handleStageSelect = (stage: Stage) => {
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }
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

      {/* Guest Welcome & Sign-in CTA Banner */}
      {!isAuthenticated && (
        <div
          data-testid="guest-welcome-banner"
          className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg border-4 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner border border-white/40">
              🏝️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Chào mừng Ba Mẹ & Bé đến với Xứ Sở Cú Mèo!
              </h3>
              <p className="text-xs font-bold text-amber-100">
                Khám phá lộ trình Toán Diệu Kỳ tương tác. Đăng nhập ngay để mở khóa các ải học và lưu tiến độ cho bé!
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="guest-banner-login-btn"
            onClick={onRequireAuth}
            className="btn-3d whitespace-nowrap min-h-[48px] px-6 py-2.5 rounded-2xl bg-white text-orange-600 text-sm font-black shadow-md border-2 border-orange-200 hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>🚀</span>
            <span>Đăng Nhập Ngay</span>
          </button>
        </div>
      )}

      {/* Top Banner: Owl Mascot Guide in the Magical Garden */}
      <div className="relative rounded-[2.5rem] p-5 sm:p-6 shadow-2xl border-4 border-white bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 overflow-hidden">
        {/* Decorative Floating Garden Elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-8 border-yellow-200/40 pointer-events-none" />
        <div className="absolute top-2 right-12 text-3xl select-none animate-bounce-gentle opacity-80">
          🦋
        </div>
        <div className="absolute bottom-2 right-36 text-2xl select-none animate-float opacity-70">
          🌸
        </div>

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
              <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black border-2 border-white shadow">
                KHU VƯỜN
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-sm mb-1.5">
                <span>🌿</span>
                <span>Khu Vườn Toán Học Kỳ Diệu</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                Khu Vườn Cú Mèo Thông Thái 🦉
              </h1>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5">
                Cùng dạo bước qua các bậc đá cỏ hoa, giải đố hái quả và khám phá tri thức diệu kỳ! 🌻
              </p>
            </div>
          </div>

          {/* Quick Quest Progress Badge */}
          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl border-2 border-emerald-300 shadow-md flex flex-col items-center sm:items-end gap-1">
            <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
              🎯 Tiến Độ Khu Vườn
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800">
                ⭐ {totalStarsEarned} Sao
              </span>
              <span className="text-sm font-black text-amber-600">
                🪙 {effectiveCoins} Xu
              </span>
            </div>
            <div className="w-32 h-2.5 bg-emerald-100 rounded-full overflow-hidden border border-emerald-300">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalStarsEarned / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hidden test-id hooks for test compatibility */}
        <div className="hidden" aria-hidden="true">
          <span data-testid="map-total-stars">{totalStarsEarned}</span>
          <span data-testid="map-total-coins">{effectiveCoins}</span>
          <span data-testid="map-total-exp">{effectiveExp}</span>
        </div>
      </div>

      {/* Chapters & Adventure Trail */}
      <div className="flex flex-col gap-12">
        {data.chapters.map((chapter, chapterIdx) => {
          const isHills = chapterIdx === 2;
          const isForest = chapterIdx === 1;

          return (
            <section
              key={chapter.id}
              data-testid={`chapter-section-${chapter.id}`}
              className={`rounded-[3rem] p-6 sm:p-10 shadow-2xl border-4 border-white relative overflow-hidden transition-all ${
                isHills
                  ? 'bg-gradient-to-b from-purple-100 via-pink-50 to-indigo-100'
                  : isForest
                  ? 'bg-gradient-to-b from-emerald-100 via-teal-50 to-lime-100'
                  : 'bg-gradient-to-b from-amber-100 via-rose-50 to-emerald-100'
              }`}
              style={{
                boxShadow: isHills
                  ? '0 20px 40px -15px rgba(147, 51, 234, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
                  : isForest
                  ? '0 20px 40px -15px rgba(5, 150, 105, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)'
                  : '0 20px 40px -15px rgba(217, 119, 6, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)',
              }}
            >
              {/* Lively Garden Landmarks */}
              <div className="absolute top-4 left-6 text-4xl select-none animate-float opacity-75">
                {isHills ? '🥕' : isForest ? '🍄' : '🌸'}
              </div>
              <div className="absolute top-12 right-8 text-4xl select-none animate-bounce-gentle opacity-75">
                {isHills ? '🦔' : isForest ? '🌻' : '🍎'}
              </div>
              <div className="absolute bottom-6 left-8 text-4xl select-none opacity-60">
                {isHills ? '🐰' : isForest ? '🦋' : '🐝'}
              </div>
              <div className="absolute bottom-8 right-6 text-4xl select-none opacity-60">
                {isHills ? '🌿' : isForest ? '🌲' : '🏡'}
              </div>

              {/* 3D Garden Wooden Signpost Chapter Banner */}
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div
                  className={`inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 rounded-2xl border-4 border-white shadow-xl ${
                    isHills
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : isForest
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white'
                  }`}
                >
                  <span className="text-2xl">
                    {isHills ? '🍄' : isForest ? '🌳' : '🌸'}
                  </span>
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-black tracking-wider block opacity-90">
                      Vùng Vườn {chapter.order}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm">
                      {chapter.title}
                    </h2>
                  </div>
                </div>

                {chapter.description && (
                  <p className="text-xs sm:text-sm font-extrabold text-slate-700 mt-2.5 max-w-md bg-white/75 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white shadow-sm">
                    {chapter.description}
                  </p>
                )}
              </div>

              {/* Serpentine Adventure Path */}
              <div className="flex flex-col items-center gap-10 relative py-4 z-10">
                {chapter.stages.map((stage, stageIdx) => {
                  const isUnlocked = unlockedStages.includes(stage.id);
                  const stars = isAuthenticated ? (stageStars[stage.id] ?? 0) : 0;
                  const isCurrentActive = isAuthenticated && stage.id === currentActiveStageId;

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
