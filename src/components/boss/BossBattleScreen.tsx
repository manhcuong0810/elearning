'use client';

import React, { useState, useMemo } from 'react';
import { Stage, Question } from '@/types/curriculum';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';
import { QuestionPresenter } from '@/components/learning/QuestionPresenter';
import { BossHealthBar } from './BossHealthBar';

export interface BossVictoryRewards {
  stars: number;
  coins: number;
  exp: number;
  correctCount: number;
}

export interface BossBattleScreenProps {
  stage: Stage;
  onVictory: (rewards?: BossVictoryRewards) => void;
  onExit?: () => void;
  audioManager?: AudioManager;
}

const DEFAULT_PROMPT_AUDIO = '/audio/math/default_boss_prompt.mp3';

/**
 * Cute non-scary SVG illustration for the Boss (Quái Vật Kẹo Ngọt / Thần Cây Cổ Thụ)
 */
const CuteBossIllustration: React.FC<{
  bossName: string;
  isHit: boolean;
  isDefeated: boolean;
}> = ({ bossName, isHit, isDefeated }) => {
  const isTreeBoss = bossName.toLowerCase().includes('cây');

  return (
    <div
      data-testid="cute-boss-avatar"
      className={`relative flex flex-col items-center justify-center transition-transform duration-300 ${
        isHit ? 'scale-90 rotate-3' : 'scale-100'
      }`}
    >
      {isTreeBoss ? (
        <svg
          viewBox="0 0 160 160"
          className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-md"
          aria-label={bossName}
        >
          {/* Friendly Ancient Tree with smiling face */}
          <circle cx="80" cy="62" r="46" fill="#4ADE80" stroke="#16A34A" strokeWidth="5" />
          <circle cx="50" cy="70" r="28" fill="#86EFAC" />
          <circle cx="110" cy="70" r="28" fill="#86EFAC" />
          <rect x="62" y="95" width="36" height="48" rx="10" fill="#B45309" stroke="#78350F" strokeWidth="4" />
          {/* Cute eyes */}
          <circle cx="66" cy="65" r="6" fill="#1E293B" />
          <circle cx="94" cy="65" r="6" fill="#1E293B" />
          <circle cx="64" cy="63" r="2" fill="#FFFFFF" />
          <circle cx="92" cy="63" r="2" fill="#FFFFFF" />
          {/* Happy smile */}
          <path
            d={isDefeated ? 'M 68 82 Q 80 94 92 82' : 'M 66 80 Q 80 92 94 80'}
            fill="none"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Rosy cheeks */}
          <circle cx="54" cy="75" r="5" fill="#FB7185" opacity="0.7" />
          <circle cx="106" cy="75" r="5" fill="#FB7185" opacity="0.7" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 160 160"
          className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-md"
          aria-label={bossName}
        >
          {/* Cute Candy Monster */}
          <circle cx="80" cy="84" r="52" fill="#F472B6" stroke="#DB2777" strokeWidth="5" />
          {/* Candy horns / sprinkles */}
          <circle cx="48" cy="40" r="12" fill="#FACC15" stroke="#CA8A04" strokeWidth="4" />
          <circle cx="112" cy="40" r="12" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
          {/* Cute big eyes */}
          <circle cx="62" cy="78" r="10" fill="#FFFFFF" />
          <circle cx="98" cy="78" r="10" fill="#FFFFFF" />
          <circle cx="62" cy="78" r="5" fill="#1E293B" />
          <circle cx="98" cy="78" r="5" fill="#1E293B" />
          {/* Friendly smile */}
          <path
            d="M 62 102 Q 80 118 98 102"
            fill="none"
            stroke="#1E293B"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Cheeks */}
          <circle cx="46" cy="92" r="6" fill="#FB7185" />
          <circle cx="114" cy="92" r="6" fill="#FB7185" />
        </svg>
      )}
    </div>
  );
};

/**
 * Cute Cú Mèo Mascot Companion SVG
 */
const OwlMascotCompanion: React.FC<{ message: string }> = ({ message }) => (
  <div
    data-testid="owl-mascot-companion"
    className="flex items-center gap-3 bg-sky-50 border-2 border-sky-200 rounded-2xl px-4 py-3 shadow-sm"
  >
    <svg
      viewBox="0 0 80 80"
      className="w-12 h-12 shrink-0"
      aria-label="Linh vật Cú Mèo"
    >
      <circle cx="40" cy="42" r="28" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
      <circle cx="30" cy="36" r="9" fill="#FFFFFF" />
      <circle cx="50" cy="36" r="9" fill="#FFFFFF" />
      <circle cx="30" cy="36" r="4" fill="#0F172A" />
      <circle cx="50" cy="36" r="4" fill="#0F172A" />
      <polygon points="40,42 34,50 46,50" fill="#FACC15" />
    </svg>
    <p className="text-sm sm:text-base font-bold text-sky-900">{message}</p>
  </div>
);

export const BossBattleScreen: React.FC<BossBattleScreenProps> = ({
  stage,
  onVictory,
  onExit,
  audioManager = defaultAudioManager,
}) => {
  const bossDisplayName = stage.bossName || stage.name || 'Boss Tinh Nghịch';
  const questions = useMemo<Question[]>(() => {
    const rawQuestions = stage.questions ?? [];
    return rawQuestions.map((q) => ({
      ...q,
      promptAudioUrl: q.promptAudioUrl || DEFAULT_PROMPT_AUDIO,
    }));
  }, [stage.questions]);

  // Guard: maxHp must never exceed the number of available questions.
  // Each correct question reduces 1 HP. If maxHp > questions.length, the boss is mathematically unwinnable even with 100% correct answers.
  const maxHp = useMemo(() => {
    const qCount = questions.length;
    if (qCount <= 0) return 1;
    if (typeof stage.bossMaxHp === 'number' && stage.bossMaxHp > 0) {
      return Math.min(stage.bossMaxHp, qCount);
    }
    return qCount;
  }, [stage.bossMaxHp, questions.length]);

  const [currentHp, setCurrentHp] = useState<number>(maxHp);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [showMagicBeam, setShowMagicBeam] = useState<boolean>(false);
  const [battlePhase, setBattlePhase] = useState<'battling' | 'victory' | 'retry'>('battling');

  const currentQuestion = questions[currentQuestionIndex];

  const calculateRewards = (finalCorrectCount: number): BossVictoryRewards => {
    const totalCoins = questions.reduce((sum, q) => sum + (q.rewardCoins ?? 15), 0);
    const totalExp = questions.reduce((sum, q) => sum + (q.rewardExp ?? 30), 0);
    return {
      stars: stage.rewardStars ?? 3,
      coins: totalCoins || 45,
      exp: totalExp || 90,
      correctCount: finalCorrectCount,
    };
  };

  const handleQuestionAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const nextHp = Math.max(0, currentHp - 1);
      const nextCorrect = correctCount + 1;
      setCurrentHp(nextHp);
      setCorrectCount(nextCorrect);
      setShowMagicBeam(true);
      audioManager.playSfx('cheer');

      if (nextHp <= 0) {
        setBattlePhase('victory');
        return;
      }

      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Out of questions while Boss still has HP > 0
        setBattlePhase('retry');
      }
    }
  };

  const handleSkipOrNextQuestion = () => {
    setShowMagicBeam(false);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      if (currentHp <= 0) {
        setBattlePhase('victory');
      } else {
        setBattlePhase('retry');
      }
    }
  };

  const [victoryNotified, setVictoryNotified] = useState<boolean>(false);

  const handleRetryBattle = () => {
    audioManager.playSfx('click');
    setCurrentHp(maxHp);
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setShowMagicBeam(false);
    setVictoryNotified(false);
    setBattlePhase('battling');
  };

  const handleClaimVictory = () => {
    audioManager.playSfx('cheer');
    if (!victoryNotified) {
      setVictoryNotified(true);
      onVictory(calculateRewards(correctCount));
      onExit?.();
    }
  };

  if (battlePhase === 'victory') {
    const rewards = calculateRewards(correctCount);
    return (
      <div
        data-testid="boss-victory-screen"
        className="w-full max-w-3xl mx-auto bg-gradient-to-b from-amber-50 to-yellow-100 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center gap-6"
      >
        <div
          data-testid="treasure-chest-celebration"
          className="w-28 h-28 rounded-3xl bg-amber-200 border-4 border-amber-400 flex items-center justify-center text-6xl shadow-lg animate-bounce"
        >
          🎁
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900">
          🎉 Tuyệt Vời! Rương Báu Đã Mở! 🎉
        </h2>

        <p className="text-lg sm:text-xl font-bold text-amber-800 max-w-lg">
          Bé đã giải đúng các phép toán và kết bạn thành công với{' '}
          <span className="underline">{bossDisplayName}</span>!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 bg-white/90 px-6 py-4 rounded-2xl border-2 border-amber-300 shadow-sm">
          <div className="px-4 py-2 rounded-xl bg-yellow-100 font-extrabold text-amber-900 text-lg">
            ⭐ +{rewards.stars} Sao
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-100 font-extrabold text-amber-900 text-lg">
            🪙 +{rewards.coins} Xu
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-100 font-extrabold text-emerald-900 text-lg">
            ✨ +{rewards.exp} EXP
          </div>
        </div>

        <OwlMascotCompanion message="Oa! Bé giỏi toán quá! Cùng mở quà thôi nào!" />

        <button
          type="button"
          data-testid="claim-boss-reward-btn"
          onClick={handleClaimVictory}
          className="btn-3d btn-3d-green min-h-[56px] px-8 py-4 rounded-2xl text-white font-black text-2xl shadow-xl"
        >
          Nhận Kho Báu Ngay! 🎁
        </button>
      </div>
    );
  }

  if (battlePhase === 'retry') {
    return (
      <div
        data-testid="boss-encourage-retry-screen"
        className="w-full max-w-2xl mx-auto bg-gradient-to-b from-sky-50 to-amber-50 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-4 border-sky-300 border-b-[10px] border-b-sky-500 flex flex-col items-center text-center gap-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-5xl shadow-md animate-bounce-gentle">
          🦉
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
          🌟 Sắp Chinh Phục Được Rồi! 🌟
        </h2>

        <p className="text-lg sm:text-xl font-bold text-slate-700 max-w-md leading-relaxed">
          Cố lên nào! Cùng Cú Mèo nạp lại năng lượng và thử lại nhé!
        </p>

        <OwlMascotCompanion message="Mỗi lần luyện tập là bé lại thông minh hơn một chút đấy! Mình làm lại nhé!" />

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            data-testid="boss-retry-btn"
            onClick={handleRetryBattle}
            className="btn-3d btn-3d-yellow min-h-[56px] px-8 py-4 rounded-2xl text-amber-950 font-black text-xl shadow-xl"
          >
            🔄 Thử lại ngay
          </button>

          {onExit && (
            <button
              type="button"
              data-testid="boss-exit-btn"
              onClick={onExit}
              className="btn-3d btn-3d-white min-h-[56px] px-6 py-4 rounded-2xl text-slate-700 font-black text-lg shadow-md"
            >
              Về Bản Đồ
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="boss-battle-screen"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6"
    >
      {/* Top Bar: Boss Health & Optional Exit */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-sm sm:text-base">
            ⚡ Thử Thách Trùm Cuối Vùng
          </span>
          {onExit && (
            <button
              type="button"
              data-testid="boss-header-exit-btn"
              onClick={onExit}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border-2 border-slate-300 text-sm"
            >
              Tạm nghỉ
            </button>
          )}
        </div>

        <BossHealthBar
          currentHp={currentHp}
          maxHp={maxHp}
          bossName={bossDisplayName}
        />
      </div>

      {/* Arena Visual Stage: Cute Boss + Magic Rainbow Beam + Mascot */}
      <div className="relative bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 rounded-3xl p-5 border-4 border-sky-200 shadow-inner flex flex-col sm:flex-row items-center justify-around gap-4">
        <OwlMascotCompanion
          message={
            showMagicBeam
              ? 'Tuyệt chiêu Cầu Vồng Toán Học! Trúng phóc rồi!'
              : `Giải toán đúng để phóng tia năng lượng vui vẻ tới ${bossDisplayName} nhé!`
          }
        />

        {showMagicBeam && (
          <div
            data-testid="magic-beam-attack"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 text-slate-900 font-extrabold text-sm sm:text-base shadow-md animate-pulse"
          >
            🌈✨ Tia Phép Toán Học! (-1 ❤️)
          </div>
        )}

        <CuteBossIllustration
          bossName={bossDisplayName}
          isHit={showMagicBeam}
          isDefeated={currentHp <= 0}
        />
      </div>

      {/* Active Math Question */}
      {currentQuestion && (
        <div className="flex flex-col items-center gap-4">
          <QuestionPresenter
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            audioManager={audioManager}
          />

          <button
            type="button"
            data-testid="boss-skip-question-btn"
            onClick={handleSkipOrNextQuestion}
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-base border-2 border-amber-300 transition-colors"
          >
            Câu tiếp theo ➡️
          </button>
        </div>
      )}
    </div>
  );
};
