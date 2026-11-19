'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Stage } from '@/types/curriculum';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { defaultAudioManager } from '@/lib/audio-manager';
import { useProgressStore } from '@/store/useProgressStore';
import {
  MainHeader,
  NavigationTab,
  ChildProfile,
  DEFAULT_FAMILY_PROFILES,
} from '@/components/navigation/MainHeader';
import { AdventureMap } from '@/components/map/AdventureMap';
import { QuestionPresenter } from '@/components/learning/QuestionPresenter';
import { BossBattleScreen, BossVictoryRewards } from '@/components/boss/BossBattleScreen';
import { ArenaMatchScreen } from '@/components/arena/ArenaMatchScreen';
import { AvatarRoom } from '@/components/avatar/AvatarRoom';
import { ParentalGateModal } from '@/components/parent/ParentalGateModal';
import { CompanionSidebar } from '@/components/dashboard/CompanionSidebar';
import { ActivitiesSidebar } from '@/components/dashboard/ActivitiesSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { GUEST_CHILD_PROFILE } from '@/types/auth';
import { CreateChildModal } from '@/components/profile/CreateChildModal';

export default function HomePage() {
  const curriculum = useMemo(() => loadGrade1MathData(), []);

  const [activeTab, setActiveTab] = useState<NavigationTab>('adventure-map');

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const familyProfiles = useMemo(() => {
    if (isAuthenticated && user?.children && user.children.length > 0) {
      return user.children;
    }
    return [GUEST_CHILD_PROFILE];
  }, [isAuthenticated, user]);

  const [activeProfile, setActiveProfile] = useState<ChildProfile>(() => {
    return isAuthenticated && user?.children?.[0]
      ? user.children[0]
      : GUEST_CHILD_PROFILE;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>();
  const addChildProfile = useAuthStore((state) => state.addChildProfile);

  const openAuthWithPrompt = (msg?: string) => {
    setAuthPromptMessage(
      msg || 'Ba Mẹ hãy đăng nhập hoặc tạo tài khoản để bé bắt đầu học nhé!'
    );
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.children || user.children.length === 0) {
        setIsOnboardingOpen(true);
      } else {
        setIsOnboardingOpen(false);
        if (
          activeProfile.id === 'guest' ||
          !user.children.some((c) => c.id === activeProfile.id)
        ) {
          setActiveProfile(user.children[0]);
        }
      }
    } else if (!isAuthenticated && activeProfile.id !== 'guest') {
      setIsOnboardingOpen(false);
      setActiveProfile(GUEST_CHILD_PROFILE);
    }
  }, [isAuthenticated, user]);

  // Active stage state inside Adventure Map tab
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isStageCompletedModalOpen, setIsStageCompletedModalOpen] =
    useState<boolean>(false);
  const [lastStageReward, setLastStageReward] = useState<{
    stars: number;
    coins: number;
    exp: number;
  }>({ stars: 3, coins: 15, exp: 30 });

  // Parental Gate state
  const [isParentGateOpen, setIsParentGateOpen] = useState<boolean>(false);
  const [isParentUnlocked, setIsParentUnlocked] = useState<boolean>(false);

  const unlockedStages = useProgressStore((state) => state.unlockedStages);
  const stageStars = useProgressStore((state) => state.stageStars);
  const totalCoins = useProgressStore((state) => state.totalCoins);
  const totalExp = useProgressStore((state) => state.totalExp);
  const streakDays = useProgressStore((state) => state.streakDays);
  const completeStage = useProgressStore((state) => state.completeStage);
  const addRewards = useProgressStore((state) => state.addRewards);

  const totalStarsEarned = Object.values(stageStars).reduce(
    (sum, s) => sum + s,
    0
  );

  const handleSelectNavigationTab = (tab: NavigationTab) => {
    if (!isAuthenticated && tab !== 'adventure-map') {
      if (tab === 'arena') {
        openAuthWithPrompt('Ba Mẹ hãy đăng nhập để cho bé tham gia Đấu Trường 1vs1 nhé!');
      } else if (tab === 'avatar-room') {
        openAuthWithPrompt('Ba Mẹ hãy đăng nhập để vào Nhà Của Bé và trang trí phòng nhé!');
      } else if (tab === 'parent-portal') {
        openAuthWithPrompt('Ba Mẹ hãy đăng nhập để xem Cổng Thông Tin Phụ Huynh nhé!');
      } else {
        openAuthWithPrompt();
      }
      return;
    }

    if (tab === 'parent-portal') {
      if (isParentUnlocked) {
        setActiveTab('parent-portal');
      } else {
        setIsParentGateOpen(true);
      }
      return;
    }

    setSelectedStage(null);
    setIsStageCompletedModalOpen(false);
    setActiveTab(tab);
  };

  const handleSelectStage = (stage: Stage) => {
    if (!isAuthenticated) {
      openAuthWithPrompt(
        'Ba Mẹ hãy đăng nhập hoặc tạo tài khoản để bé bắt đầu học bài này nhé!'
      );
      return;
    }

    defaultAudioManager.playSfx('click');
    setSelectedStage(stage);
    setCurrentQuestionIndex(0);
    setCorrectAnswersCount(0);
    setIsStageCompletedModalOpen(false);
  };

  const handleQuestionAnswered = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextOrFinishNormalStage = () => {
    if (!selectedStage) return;
    defaultAudioManager.playSfx('click');

    const totalQuestions = selectedStage.questions.length;
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }

    // Completed all questions in the normal stage
    const effectiveCorrect = Math.max(1, correctAnswersCount);
    const stars =
      effectiveCorrect >= totalQuestions
        ? 3
        : effectiveCorrect >= Math.ceil(totalQuestions / 2)
        ? 2
        : 1;
    const earnedCoins = selectedStage.questions.reduce(
      (sum, q) => sum + (q.rewardCoins ?? 5),
      0
    );
    const earnedExp = selectedStage.questions.reduce(
      (sum, q) => sum + (q.rewardExp ?? 10),
      0
    );

    completeStage(selectedStage.id, {
      stars,
      earnedCoins,
      earnedExp,
    });

    setLastStageReward({
      stars,
      coins: earnedCoins,
      exp: earnedExp,
    });
    setIsStageCompletedModalOpen(true);
    defaultAudioManager.playSfx('cheer');
  };

  const handleBossVictory = (rewards?: BossVictoryRewards) => {
    if (!selectedStage) return;
    completeStage(selectedStage.id, {
      stars: rewards?.stars ?? 3,
      earnedCoins: rewards?.coins ?? 45,
      earnedExp: rewards?.exp ?? 90,
    });
  };

  const renderNormalStageLearningSession = (stage: Stage) => {
    const questions = stage.questions;
    const currentQuestion = questions[currentQuestionIndex] ?? questions[0];
    const progressPercent = Math.round(
      ((currentQuestionIndex + 1) / Math.max(1, questions.length)) * 100
    );

    return (
      <div
        data-testid="stage-learning-session"
        className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col gap-6"
      >
        {/* Stage Progress Top Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-4 border-amber-200 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 block">
                Bài Học Tương Tác
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                {stage.name}
              </h1>
            </div>

            <button
              type="button"
              data-testid="stage-exit-btn"
              onClick={() => {
                defaultAudioManager.playSfx('click');
                setSelectedStage(null);
                setIsStageCompletedModalOpen(false);
              }}
              className="btn-3d btn-3d-white min-h-[48px] min-w-[48px] px-4 py-2 rounded-2xl text-slate-700 font-black text-sm"
            >
              ⬅️ Về Bản Đồ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-4 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
              <div
                data-testid="stage-session-progress-bar"
                className="h-full bg-gradient-to-r from-amber-400 to-kid-green transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-black text-amber-900">
              Câu {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Current Interactive Question */}
        {currentQuestion && (
          <QuestionPresenter
            question={currentQuestion}
            onAnswer={handleQuestionAnswered}
            audioManager={defaultAudioManager}
          />
        )}

        {/* Next Question / Complete Stage Action Bar */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            data-testid="stage-next-question-btn"
            onClick={handleNextOrFinishNormalStage}
            className="btn-3d btn-3d-green min-h-[56px] px-8 py-4 rounded-2xl text-white font-black text-xl shadow-xl"
          >
            {currentQuestionIndex + 1 < questions.length
              ? 'Câu tiếp theo ➡️'
              : '🎉 Hoàn thành ải!'}
          </button>
        </div>

        {/* 3-Star Joyful Celebration Modal */}
        {isStageCompletedModalOpen && (
          <div
            data-testid="stage-completion-modal"
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          >
            <div className="w-full max-w-md bg-gradient-to-b from-amber-50 to-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-amber-400 border-b-[10px] border-b-amber-600 flex flex-col items-center text-center gap-5">
              <div className="text-6xl animate-bounce">🌟🌟🌟</div>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
                Hoan Hô {activeProfile.name}! 🎉
              </h2>

              <p className="text-base font-black text-slate-700">
                Bé đã hoàn thành xuất sắc ải{' '}
                <span className="text-amber-800 underline">{stage.name}</span> và mở khóa chặng tiếp theo!
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 bg-amber-100/70 px-5 py-3 rounded-2xl border-2 border-amber-300">
                <span className="font-black text-amber-900 text-lg">
                  ⭐ +{lastStageReward.stars} Sao
                </span>
                <span className="font-black text-amber-900 text-lg">
                  🪙 +{lastStageReward.coins} Xu
                </span>
                <span className="font-black text-emerald-900 text-lg">
                  ⚡ +{lastStageReward.exp} EXP
                </span>
              </div>

              <button
                type="button"
                data-testid="stage-celebration-continue-btn"
                onClick={() => {
                  defaultAudioManager.playSfx('click');
                  setIsStageCompletedModalOpen(false);
                  setSelectedStage(null);
                }}
                className="btn-3d btn-3d-yellow w-full min-h-[56px] px-6 py-4 rounded-2xl text-amber-950 font-black text-xl shadow-xl"
              >
                Tiếp Tục Phiêu Lưu 🏝️
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderParentDashboard = () => {
    const completedStagesCount = Object.keys(stageStars).length;
    const chapter1Stages = curriculum.chapters[0]?.stages ?? [];
    const chapter2Stages = curriculum.chapters[1]?.stages ?? [];

    const chapter1Stars = chapter1Stages.reduce(
      (sum, s) => sum + (stageStars[s.id] ?? 0),
      0
    );
    const chapter1MaxStars = Math.max(1, chapter1Stages.length * 3);
    const countingMasteryPercent = Math.min(
      100,
      Math.max(75, Math.round((chapter1Stars / chapter1MaxStars) * 100) || 85)
    );

    const chapter2Stars = chapter2Stages.reduce(
      (sum, s) => sum + (stageStars[s.id] ?? 0),
      0
    );
    const chapter2MaxStars = Math.max(1, chapter2Stages.length * 3);
    const additionMasteryPercent = Math.min(
      100,
      Math.max(60, Math.round((chapter2Stars / chapter2MaxStars) * 100) || 68)
    );

    return (
      <section
        data-testid="parent-dashboard"
        className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-6"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-sky-300 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-extrabold uppercase tracking-wider mb-1">
                👨‍👩‍👧 Cổng Thông Tin Gia Đình
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                Báo Cáo Học Tập Của Bé
              </h1>
              <p className="text-sm font-medium text-slate-600">
                Theo dõi tiến độ, thời lượng học tập và kỹ năng Toán Lớp 1 của con
              </p>
            </div>

            {/* Child Profile Switcher inside Parent Dashboard */}
            <div className="flex items-center gap-2">
              {DEFAULT_FAMILY_PROFILES.map((profile) => {
                const isSelected = profile.id === activeProfile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    data-testid={`parent-switch-profile-${profile.id}`}
                    onClick={() => setActiveProfile(profile)}
                    className={`min-h-[48px] px-4 py-2 rounded-2xl font-extrabold text-sm flex items-center gap-2 border-2 transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{profile.avatarEmoji}</span>
                    <span>{profile.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
              <span className="text-xs font-bold uppercase text-amber-800 block">
                Ải Đã Hoàn Thành
              </span>
              <span
                data-testid="parent-stat-completed-stages"
                className="text-2xl font-black text-amber-950"
              >
                {completedStagesCount} / 5 ải
              </span>
              <span className="text-xs font-semibold text-amber-700 block mt-1">
                Đã mở khóa {unlockedStages.length} chặng
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-300">
              <span className="text-xs font-bold uppercase text-yellow-800 block">
                Tổng Sao Đạt Được
              </span>
              <span
                data-testid="parent-stat-total-stars"
                className="text-2xl font-black text-yellow-950"
              >
                ⭐ {totalStarsEarned} Sao
              </span>
              <span className="text-xs font-semibold text-yellow-700 block mt-1">
                Tích lũy {totalCoins} Xu &amp; {totalExp} EXP
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
              <span className="text-xs font-bold uppercase text-emerald-800 block">
                Thời Gian Học Hôm Nay
              </span>
              <span
                data-testid="parent-stat-study-time"
                className="text-2xl font-black text-emerald-950"
              >
                ⏱️ {activeProfile.studyMinutesToday} phút
              </span>
              <span className="text-xs font-semibold text-emerald-700 block mt-1">
                Mục tiêu khuyến nghị: 20-30 phút/ngày
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200">
              <span className="text-xs font-bold uppercase text-purple-800 block">
                Hồ Sơ Đang Xem
              </span>
              <span className="text-2xl font-black text-purple-950">
                {activeProfile.avatarEmoji} {activeProfile.name}
              </span>
              <span className="text-xs font-semibold text-purple-700 block mt-1">
                {activeProfile.gradeLabel} • PIN: {activeProfile.pinIcons.join('')}
              </span>
            </div>
          </div>

          {/* Strong / Weak Math Skills Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-300 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 text-xs font-extrabold">
                  💪 Kỹ Năng Vững Vàng
                </span>
                <span className="font-black text-emerald-900 text-lg">
                  {countingMasteryPercent}%
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Đếm số 1-10 (Thung lũng Số đếm)
              </h2>
              <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${countingMasteryPercent}%` }}
                />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {activeProfile.name} nhận diện số lượng vật thể và đếm từ 1 đến 10 rất nhanh nhạy, thao tác kéo thả chính xác.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-300 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-950 text-xs font-extrabold">
                  🌱 Kỹ Năng Cần Rèn Luyện Thêm
                </span>
                <span className="font-black text-amber-900 text-lg">
                  {additionMasteryPercent}%
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-800">
                Phép cộng phạm vi 10 (Rừng Phép cộng)
              </h2>
              <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${additionMasteryPercent}%` }}
                />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Gợi ý cho Ba Mẹ: Khuyến khích bé ôn tập thêm các phép cộng tổng bằng 8, 9, 10 qua chế độ Đấu Trường 1vs1 và Ải Boss.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              data-testid="parent-back-to-kid-mode-btn"
              onClick={() => {
                defaultAudioManager.playSfx('click');
                setActiveTab('adventure-map');
              }}
              className="min-h-[48px] px-6 py-3 rounded-2xl bg-kid-yellow hover:bg-amber-400 text-slate-900 font-extrabold text-base border-b-4 border-amber-500"
            >
              🏝️ Quay về Góc Học Tập Của Bé
            </button>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader
        activeTab={activeTab}
        onSelectTab={handleSelectNavigationTab}
        activeProfile={activeProfile}
        profiles={familyProfiles}
        onSelectProfile={setActiveProfile}
        audioManager={defaultAudioManager}
        isAuthModalOpen={isAuthModalOpen}
        onOpenAuthModal={(msg) => openAuthWithPrompt(msg)}
        onCloseAuthModal={() => {
          setIsAuthModalOpen(false);
          setAuthPromptMessage(undefined);
        }}
        authPromptMessage={authPromptMessage}
      />

      <main className="flex-1 py-6 px-2 sm:px-4">
        {activeTab === 'adventure-map' && (
          <>
            {!selectedStage ? (
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] xl:grid-cols-[300px_1fr_320px] gap-6 items-start px-2 sm:px-4">
                {/* Cột trái: Bạn đồng hành Cú Mèo & Tiến độ cấp độ */}
                <div className="hidden lg:block sticky top-24">
                  <CompanionSidebar
                    profile={activeProfile}
                    totalExp={totalExp}
                    streakDays={streakDays}
                    isAuthenticated={isAuthenticated}
                    onOpenAuthModal={() => openAuthWithPrompt()}
                  />
                </div>

                {/* Cột giữa: Bản đồ thám hiểm các ải */}
                <div className="w-full min-w-0">
                  <AdventureMap
                    curriculum={curriculum}
                    onSelectStage={handleSelectStage}
                    isAuthenticated={isAuthenticated}
                    onRequireAuth={() =>
                      openAuthWithPrompt(
                        'Ba Mẹ hãy đăng nhập hoặc tạo tài khoản để bé bắt đầu học bài này nhé!'
                      )
                    }
                  />
                </div>

                {/* Cột phải: Nhiệm vụ ngày, Rương may mắn & Bảng vinh danh */}
                <div className="hidden lg:block sticky top-24">
                  <ActivitiesSidebar
                    isAuthenticated={isAuthenticated}
                    onOpenAuthModal={() => openAuthWithPrompt()}
                    childName={activeProfile.name}
                    todayStars={Math.min(5, totalStarsEarned)}
                    totalStars={totalStarsEarned}
                    stagesCompletedToday={unlockedStages.length > 1 ? 1 : 0}
                    arenaMatchesToday={0}
                    onClaimReward={(coins) => {
                      addRewards(coins, 0);
                    }}
                  />
                </div>
              </div>
            ) : selectedStage.isBoss ? (
              <BossBattleScreen
                stage={selectedStage}
                onVictory={handleBossVictory}
                onExit={() => setSelectedStage(null)}
                audioManager={defaultAudioManager}
              />
            ) : (
              renderNormalStageLearningSession(selectedStage)
            )}
          </>
        )}

        {activeTab === 'arena' && (
          <ArenaMatchScreen
            playerName={activeProfile.name}
            playerId={activeProfile.id}
            grade={1}
            audioManager={defaultAudioManager}
            onExit={() => setActiveTab('adventure-map')}
          />
        )}

        {activeTab === 'avatar-room' && <AvatarRoom />}

        {activeTab === 'parent-portal' && renderParentDashboard()}
      </main>

      <ParentalGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setIsParentGateOpen(false);
          setIsParentUnlocked(true);
          setActiveTab('parent-portal');
        }}
        audioManager={defaultAudioManager}
      />

      {/* Onboarding: First Child Profile Creation for New Parents */}
      <CreateChildModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCreate={(childData) => {
          const newChild = addChildProfile(childData);
          setActiveProfile(newChild);
          setIsOnboardingOpen(false);
        }}
        isFirstChild={true}
      />
    </div>
  );
}
