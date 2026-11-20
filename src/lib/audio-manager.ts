/**
 * Audio & Sound FX Controller Service
 * Grade 1 Math Gamified E-learning Platform
 */

export type SfxType = 'correct' | 'wrong' | 'cheer' | 'pop' | 'click';

export interface AudioDriver {
  play?: (sound: string) => void;
  playSfx?: (sfx: SfxType) => void;
  playVoice?: (url: string, options?: { text?: string; immediate?: boolean }) => void;
  stopVoice?: () => void;
  stopAll?: () => void;
  stop?: () => void;
}

export interface AudioManagerOptions {
  driver?: AudioDriver;
  muted?: boolean;
  debounceMs?: number;
}

export const DEFAULT_SFX_MAP: Record<SfxType, string> = {
  correct: '/audio/common/sfx_correct.mp3',
  wrong: '/audio/common/sfx_wrong.mp3',
  cheer: '/audio/common/sfx_cheer.mp3',
  pop: '/audio/common/sfx_pop.mp3',
  click: '/audio/common/sfx_click.mp3',
};

/**
 * Standard browser HTMLAudioDriver using Web Audio / HTML5 AudioElement.
 * Safe for SSR (no-op when window / Audio is not available).
 */
export class HtmlAudioDriver implements AudioDriver {
  private activeAudios: Set<HTMLAudioElement> = new Set();
  private currentVoiceAudio: HTMLAudioElement | null = null;
  private sfxMap: Record<SfxType, string>;
  private audioCtx: AudioContext | null = null;

  constructor(sfxMap?: Partial<Record<SfxType, string>>) {
    this.sfxMap = {
      ...DEFAULT_SFX_MAP,
      ...sfxMap,
    };
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.audioCtx) {
      try {
        this.audioCtx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playSynthesizedSfx(sfx: SfxType): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    const now = ctx.currentTime;

    if (sfx === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return true;
    }

    if (sfx === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
      return true;
    }

    if (sfx === 'correct') {
      // Cheerful bright 3-tone arpeggio: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.35, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
      return true;
    }

    if (sfx === 'wrong') {
      // Gentle friendly 'uh-oh'
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
      return true;
    }

    if (sfx === 'cheer') {
      // Triumphant victory fanfare: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.1;
        const dur = idx === 3 ? 0.35 : 0.15;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.4, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
      return true;
    }

    return false;
  }

  playSfx(sfx: SfxType): void {
    if (typeof window === 'undefined') return;

    let synthesized = false;
    try {
      synthesized = this.playSynthesizedSfx(sfx);
    } catch {
      synthesized = false;
    }

    if (synthesized) return;

    const url = this.sfxMap[sfx];
    if (!url || typeof Audio === 'undefined') return;

    try {
      const audio = new Audio(url);
      this.activeAudios.add(audio);
      audio.onended = () => this.activeAudios.delete(audio);
      audio.onerror = () => this.activeAudios.delete(audio);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.activeAudios.delete(audio);
        });
      }
    } catch {
      // Audio play error handled safely
    }
  }

  playVoice(url: string, options?: { text?: string; immediate?: boolean }): void {
    if (typeof window === 'undefined') return;
    this.stopVoice();

    // 1. If text is provided, use browser Web Speech API for natural Vietnamese reading
    if (options?.text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(options.text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
        return;
      } catch {}
    }

    // 2. Play audio element if url is provided
    if (url && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio(url);
        this.currentVoiceAudio = audio;
        audio.onended = () => {
          if (this.currentVoiceAudio === audio) {
            this.currentVoiceAudio = null;
          }
        };
        audio.onerror = () => {
          if (this.currentVoiceAudio === audio) {
            this.currentVoiceAudio = null;
          }
        };
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (this.currentVoiceAudio === audio) {
              this.currentVoiceAudio = null;
            }
          });
        }
      } catch {
        this.currentVoiceAudio = null;
      }
    }
  }

  stopVoice(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    if (this.currentVoiceAudio) {
      try {
        this.currentVoiceAudio.pause();
        this.currentVoiceAudio.currentTime = 0;
      } catch {}
      this.currentVoiceAudio = null;
    }
  }

  stopAll(): void {
    this.stopVoice();
    this.activeAudios.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    this.activeAudios.clear();
  }

  play(soundOrUrl: string): void {
    if (soundOrUrl in this.sfxMap) {
      this.playSfx(soundOrUrl as SfxType);
    } else {
      this.playVoice(soundOrUrl);
    }
  }
}

/**
 * AudioManager coordinates SFX and voice playback, provides mute control,
 * and debounces / cancels rapid voice playback to prevent harsh audio overlapping.
 */
export class AudioManager {
  private driver: AudioDriver;
  private muted: boolean;
  private debounceMs: number;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentVoiceUrl: string | null = null;
  private lastPlayVoiceTime = 0;

  constructor(options?: AudioManagerOptions) {
    this.muted = options?.muted ?? false;
    this.debounceMs = options?.debounceMs ?? 150;
    this.driver = options?.driver ?? new HtmlAudioDriver();
  }

  /**
   * Set or swap the underlying audio driver
   */
  setAudioDriver(driver: AudioDriver): void {
    this.driver = driver;
  }

  /**
   * Get the current audio driver
   */
  getAudioDriver(): AudioDriver {
    return this.driver;
  }

  /**
   * Check if audio is currently muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set muted state. When muted, immediately stops any currently playing audio.
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  /**
   * Toggle muted state. Returns the new muted state.
   */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Play sound effect (sfx).
   */
  playSfx(sfxType: SfxType): void {
    if (this.muted) return;

    if (typeof this.driver.playSfx === 'function') {
      this.driver.playSfx(sfxType);
    } else if (typeof this.driver.play === 'function') {
      this.driver.play(sfxType);
    }
  }

  /**
   * Play voice prompt audio (promptAudioUrl).
   * Automatically stops previously playing voice audio and debounces rapid repeated clicks.
   */
  playVoice(url: string, options?: { text?: string; immediate?: boolean }): void {
    if (this.muted) return;

    const now = Date.now();
    const isImmediate = options?.immediate || this.debounceMs <= 0;

    if (isImmediate) {
      this.stopVoice();
      this.executePlayVoice(url, options);
      this.lastPlayVoiceTime = now;
      return;
    }

    // Check if rapid click happened within debounce window
    const timeSinceLastPlay = now - this.lastPlayVoiceTime;

    if (timeSinceLastPlay > this.debounceMs && !this.debounceTimer) {
      // First click: cancel any previous voice and play immediately (leading edge)
      this.stopVoice();
      this.executePlayVoice(url, options);
      this.lastPlayVoiceTime = now;
    } else {
      // Repeated rapid click (spamming button):
      // Cancel previous voice immediately to prevent loud overlapping sound
      this.stopVoice();

      // Clear any pending debounce timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // Schedule playback once the spam clicking settles
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        this.executePlayVoice(url, options);
        this.lastPlayVoiceTime = Date.now();
      }, this.debounceMs);
    }
  }

  private executePlayVoice(url: string, options?: { text?: string; immediate?: boolean }): void {
    if (this.muted) return;
    this.currentVoiceUrl = url;

    if (typeof this.driver.playVoice === 'function') {
      if (options) {
        this.driver.playVoice(url, options);
      } else {
        this.driver.playVoice(url);
      }
    } else if (typeof this.driver.play === 'function') {
      this.driver.play(url);
    }
  }

  /**
   * Stop currently playing voice audio
   */
  stopVoice(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.currentVoiceUrl = null;

    if (typeof this.driver.stopVoice === 'function') {
      this.driver.stopVoice();
    } else if (typeof this.driver.stop === 'function') {
      this.driver.stop();
    }
  }

  /**
   * Stop all sounds (voice and sfx)
   */
  stopAll(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.currentVoiceUrl = null;

    if (typeof this.driver.stopAll === 'function') {
      this.driver.stopAll();
    } else {
      if (typeof this.driver.stopVoice === 'function') {
        this.driver.stopVoice();
      }
      if (typeof this.driver.stop === 'function') {
        this.driver.stop();
      }
    }
  }

  /**
   * Get the URL of the currently playing voice, or null if none
   */
  getCurrentVoice(): string | null {
    return this.currentVoiceUrl;
  }

  /**
   * Cleanup all timers and stop playback
   */
  cleanup(): void {
    this.stopAll();
  }
}

/**
 * Singleton instance of AudioManager for convenient usage across the app
 */
export const audioManager = new AudioManager();
export const defaultAudioManager = audioManager;
