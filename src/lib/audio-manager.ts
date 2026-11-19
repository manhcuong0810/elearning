/**
 * Audio & Sound FX Controller Service
 * Grade 1 Math Gamified E-learning Platform
 */

export type SfxType = 'correct' | 'wrong' | 'cheer' | 'pop' | 'click';

export interface AudioDriver {
  play?: (sound: string) => void;
  playSfx?: (sfx: SfxType) => void;
  playVoice?: (url: string) => void;
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

  constructor(sfxMap?: Partial<Record<SfxType, string>>) {
    this.sfxMap = {
      ...DEFAULT_SFX_MAP,
      ...sfxMap,
    };
  }

  playSfx(sfx: SfxType): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    const url = this.sfxMap[sfx];
    if (!url) return;

    try {
      const audio = new Audio(url);
      this.activeAudios.add(audio);
      audio.onended = () => this.activeAudios.delete(audio);
      audio.onerror = () => this.activeAudios.delete(audio);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay or playback error handled silently
          this.activeAudios.delete(audio);
        });
      }
    } catch {
      // Audio instantiation or play error handled safely
    }
  }

  playVoice(url: string): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    this.stopVoice();

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

  stopVoice(): void {
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
  playVoice(url: string, options?: { immediate?: boolean }): void {
    if (this.muted) return;

    const now = Date.now();
    const isImmediate = options?.immediate || this.debounceMs <= 0;

    if (isImmediate) {
      this.stopVoice();
      this.executePlayVoice(url);
      this.lastPlayVoiceTime = now;
      return;
    }

    // Check if rapid click happened within debounce window
    const timeSinceLastPlay = now - this.lastPlayVoiceTime;

    if (timeSinceLastPlay > this.debounceMs && !this.debounceTimer) {
      // First click: cancel any previous voice and play immediately (leading edge)
      this.stopVoice();
      this.executePlayVoice(url);
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
        this.executePlayVoice(url);
        this.lastPlayVoiceTime = Date.now();
      }, this.debounceMs);
    }
  }

  private executePlayVoice(url: string): void {
    if (this.muted) return;
    this.currentVoiceUrl = url;

    if (typeof this.driver.playVoice === 'function') {
      this.driver.playVoice(url);
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
