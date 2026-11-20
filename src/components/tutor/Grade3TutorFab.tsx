'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AudioManager, defaultAudioManager } from '@/lib/audio-manager';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const DEFAULT_SUGGESTIONS = [
  '📐 Công thức tính diện tích hình chữ nhật',
  '💡 Cách giải bài toán rút về đơn vị',
  '🔢 Tìm thừa số chưa biết: x × 6 = 48',
  '⏰ Cách đọc đồng hồ số La Mã',
];

const INITIAL_GREETING =
  'Chào bé! Cú Mèo là Gia Sư Toán Lớp 3 đây 🦉✨. Em đang gặp bài toán nào khó (rút về đơn vị, tìm x, chu vi, diện tích...) cần Cú Mèo giảng giải không nào?';

const formatInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-amber-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-amber-200/60 font-mono text-xs text-amber-950"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-black text-amber-950 mt-2 mb-1 text-sm sm:text-base">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-black text-amber-950 mt-2.5 mb-1 text-base">
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s+/, '');
      return (
        <li key={idx} className="ml-4 list-disc text-slate-800">
          {formatInline(bulletText)}
        </li>
      );
    }

    if (trimmed.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          className="my-1.5 pl-3 border-l-4 border-amber-400 bg-amber-50/80 py-1 text-xs sm:text-sm font-medium text-amber-900 rounded-r-lg"
        >
          {formatInline(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
    }

    if (!trimmed) {
      return <div key={idx} className="h-1.5" />;
    }

    return (
      <p key={idx} className="my-0.5">
        {formatInline(line)}
      </p>
    );
  });
};

interface Grade3TutorFabProps {
  audioManager?: AudioManager;
}

export const Grade3TutorFab: React.FC<Grade3TutorFabProps> = ({
  audioManager = defaultAudioManager,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    audioManager.playSfx('pop');

    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      const data = await res.json();
      const replyText =
        data.reply ||
        'Cú Mèo chưa nghe rõ, bé gửi lại câu hỏi cho Cú Mèo nhé!';

      audioManager.playSfx('correct');

      const botMsg: ChatMessageItem = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      audioManager.playSfx('wrong');
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Ôi, Cú Mèo đang bay đi tìm sách giải toán một lát 🦉. Bé hãy kiểm tra lại kết nối và hỏi lại nhé!',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    audioManager.playVoice('', { text });
  };

  const handleResetChat = () => {
    audioManager.playSfx('click');
    setMessages([
      {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: INITIAL_GREETING,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            data-testid="grade3-tutor-fab-btn"
            onClick={() => {
              audioManager.playSfx('click');
              setIsOpen(true);
            }}
            aria-label="Mở Gia Sư Toán Lớp 3 Cú Mèo"
            className="group relative flex items-center justify-center min-w-[56px] min-h-[56px] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-2xl border-4 border-white hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <span className="text-3xl sm:text-4xl animate-bounce-gentle">🦉</span>

            {/* Glowing Pulse Badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>

            {/* Tooltip on hover */}
            <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-black whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Gia Sư Toán 3 AI 🦉
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          data-testid="grade3-tutor-window"
          className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[580px] bg-white rounded-[2rem] shadow-2xl border-4 border-amber-300 border-b-[8px] border-b-amber-500 flex flex-col overflow-hidden animate-scale-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 border-b-2 border-amber-400 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/90 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner">
                🦉
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950 leading-tight">
                  Gia Sư Cú Mèo 🦉
                </h3>
                <p className="text-xs font-bold text-amber-800">
                  Hỏi bài Toán Lớp 3 (DeepSeek AI)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Bắt đầu hội thoại mới"
                aria-label="Xóa làm lại hội thoại"
                className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-amber-950 flex items-center justify-center text-sm font-bold shadow-sm transition-transform active:scale-90"
              >
                🔄
              </button>
              <button
                type="button"
                data-testid="tutor-close-btn"
                onClick={() => {
                  audioManager.playSfx('click');
                  setIsOpen(false);
                }}
                aria-label="Đóng cửa sổ gia sư"
                className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-lg font-black shadow-sm transition-transform active:scale-90"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-amber-50/50 via-white to-sky-50/30">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 max-w-[88%] ${
                    isBot ? 'self-start' : 'self-end flex-row-reverse'
                  }`}
                >
                  {isBot && (
                    <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
                      🦉
                    </span>
                  )}
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 shadow-sm text-sm sm:text-base leading-relaxed ${
                      isBot
                        ? 'bg-amber-100/90 text-slate-800 border-2 border-amber-200'
                        : 'bg-sky-500 text-white font-medium shadow-md'
                    }`}
                  >
                    <div className="space-y-0.5">
                      {renderFormattedContent(msg.content)}
                    </div>
                    {isBot && msg.id !== 'greeting' && (
                      <div className="mt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleReadAloud(msg.content)}
                          title="Nghe đọc lời giải"
                          aria-label="Nghe đọc lời giải"
                          className="min-w-[32px] min-h-[32px] px-2 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          📢 Nghe đọc
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 self-start bg-amber-100 text-amber-900 px-3.5 py-2.5 rounded-2xl border-2 border-amber-200 shadow-sm text-sm font-bold animate-pulse">
                <span>🦉</span>
                <span>Cú Mèo đang suy nghĩ bài giải...</span>
                <span className="inline-flex gap-0.5">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-amber-50/70 border-t border-amber-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-black text-amber-900 shrink-0">Gợi ý:</span>
            {DEFAULT_SUGGESTIONS.map((sug, i) => (
              <button
                key={`sug-${i}`}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(sug)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 shadow-2xs transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t-2 border-amber-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập đề bài toán lớp 3 cần giải..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-amber-200 focus:border-amber-400 focus:bg-white focus:outline-none text-slate-800 text-sm sm:text-base font-medium shadow-inner placeholder:text-slate-400"
            />
            <button
              type="submit"
              data-testid="tutor-send-btn"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Gửi câu hỏi"
              className="min-w-[48px] min-h-[48px] px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black text-lg shadow-md transition-all active:scale-95 flex items-center justify-center"
            >
              🚀
            </button>
          </form>
        </div>
      )}
    </>
  );
};
