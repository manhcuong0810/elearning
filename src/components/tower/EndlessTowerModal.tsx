'use client';

import React, { useState, useMemo } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { generateTowerStage } from '@/lib/tower-generator';
import { audioManager } from '@/lib/audio-manager';
import { QuestionOption } from '@/types/curriculum';

interface EndlessTowerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUBJECT_NAMES = {
  math: 'Toán Học 📐',
  vietnamese: 'Tiếng Việt 📖',
  english: 'Tiếng Anh 🔤',
};

export function EndlessTowerModal({ isOpen, onClose }: EndlessTowerModalProps) {
  const selectedSubject = useProgressStore((state) => state.selectedSubject);
  const selectedGrade = useProgressStore((state) => state.selectedGrade);
  const getTowerFloor = useProgressStore((state) => state.getTowerFloor);
  const advanceTowerFloor = useProgressStore((state) => state.advanceTowerFloor);
  const addRewards = useProgressStore((state) => state.addRewards);

  const currentFloor = getTowerFloor(selectedSubject, selectedGrade);
  const stage = useMemo(
    () => generateTowerStage(selectedSubject, selectedGrade, currentFloor),
    [selectedSubject, selectedGrade, currentFloor]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [floorCompleted, setFloorCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = stage.questions[questionIndex] || stage.questions[0];

  const handleSelectOption = (option: QuestionOption) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      setIsCorrect(true);
      setCombo((prev) => prev + 1);
      audioManager.playSfx('correct');
      addRewards(currentQuestion.rewardCoins || 10, currentQuestion.rewardExp || 15);
    } else {
      setIsCorrect(false);
      setCombo(0);
      audioManager.playSfx('wrong');
    }

    // Advance to next question or complete floor after 1.2s
    setTimeout(() => {
      if (questionIndex + 1 < stage.questions.length) {
        setQuestionIndex((prev) => prev + 1);
        setIsAnswered(false);
        setSelectedOptionId(null);
      } else {
        // Floor completed!
        setFloorCompleted(true);
        audioManager.playSfx('victory');
        advanceTowerFloor(selectedSubject, selectedGrade, currentFloor);
      }
    }, 1200);
  };

  const handleNextFloor = () => {
    audioManager.playSfx('pop');
    setFloorCompleted(false);
    setQuestionIndex(0);
    setIsAnswered(false);
    setSelectedOptionId(null);
  };

  const handlePlayVoice = () => {
    audioManager.playVoice('', { text: currentQuestion.promptText });
  };

  return (
    <div
      data-testid="tower-window"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 rounded-[2.5rem] border-4 border-indigo-400 border-b-8 border-b-indigo-600 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b-2 border-indigo-400/50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border-2 border-indigo-300 flex items-center justify-center text-3xl shadow-inner">
              🏰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Tháp Vô Tận 1000 Ải
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black shadow-xs">
                  {SUBJECT_NAMES[selectedSubject]}
                </span>
              </div>
              <p className="text-xs font-bold text-indigo-200">
                Lớp {selectedGrade} • Thử thách leo tháp tri thức
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-2xl bg-indigo-600/80 border border-indigo-400 text-xs sm:text-sm font-black text-amber-300 shadow-sm">
              Tầng {currentFloor} / 1000
            </span>
            <button
              type="button"
              data-testid="tower-close-btn"
              onClick={() => {
                audioManager.playSfx('click');
                onClose();
              }}
              aria-label="Đóng Tháp Vô Tận"
              className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-xl font-black shadow-md transition-transform active:scale-95 border-2 border-rose-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Floor Info / Boss Banner */}
          {stage.isBoss && (
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-rose-900/80 to-amber-900/80 border-2 border-amber-400 rounded-2xl animate-pulse shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{stage.bossAvatar || '👑'}</span>
                <div>
                  <h4 className="text-sm font-black text-amber-300">
                    ẢI TRÙM THÁP: {stage.bossName}
                  </h4>
                  <p className="text-xs text-amber-100">
                    Cố lên bé ơi, đánh bại trùm để mở tầng tiếp theo!
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-amber-400 text-amber-950 rounded-xl">
                BOSS 👑
              </span>
            </div>
          )}

          {/* Floor Completed Screen */}
          {floorCompleted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4 animate-scale-in">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
                Chinh Phục Thành Công Tầng {currentFloor}!
              </h3>
              <p className="text-sm sm:text-base text-indigo-200 max-w-md">
                Bé rất xuất sắc! Tầng {currentFloor + 1} của Tháp Vô Tận đã mở cửa đón chào bé.
              </p>
              <button
                type="button"
                onClick={handleNextFloor}
                className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-base sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white"
              >
                Leo Lên Tầng {currentFloor + 1} 🚀
              </button>
            </div>
          ) : (
            <>
              {/* Question Stepper & Combo Indicator */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-indigo-300">Câu hỏi:</span>
                  <div className="flex gap-1.5">
                    {stage.questions.map((_, i) => (
                      <span
                        key={`step-${i}`}
                        className={`w-3 h-3 rounded-full transition-all ${
                          i === questionIndex
                            ? 'bg-amber-400 scale-125 ring-2 ring-amber-300'
                            : i < questionIndex
                            ? 'bg-emerald-400'
                            : 'bg-indigo-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {combo > 1 && (
                  <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs shadow-md animate-bounce">
                    🔥 COMBO x{combo}!
                  </span>
                )}
              </div>

              {/* Question Prompt Box */}
              <div className="p-4 sm:p-5 rounded-3xl bg-indigo-900/60 border-2 border-indigo-400/50 shadow-inner flex items-start gap-3">
                <button
                  type="button"
                  onClick={handlePlayVoice}
                  title="Nghe đọc đề bài"
                  aria-label="Nghe đọc đề bài"
                  className="min-w-[48px] min-h-[48px] w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center text-xl shadow-md shrink-0 active:scale-90 transition-transform"
                >
                  🔊
                </button>
                <div className="flex-1 mt-1">
                  <h3 className="text-base sm:text-lg font-black text-white leading-relaxed">
                    {currentQuestion.promptText}
                  </h3>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options?.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let btnBg = 'bg-indigo-900/80 hover:bg-indigo-800/90 text-white border-indigo-400/50';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      btnBg = 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-300 scale-102';
                    } else if (isSelected) {
                      btnBg = 'bg-rose-500 text-white border-rose-300';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid="tower-option-btn"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`min-h-[48px] py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 border-2 shadow-md flex items-center justify-between text-left ${btnBg}`}
                    >
                      <span>{opt.text}</span>
                      {isAnswered && opt.isCorrect && <span>✓</span>}
                      {isAnswered && isSelected && !opt.isCorrect && <span>✕</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Prompt on Error */}
              {isAnswered && !isCorrect && (
                <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-2xl text-center text-amber-200 text-xs sm:text-sm font-bold animate-fade-in">
                  🦉 Cú Mèo: Không sao đâu bé ơi, bé nhớ kỹ câu này để lần sau làm đúng nhé!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
