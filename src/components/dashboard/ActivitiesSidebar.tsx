'use client';

import React, { useState } from 'react';
import { defaultAudioManager } from '@/lib/audio-manager';

export interface ActivitiesSidebarProps {
  todayStars?: number;
  stagesCompletedToday?: number;
  arenaMatchesToday?: number;
  onClaimReward: (coins: number) => void;
  isAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  childName?: string;
}

interface QuestItem {
  id: string;
  title: string;
  icon: string;
  current: number;
  target: number;
  rewardCoins: number;
}

const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'Bé Bo', stars: 180, emoji: '🐯', medal: '🥇' },
  { rank: 2, name: 'Bé Bống (Bạn)', stars: 125, emoji: '👧', medal: '🥈' },
  { rank: 3, name: 'Bé Bi', stars: 90, emoji: '🐰', medal: '🥉' },
  { rank: 4, name: 'Bé An', stars: 65, emoji: '🐼', medal: '⭐' },
];

export function ActivitiesSidebar({
  todayStars = 4,
  stagesCompletedToday = 1,
  arenaMatchesToday = 0,
  onClaimReward,
  isAuthenticated = true,
  onOpenAuthModal,
  childName,
}: ActivitiesSidebarProps) {
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [isChestOpened, setIsChestOpened] = useState(false);
  const [chestReward, setChestReward] = useState<number | null>(null);

  const quests: QuestItem[] = [
    {
      id: 'stars_5',
      title: 'Thu hoạch 5 Ngôi sao',
      icon: '⭐',
      current: todayStars,
      target: 5,
      rewardCoins: 15,
    },
    {
      id: 'stage_1',
      title: 'Vượt qua 1 ải toán',
      icon: '🏝️',
      current: stagesCompletedToday,
      target: 1,
      rewardCoins: 20,
    },
    {
      id: 'arena_1',
      title: 'Thử sức Đấu Trường 1vs1',
      icon: '🏟️',
      current: arenaMatchesToday,
      target: 1,
      rewardCoins: 25,
    },
  ];

  const handleClaimQuest = (quest: QuestItem) => {
    if (claimedQuests[quest.id] || quest.current < quest.target) return;
    defaultAudioManager.playSfx('cheer');
    setClaimedQuests((prev) => ({ ...prev, [quest.id]: true }));
    onClaimReward(quest.rewardCoins);
  };

  const handleOpenChest = () => {
    if (isChestOpened) return;
    defaultAudioManager.playSfx('cheer');
    const reward = Math.floor(Math.random() * 21) + 15; // 15 - 35 coins
    setChestReward(reward);
    setIsChestOpened(true);
    onClaimReward(reward);
  };

  const leaderboard = INITIAL_LEADERBOARD.map((item) => {
    if (item.name.includes('(Bạn)')) {
      if (!isAuthenticated) {
        return { ...item, name: 'Bé Học Thử (Khách)' };
      }
      if (childName) {
        return { ...item, name: `${childName} (Bạn)` };
      }
    }
    return item;
  });

  return (
    <aside
      data-testid="activities-sidebar"
      className="flex flex-col gap-5 w-full select-none"
      aria-label="Nhiệm vụ và bảng xếp hạng"
    >
      {/* If Guest: Show Locked Quest & Reward Preview with CTA */}
      {!isAuthenticated ? (
        <div
          data-testid="guest-activities-lock"
          className="bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-5 text-white shadow-lg border-4 border-amber-200 flex flex-col items-center text-center gap-3 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border-2 border-white/40 animate-bounce-gentle">
            🎁
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-100 block mb-0.5">
              Dành Riêng Cho Thành Viên
            </span>
            <h3 className="text-base font-black text-white">
              Nhiệm Vụ & Rương Quà
            </h3>
            <p className="text-xs font-bold text-amber-100 mt-1 leading-relaxed">
              Đăng nhập tài khoản để mở khóa nhiệm vụ nhận Xu mỗi ngày, mở Rương báu may mắn và lưu tên bé trên Bảng vinh danh!
            </p>
          </div>
          <button
            type="button"
            data-testid="guest-login-cta-btn"
            onClick={onOpenAuthModal}
            className="btn-3d w-full min-h-[48px] py-2.5 px-4 rounded-2xl bg-white text-orange-600 text-sm font-black shadow-md border-2 border-orange-200 hover:bg-orange-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>Đăng nhập để mở khóa</span>
          </button>
        </div>
      ) : (
        <>
          {/* 1. Daily Quests Card */}
          <div
            data-testid="daily-quests-card"
            className="bg-white rounded-3xl p-5 shadow-lg border-4 border-emerald-300 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-hidden="true">
                  🎯
                </span>
                <h3 className="text-base font-black text-slate-800">
                  Nhiệm Vụ Hôm Nay
                </h3>
              </div>
              <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Mỗi ngày
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {quests.map((quest) => {
                const isCompleted = quest.current >= quest.target;
                const isClaimed = claimedQuests[quest.id];
                const progressPercent = Math.min(
                  100,
                  Math.round((quest.current / quest.target) * 100)
                );

                return (
                  <div
                    key={quest.id}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      isClaimed
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : isCompleted
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-amber-50/40 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span>{quest.icon}</span>
                        <span>{quest.title}</span>
                      </span>
                      <span className="text-slate-500 font-bold">
                        {Math.min(quest.current, quest.target)}/{quest.target}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Action button */}
                    {isClaimed ? (
                      <span className="text-[11px] font-bold text-slate-400 block text-right">
                        ✓ Đã nhận thưởng
                      </span>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaimQuest(quest)}
                        className="btn-3d w-full min-h-[44px] py-1.5 px-3 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-white border-b-4 border-b-amber-600 text-slate-900 text-xs font-black shadow-md flex items-center justify-center gap-1.5 animate-pulse"
                      >
                        <span>🎁</span>
                        <span>Nhận thưởng +{quest.rewardCoins} 🪙</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Phần thưởng:</span>
                        <span className="text-amber-600 font-black">
                          +{quest.rewardCoins} Xu 🪙
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Daily Mystery Chest Card */}
          <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-lg border-4 border-purple-300 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

            <span className="text-xs font-black uppercase tracking-wider text-purple-200 mb-1">
              Quà Tặng May Mắn
            </span>
            <h4 className="text-base font-black mb-3">Rương Báu Hàng Ngày</h4>

            <button
              type="button"
              data-testid="mystery-chest-btn"
              disabled={isChestOpened}
              onClick={handleOpenChest}
              aria-label={
                isChestOpened
                  ? `Đã mở rương báu (+${chestReward} xu)`
                  : 'Mở rương kho báu may mắn'
              }
              className={`w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-3 border-white/60 shadow-inner flex items-center justify-center text-5xl cursor-pointer transition-transform duration-200 ${
                isChestOpened
                  ? 'opacity-80 scale-95'
                  : 'hover:scale-105 active:scale-95 animate-bounce-gentle'
              }`}
            >
              <span role="img" aria-hidden="true" className="drop-shadow-lg">
                {isChestOpened ? '💎' : '🎁'}
              </span>
            </button>

            {isChestOpened ? (
              <div className="mt-3 bg-white/20 px-3.5 py-1.5 rounded-full border border-white/40 text-xs font-black text-amber-200">
                🎉 Đã mở rương báu! (+{chestReward} xu)
              </div>
            ) : (
              <p className="text-xs font-bold text-purple-100 mt-2.5">
                👉 Bấm vào rương để mở quà xu!
              </p>
            )}
          </div>
        </>
      )}

      {/* 3. Mini Leaderboard Card */}
      <div
        data-testid="mini-leaderboard"
        className="bg-white rounded-3xl p-5 shadow-lg border-4 border-amber-300 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-hidden="true">
              🏆
            </span>
            <h3 className="text-base font-black text-slate-800">
              Vinh Danh Tuần
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Lớp 1</span>
        </div>

        <div className="flex flex-col gap-2">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center justify-between px-3 py-2 rounded-2xl border-2 transition-all ${
                item.name.includes('Bạn') || item.name.includes('Khách')
                  ? 'bg-amber-100/70 border-amber-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base font-black w-5 text-center">
                  {item.medal}
                </span>
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  {item.name}
                </span>
              </div>
              <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {item.stars} ⭐
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
