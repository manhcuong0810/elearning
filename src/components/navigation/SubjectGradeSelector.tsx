'use client';

import React from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { audioManager } from '@/lib/audio-manager';
import { SubjectType, GradeLevel } from '@/types/curriculum';

interface SubjectOption {
  type: SubjectType;
  label: string;
  icon: string;
  badgeColor: string;
  activeBg: string;
  borderColor: string;
}

const SUBJECTS: SubjectOption[] = [
  {
    type: 'math',
    label: 'Toán Học',
    icon: '📐',
    badgeColor: 'bg-amber-100 text-amber-800',
    activeBg: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-amber-300',
    borderColor: 'border-amber-400',
  },
  {
    type: 'vietnamese',
    label: 'Tiếng Việt',
    icon: '📖',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    activeBg: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-teal-950 shadow-emerald-300',
    borderColor: 'border-emerald-400',
  },
  {
    type: 'english',
    label: 'Tiếng Anh',
    icon: '🔤',
    badgeColor: 'bg-sky-100 text-sky-800',
    activeBg: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sky-300',
    borderColor: 'border-sky-400',
  },
];

interface GradeOption {
  level: GradeLevel;
  label: string;
  icon: string;
  subtitle: string;
}

const GRADES: GradeOption[] = [
  { level: 1, label: 'Lớp 1', icon: '🎒', subtitle: '6 - 7 tuổi' },
  { level: 2, label: 'Lớp 2', icon: '📘', subtitle: '7 - 8 tuổi' },
  { level: 3, label: 'Lớp 3', icon: '📗', subtitle: '8 - 9 tuổi' },
  { level: 4, label: 'Lớp 4', icon: '📙', subtitle: '9 - 10 tuổi' },
  { level: 5, label: 'Lớp 5', icon: '🎓', subtitle: '10 - 11 tuổi' },
];

export function SubjectGradeSelector() {
  const selectedSubject = useProgressStore((state) => state.selectedSubject);
  const selectedGrade = useProgressStore((state) => state.selectedGrade);
  const setSubject = useProgressStore((state) => state.setSubject);
  const setGrade = useProgressStore((state) => state.setGrade);

  const handleSelectGrade = (grade: GradeLevel) => {
    audioManager.playSfx('click');
    setGrade(grade);
  };

  const handleSelectSubject = (subject: SubjectType) => {
    audioManager.playSfx('pop');
    setSubject(subject);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-3 py-3 sm:py-4 bg-white/90 backdrop-blur-md rounded-3xl border-4 border-amber-200 shadow-xl flex flex-col gap-3.5">
      {/* Grade Selector Row */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎒</span> Chọn Khối Lớp Tiểu Học:
          </span>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Đang học: Lớp {selectedGrade}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {GRADES.map((g) => {
            const isActive = selectedGrade === g.level;
            return (
              <button
                key={`grade-${g.level}`}
                type="button"
                onClick={() => handleSelectGrade(g.level)}
                aria-label={`Chọn ${g.label}`}
                aria-pressed={isActive}
                className={`min-h-[48px] py-2 px-1.5 sm:px-3 rounded-2xl font-black text-xs sm:text-sm transition-all duration-200 flex flex-col items-center justify-center gap-0.5 border-2 ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white border-amber-600 shadow-lg scale-105 ring-2 ring-amber-300'
                    : 'bg-amber-50/70 hover:bg-amber-100/90 text-amber-900 border-amber-200 hover:scale-102'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{g.icon}</span>
                <span className="leading-tight">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject Selector Row */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/80">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
            <span>📚</span> Chọn Môn Học:
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SUBJECTS.map((sub) => {
            const isActive = selectedSubject === sub.type;
            return (
              <button
                key={`sub-${sub.type}`}
                type="button"
                onClick={() => handleSelectSubject(sub.type)}
                aria-label={`Chọn môn ${sub.label}`}
                aria-pressed={isActive}
                className={`min-h-[48px] py-2.5 px-3 rounded-2xl font-black text-xs sm:text-base transition-all duration-200 flex items-center justify-center gap-2 border-3 ${
                  isActive
                    ? `${sub.activeBg} border-white shadow-lg scale-102 ring-2 ring-amber-300`
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-xl sm:text-2xl">{sub.icon}</span>
                <span className="truncate">{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
