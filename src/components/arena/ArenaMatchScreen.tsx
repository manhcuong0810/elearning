'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question } from '@/types/curriculum';
import { loadGrade1MathData } from '@/lib/curriculum-loader';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';
import {
  ArenaMatchmaker,
  ArenaMatch,
  DEFAULT_ARENA_TOTAL_STEPS,
} from '@/lib/arena-matchmaker';
import { QuestionPresenter } from '@/components/learning/QuestionPresenter';
import { useProgressStore } from '@/store/useProgressStore';

export interface ArenaMatchScreenProps {
  playerName?: string;
  playerId?: string;
  grade?: number;
  questions?: Question[];
  audioManager?: AudioManager;
  onExit?: () => void;
}

export interface PresetEmote {
  id: string;
  testId: string;
  label: string;
}

export const SAFE_PRESET_EMOTES: PresetEmote[] = [
  { id: 'hello', testId: 'arena-emote-hello', label: '👋 Chào bạn' },
  { id: 'cheer', testId: 'arena-emote-cheer', label: '🎉 Tuyệt quá' },
  { id: 'fighting', testId: 'arena-emote-fighting', label: '💪 Cố lên' },
];

const DEFAULT_PROMPT_AUDIO = '/audio/math/default_arena_prompt.mp3';

/**
 * Extracts 5 fun Grade 1 Math questions for the 1vs1 race
 */
function getDefaultArenaQuestions(): Question[] {
  try {
    const curriculum = loadGrade1MathData();
    const pool: Question[] = [];
    for (const chapter of curriculum.chapters) {
      for (const stage of chapter.stages) {
        for (const q of stage.questions) {
          pool.push({
            ...q,
            promptAudioUrl: q.promptAudioUrl || DEFAULT_PROMPT_AUDIO,
          });
        }
      }
    }
    if (pool.length >= DEFAULT_ARENA_TOTAL_STEPS) {
      return pool.slice(0, DEFAULT_ARENA_TOTAL_STEPS);
    }
  } catch {
    // Fallback static questions if curriculum fails to load
  }

  return [
    {
      id: 'arena_fallback_1',
      type: 'MULTIPLE_CHOICE',
      promptText: '2 + 1 bằng mấy nhỉ?',
      promptAudioUrl: DEFAULT_PROMPT_AUDIO,
      options: [
        { id: 'o1', text: '3', isCorrect: true },
        { id: 'o2', text: '4', isCorrect: false },
      ],
      rewardCoins: 10,
      rewardExp: 20,
    },
    {
      id: 'arena_fallback_2',
      type: 'MULTIPLE_CHOICE',
      promptText: '3 + 2 bằng mấy nhỉ?',
      promptAudioUrl: DEFAULT_PROMPT_AUDIO,
      options: [
        { id: 'o1', text: '5', isCorrect: true },
        { id: 'o2', text: '4', isCorrect: false },
      ],
      rewardCoins: 10,
      rewardExp: 20,
    },
    {
      id: 'arena_fallback_3',
      type: 'MULTIPLE_CHOICE',
      promptText: '4 + 1 bằng mấy nhỉ?',
      promptAudioUrl: DEFAULT_PROMPT_AUDIO,
      options: [
        { id: 'o1', text: '5', isCorrect: true },
        { id: 'o2', text: '6', isCorrect: false },
      ],
      rewardCoins: 10,
      rewardExp: 20,
    },
    {
      id: 'arena_fallback_4',
      type: 'MULTIPLE_CHOICE',
      promptText: '5 + 2 bằng mấy nhỉ?',
      promptAudioUrl: DEFAULT_PROMPT_AUDIO,
      options: [
        { id: 'o1', text: '7', isCorrect: true },
        { id: 'o2', text: '6', isCorrect: false },
      ],
      rewardCoins: 10,
      rewardExp: 20,
    },
    {
      id: 'arena_fallback_5',
      type: 'MULTIPLE_CHOICE',
      promptText: '6 + 3 bằng mấy nhỉ?',
      promptAudioUrl: DEFAULT_PROMPT_AUDIO,
      options: [
        { id: 'o1', text: '9', isCorrect: true },
        { id: 'o2', text: '8', isCorrect: false },
      ],
      rewardCoins: 10,
      rewardExp: 20,
    },
  ];
}

export const ArenaMatchScreen: React.FC<ArenaMatchScreenProps> = ({
  playerName = 'Hiệp Sĩ Nhí',
  playerId = 'child_1',
  grade = 1,
  questions: customQuestions,
  audioManager = defaultAudioManager,
  onExit,
}) => {
  const arenaQuestions = useMemo<Question[]>(() => {
    const base =
      customQuestions && customQuestions.length > 0
        ? customQuestions
        : getDefaultArenaQuestions();

    const normalized = base.map((q) => ({
      ...q,
      promptAudioUrl: q.promptAudioUrl || DEFAULT_PROMPT_AUDIO,
    }));

    // Ensure 5 race questions by repeating if fewer than 5 were passed
    const filled: Question[] = [];
    for (let i = 0; i < DEFAULT_ARENA_TOTAL_STEPS; i++) {
      const item = normalized[i % normalized.length];
      filled.push({
        ...item,
        id: i < normalized.length ? item.id : `${item.id}_step_${i + 1}`,
      });
    }
    return filled;
  }, [customQuestions]);

  const totalSteps = DEFAULT_ARENA_TOTAL_STEPS;

  const [phase, setPhase] = useState<'lobby' | 'searching' | 'racing' | 'podium'>('lobby');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(10);
  const [match, setMatch] = useState<ArenaMatch | null>(null);

  const [playerStep, setPlayerStep] = useState<number>(0);
  const [opponentStep, setOpponentStep] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [playerEmote, setPlayerEmote] = useState<string | null>(null);
  const [opponentEmote, setOpponentEmote] = useState<string | null>(null);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [earnedRewards, setEarnedRewards] = useState<{ coins: number; exp: number }>({
    coins: 0,
    exp: 0,
  });

  const matchmakerRef = useRef<ArenaMatchmaker | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopBotSimRef = useRef<(() => void) | null>(null);
  const matchFinishedRef = useRef<boolean>(false);

  const clearTimers = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (stopBotSimRef.current) {
      stopBotSimRef.current();
      stopBotSimRef.current = null;
    }
    if (matchmakerRef.current) {
      matchmakerRef.current.cancelSearch();
    }
  };

  useEffect(() => {
    matchmakerRef.current = new ArenaMatchmaker();
    return () => {
      clearTimers();
    };
  }, []);

  const finishRace = (raceWinner: 'player' | 'opponent', finalPlayerStep: number) => {
    if (matchFinishedRef.current) return;
    matchFinishedRef.current = true;

    if (stopBotSimRef.current) {
      stopBotSimRef.current();
      stopBotSimRef.current = null;
    }

    const isFirstPlace = raceWinner === 'player';
    const coins = isFirstPlace ? 30 : Math.max(15, finalPlayerStep * 5 + 10);
    const exp = isFirstPlace ? 60 : Math.max(30, finalPlayerStep * 10 + 20);

    // Immediately persist rewards to local progress store so offline/disconnects never lose coins/exp
    useProgressStore.getState().addRewards(coins, exp);

    setWinner(raceWinner);
    setEarnedRewards({ coins, exp });
    setPhase('podium');
    audioManager.playSfx('cheer');
  };

  const handleStartSearch = () => {
    audioManager.playSfx('click');
    clearTimers();

    setPhase('searching');
    setCountdownSeconds(10);
    setPlayerStep(0);
    setOpponentStep(0);
    setCurrentQuestionIndex(0);
    setPlayerEmote(null);
    setOpponentEmote(null);
    setWinner(null);
    matchFinishedRef.current = false;

    countdownIntervalRef.current = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    if (!matchmakerRef.current) {
      matchmakerRef.current = new ArenaMatchmaker();
    }

    matchmakerRef.current.startSearch(
      { playerId, playerName, grade },
      (foundMatch) => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        setMatch(foundMatch);
        setPhase('racing');
        setOpponentEmote('👋 Chào bạn');

        if (foundMatch.opponent.isBot && matchmakerRef.current) {
          stopBotSimRef.current = matchmakerRef.current.simulateBotProgress(
            (botNewStep) => {
              if (matchFinishedRef.current) return;
              setOpponentStep(botNewStep);
              if (botNewStep >= totalSteps) {
                finishRace('opponent', playerStep);
              }
            },
            { totalSteps, minDelayMs: 4000, maxDelayMs: 7000 }
          );
        }
      }
    );
  };

  const handleCancelSearch = () => {
    audioManager.playSfx('click');
    clearTimers();
    setPhase('lobby');
  };

  const handleSendEmote = (emote: PresetEmote) => {
    audioManager.playSfx('pop');
    setPlayerEmote(emote.label);

    if (match?.opponent.isBot) {
      const botReplies = ['👋 Chào bạn', '🎉 Tuyệt quá', '💪 Cố lên'];
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      setOpponentEmote(reply);
    }
  };

  const handleQuestionAnswer = (isCorrect: boolean) => {
    if (!isCorrect || matchFinishedRef.current) {
      return;
    }

    const nextStep = Math.min(totalSteps, playerStep + 1);
    setPlayerStep(nextStep);

    if (nextStep >= totalSteps) {
      finishRace('player', nextStep);
    } else {
      setCurrentQuestionIndex((prev) => Math.min(arenaQuestions.length - 1, prev + 1));
    }
  };

  // 1. LOBBY STATE
  if (phase === 'lobby') {
    return (
      <div
        data-testid="arena-lobby-screen"
        className="w-full max-w-3xl mx-auto bg-gradient-to-b from-sky-50 via-indigo-50 to-amber-50 rounded-3xl p-6 sm:p-10 shadow-xl border-4 border-sky-300 flex flex-col items-center text-center gap-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-amber-200 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-md">
          🏁
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800">
          Đấu Trường Tri Thức 1vs1
        </h1>

        <p className="text-lg sm:text-xl font-bold text-slate-700 max-w-lg leading-relaxed">
          Cùng thi đua giải nhanh 5 câu đố Toán Lớp 1 trên đường đua sắc màu và nhận thật nhiều Xu vàng nhé!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            data-testid="arena-start-search-btn"
            onClick={handleStartSearch}
            className="btn-3d btn-3d-green min-h-[56px] min-w-[220px] px-8 py-4 rounded-2xl text-white font-black text-2xl shadow-xl"
          >
            🚀 Tìm bạn cùng thi tài
          </button>

          {onExit && (
            <button
              type="button"
              data-testid="arena-exit-btn"
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

  // 2. MATCHMAKING / SEARCHING STATE (MAX 10 SECONDS)
  if (phase === 'searching') {
    return (
      <div
        data-testid="arena-searching-state"
        className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-4 border-amber-300 flex flex-col items-center text-center gap-6"
      >
        <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-5xl animate-bounce">
          🔍
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Đang tìm bạn nhỏ cùng thi tài...
        </h2>

        <p className="text-base sm:text-lg font-bold text-slate-600">
          Chuẩn bị sẵn sàng nhé {playerName} ơi! Cuộc đua sắp bắt đầu rồi!
        </p>

        <div
          data-testid="arena-search-countdown"
          className="px-6 py-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-2xl font-extrabold text-amber-900"
        >
          ⏳ {countdownSeconds} giây
        </div>

        <button
          type="button"
          data-testid="arena-cancel-search-btn"
          onClick={handleCancelSearch}
          className="min-h-[48px] px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base border-2 border-slate-300"
        >
          Dừng tìm bạn
        </button>
      </div>
    );
  }

  // 3. PODIUM / FINISH STATE (1ST OR 2ND PLACE - ALWAYS ENCOURAGING)
  if (phase === 'podium') {
    const isFirstPlace = winner === 'player';
    const opponentName = match?.opponent.playerName ?? 'Bạn Gấu Trúc';
    const opponentAvatar = match?.opponent.avatar ?? '🐼';

    return (
      <div
        data-testid="arena-podium-screen"
        className="w-full max-w-3xl mx-auto bg-gradient-to-b from-amber-50 via-yellow-50 to-sky-50 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-400 flex flex-col items-center text-center gap-6"
      >
        <div className="w-28 h-28 rounded-3xl bg-amber-200 border-4 border-amber-400 flex items-center justify-center text-6xl shadow-lg animate-bounce">
          {isFirstPlace ? '🏆' : '🌟'}
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-900">
          {isFirstPlace
            ? '🎉 Tuyệt Vời! Bé Về Đích Hạng Nhất! 🎉'
            : '🌟 Hoan Hô! Bé Đạt Giải Nhì Xuất Sắc! 🌟'}
        </h2>

        <p className="text-lg sm:text-xl font-bold text-slate-700 max-w-lg leading-relaxed">
          {isFirstPlace
            ? `Chúc mừng ${playerName}! Bé tính nhẩm siêu nhanh và về đích thật ấn tượng cùng ${opponentName}!`
            : `${playerName} làm tốt lắm! Bé và ${opponentName} đã có một cuộc đua thật vui. Cùng rèn luyện thêm để lần sau chạy nhanh hơn nữa nhé!`}
        </p>

        {/* Podium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦸</span>
              <div className="text-left">
                <p className="font-extrabold text-slate-800">{playerName}</p>
                <p className="text-sm font-bold text-amber-700">
                  {isFirstPlace ? '🥇 Hạng 1' : '🥈 Hạng 2'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-lg text-emerald-700">
              {playerStep}/{totalSteps} câu
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border-2 border-sky-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{opponentAvatar}</span>
              <div className="text-left">
                <p className="font-extrabold text-slate-800">{opponentName}</p>
                <p className="text-sm font-bold text-sky-700">
                  {isFirstPlace ? '🥈 Hạng 2' : '🥇 Hạng 1'}
                </p>
              </div>
            </div>
            <span className="font-extrabold text-lg text-sky-700">
              {opponentStep}/{totalSteps} câu
            </span>
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white px-6 py-4 rounded-2xl border-2 border-amber-300 shadow-sm">
          <div
            data-testid="arena-reward-coins"
            className="px-4 py-2 rounded-xl bg-amber-100 font-extrabold text-amber-900 text-lg"
          >
            🪙 +{earnedRewards.coins} Xu
          </div>
          <div
            data-testid="arena-reward-exp"
            className="px-4 py-2 rounded-xl bg-emerald-100 font-extrabold text-emerald-900 text-lg"
          >
            ✨ +{earnedRewards.exp} EXP
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            data-testid="arena-play-again-btn"
            onClick={handleStartSearch}
            className="btn-3d btn-3d-green min-h-[56px] px-8 py-4 rounded-2xl text-white font-black text-xl shadow-xl"
          >
            🔄 Đua thêm trận nữa
          </button>

          {onExit && (
            <button
              type="button"
              data-testid="arena-podium-exit-btn"
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

  // 4. ACTIVE 1VS1 RACE STATE
  const opponentName = match?.opponent.playerName ?? 'Bạn Gấu Trúc';
  const opponentAvatar = match?.opponent.avatar ?? '🐼';
  const playerProgressPercent = Math.min(100, Math.round((playerStep / totalSteps) * 100));
  const opponentProgressPercent = Math.min(100, Math.round((opponentStep / totalSteps) * 100));
  const currentQuestion = arenaQuestions[currentQuestionIndex] ?? arenaQuestions[0];

  return (
    <div
      data-testid="arena-active-match"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 sm:p-6"
    >
      {/* 2-Lane Race Track */}
      <div
        data-testid="arena-race-track"
        className="w-full bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 rounded-3xl p-5 sm:p-6 border-4 border-sky-300 shadow-lg flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <span className="px-4 py-1.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-sm sm:text-base">
            🏁 Đường Đua Tri Thức (Câu {Math.min(totalSteps, playerStep + 1)}/{totalSteps})
          </span>
          <span className="text-2xl" aria-label="Cúp Đích Đến">
            🏆 ĐÍCH
          </span>
        </div>

        {/* Lane 1: Child Player */}
        <div
          data-testid="race-lane-player"
          className="flex flex-col gap-2 bg-white/90 p-4 rounded-2xl border-2 border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦸</span>
              <span className="font-extrabold text-slate-800 text-base sm:text-lg">
                {playerName}
              </span>
              {playerEmote && (
                <span
                  data-testid="player-active-emote"
                  className="ml-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-sm font-bold text-amber-900"
                >
                  {playerEmote}
                </span>
              )}
            </div>
            <span className="font-extrabold text-emerald-700 text-sm sm:text-base">
              {playerStep}/{totalSteps} 🏆
            </span>
          </div>

          <div className="relative w-full h-6 bg-emerald-100 rounded-full overflow-hidden border border-emerald-300">
            <div
              data-testid="player-progress-bar"
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300 rounded-full"
              style={{ width: `${playerProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Lane 2: Opponent / Bot */}
        <div
          data-testid="race-lane-opponent"
          className="flex flex-col gap-2 bg-white/90 p-4 rounded-2xl border-2 border-sky-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{opponentAvatar}</span>
              <span className="font-extrabold text-slate-800 text-base sm:text-lg">
                {opponentName}
              </span>
              {opponentEmote && (
                <span
                  data-testid="opponent-active-emote"
                  className="ml-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sm font-bold text-sky-900"
                >
                  {opponentEmote}
                </span>
              )}
            </div>
            <span className="font-extrabold text-sky-700 text-sm sm:text-base">
              {opponentStep}/{totalSteps} 🏆
            </span>
          </div>

          <div className="relative w-full h-6 bg-sky-100 rounded-full overflow-hidden border border-sky-300">
            <div
              data-testid="opponent-progress-bar"
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-300 rounded-full"
              style={{ width: `${opponentProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Safe Preset Emotes Bar (No free-text chat per spec Non-Goals) */}
        <div
          data-testid="arena-emote-bar"
          className="flex flex-wrap items-center justify-center gap-3 pt-1"
        >
          {SAFE_PRESET_EMOTES.map((emote) => (
            <button
              key={emote.id}
              type="button"
              data-testid={emote.testId}
              onClick={() => handleSendEmote(emote)}
              className="min-h-[48px] min-w-[48px] px-4 py-2 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 text-slate-800 font-extrabold text-sm sm:text-base border-2 border-amber-300 shadow-sm transition-all"
            >
              {emote.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Question Presenter */}
      {currentQuestion && (
        <QuestionPresenter
          question={currentQuestion}
          onAnswer={handleQuestionAnswer}
          audioManager={audioManager}
        />
      )}
    </div>
  );
};
