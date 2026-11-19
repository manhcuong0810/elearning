'use client';

import React, { useState } from 'react';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export interface AudioPromptButtonProps {
  promptAudioUrl: string;
  audioManager?: AudioManager;
  label?: string;
  className?: string;
}

export const AudioPromptButton: React.FC<AudioPromptButtonProps> = ({
  promptAudioUrl,
  audioManager = defaultAudioManager,
  label = 'Nghe câu hỏi',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (!promptAudioUrl) return;
    setIsPlaying(true);
    audioManager.playVoice(promptAudioUrl);
    setTimeout(() => {
      setIsPlaying(false);
    }, 600);
  };

  return (
    <button
      type="button"
      data-testid="audio-prompt-button"
      aria-label={label}
      onClick={handleClick}
      className={`inline-flex items-center justify-center min-w-[48px] min-h-[48px] w-14 h-14 rounded-2xl bg-kid-yellow hover:bg-kid-orange active:scale-95 text-slate-900 shadow-md border-2 border-amber-400 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-amber-300 ${
        isPlaying ? 'scale-105 ring-4 ring-amber-300' : ''
      } ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7 text-amber-900"
        aria-hidden="true"
      >
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
      </svg>
    </button>
  );
};
