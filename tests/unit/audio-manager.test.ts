import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioManager, HtmlAudioDriver, SfxType } from '@/lib/audio-manager';

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    vi.useRealTimers();
    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.cleanup();
  });

  describe('Initialization and Driver', () => {
    it('should initialize with default unmuted state and default driver', () => {
      expect(audioManager.isMuted()).toBe(false);
      expect(audioManager.getAudioDriver()).toBeDefined();
    });

    it('should allow setting a custom AudioDriver', () => {
      const customDriver = { play: vi.fn() };
      audioManager.setAudioDriver(customDriver);
      expect(audioManager.getAudioDriver()).toBe(customDriver);
    });

    it('should accept options in constructor', () => {
      const customDriver = { play: vi.fn() };
      const customManager = new AudioManager({
        driver: customDriver,
        muted: true,
        debounceMs: 200,
      });

      expect(customManager.isMuted()).toBe(true);
      expect(customManager.getAudioDriver()).toBe(customDriver);
      customManager.cleanup();
    });
  });

  describe('Sound Effects (playSfx)', () => {
    it('should trigger play sound effect when not muted', () => {
      const playMock = vi.fn();
      audioManager.setAudioDriver({ play: playMock });

      audioManager.playSfx('correct');
      expect(playMock).toHaveBeenCalledWith('correct');
    });

    it('should not play sound effect when muted', () => {
      const playMock = vi.fn();
      audioManager.setAudioDriver({ play: playMock });

      audioManager.setMuted(true);
      audioManager.playSfx('correct');
      expect(playMock).not.toHaveBeenCalled();
    });

    it('should prefer playSfx over play when driver implements both', () => {
      const playMock = vi.fn();
      const playSfxMock = vi.fn();
      audioManager.setAudioDriver({ play: playMock, playSfx: playSfxMock });

      audioManager.playSfx('cheer');
      expect(playSfxMock).toHaveBeenCalledWith('cheer');
      expect(playMock).not.toHaveBeenCalled();
    });

    it('should support all standard sfx types: correct, wrong, cheer, pop, click', () => {
      const playSfxMock = vi.fn();
      audioManager.setAudioDriver({ playSfx: playSfxMock });

      const sfxList: SfxType[] = ['correct', 'wrong', 'cheer', 'pop', 'click'];
      sfxList.forEach((sfx) => {
        audioManager.playSfx(sfx);
        expect(playSfxMock).toHaveBeenCalledWith(sfx);
      });
      expect(playSfxMock).toHaveBeenCalledTimes(5);
    });
  });

  describe('Voice Playback (playVoice)', () => {
    it('should play voice audio when not muted', () => {
      const playVoiceMock = vi.fn();
      audioManager.setAudioDriver({ playVoice: playVoiceMock });

      audioManager.playVoice('/audio/math/q1.mp3');
      expect(playVoiceMock).toHaveBeenCalledWith('/audio/math/q1.mp3');
      expect(audioManager.getCurrentVoice()).toBe('/audio/math/q1.mp3');
    });

    it('should fallback to play method if driver does not define playVoice', () => {
      const playMock = vi.fn();
      audioManager.setAudioDriver({ play: playMock });

      audioManager.playVoice('/audio/math/q1.mp3');
      expect(playMock).toHaveBeenCalledWith('/audio/math/q1.mp3');
    });

    it('should not play voice when muted', () => {
      const playVoiceMock = vi.fn();
      audioManager.setAudioDriver({ playVoice: playVoiceMock });

      audioManager.setMuted(true);
      audioManager.playVoice('/audio/math/q1.mp3');
      expect(playVoiceMock).not.toHaveBeenCalled();
      expect(audioManager.getCurrentVoice()).toBeNull();
    });
  });

  describe('Mute and Unmute Controls', () => {
    it('should toggle mute state and return new value', () => {
      expect(audioManager.isMuted()).toBe(false);

      const muted = audioManager.toggleMute();
      expect(muted).toBe(true);
      expect(audioManager.isMuted()).toBe(true);

      const unmuted = audioManager.toggleMute();
      expect(unmuted).toBe(false);
      expect(audioManager.isMuted()).toBe(false);
    });

    it('should stop currently playing voice when muted', () => {
      const stopVoiceMock = vi.fn();
      const playVoiceMock = vi.fn();
      audioManager.setAudioDriver({ playVoice: playVoiceMock, stopVoice: stopVoiceMock });

      audioManager.playVoice('/audio/math/q1.mp3');
      audioManager.setMuted(true);

      expect(stopVoiceMock).toHaveBeenCalled();
      expect(audioManager.getCurrentVoice()).toBeNull();
    });
  });

  describe('Debouncing & Cancellation of Voice (Child spam clicks prevention)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should cancel previous voice playback when starting a new voice', () => {
      const stopVoiceMock = vi.fn();
      const playVoiceMock = vi.fn();
      audioManager.setAudioDriver({ playVoice: playVoiceMock, stopVoice: stopVoiceMock });

      audioManager.playVoice('/audio/math/q1.mp3');
      expect(playVoiceMock).toHaveBeenCalledWith('/audio/math/q1.mp3');

      // Fast-forward past debounce window
      vi.advanceTimersByTime(200);

      // Play next voice
      audioManager.playVoice('/audio/math/q2.mp3');
      expect(stopVoiceMock).toHaveBeenCalled();
      expect(playVoiceMock).toHaveBeenCalledWith('/audio/math/q2.mp3');
      expect(audioManager.getCurrentVoice()).toBe('/audio/math/q2.mp3');
    });

    it('should debounce rapid repeated voice clicks and avoid overlapping audio cacophony', () => {
      const stopVoiceMock = vi.fn();
      const playVoiceMock = vi.fn();
      audioManager = new AudioManager({ debounceMs: 150 });
      audioManager.setAudioDriver({ playVoice: playVoiceMock, stopVoice: stopVoiceMock });

      // First click: plays immediately (leading-edge)
      audioManager.playVoice('/audio/math/q1.mp3');
      expect(playVoiceMock).toHaveBeenCalledWith('/audio/math/q1.mp3');
      expect(playVoiceMock).toHaveBeenCalledTimes(1);

      // Child rapidly mashes speaker button 3 more times within 100ms
      vi.advanceTimersByTime(30);
      audioManager.playVoice('/audio/math/q1.mp3'); // Mash 1: stops initial voice, schedules debounce
      expect(stopVoiceMock).toHaveBeenCalled();

      vi.advanceTimersByTime(30);
      audioManager.playVoice('/audio/math/q1.mp3'); // Mash 2: resets debounce

      vi.advanceTimersByTime(30);
      audioManager.playVoice('/audio/math/q1.mp3'); // Mash 3: resets debounce

      // During spamming, no additional voice playback was started
      expect(playVoiceMock).toHaveBeenCalledTimes(1);

      // Child stops spamming, wait debounce window (150ms)
      vi.advanceTimersByTime(150);

      // Final playback fires cleanly
      expect(playVoiceMock).toHaveBeenCalledTimes(2);
    });

    it('should stop voice immediately when stopVoice is explicitly called', () => {
      const stopVoiceMock = vi.fn();
      const playVoiceMock = vi.fn();
      audioManager.setAudioDriver({ playVoice: playVoiceMock, stopVoice: stopVoiceMock });

      audioManager.playVoice('/audio/math/q1.mp3');
      expect(audioManager.getCurrentVoice()).toBe('/audio/math/q1.mp3');

      audioManager.stopVoice();
      expect(stopVoiceMock).toHaveBeenCalled();
      expect(audioManager.getCurrentVoice()).toBeNull();
    });

    it('should cancel pending debounce timer on stopAll or cleanup', () => {
      const stopAllMock = vi.fn();
      const playVoiceMock = vi.fn();
      audioManager = new AudioManager({ debounceMs: 150 });
      audioManager.setAudioDriver({ playVoice: playVoiceMock, stopAll: stopAllMock });

      // Initial click
      audioManager.playVoice('/audio/math/q1.mp3');
      // Rapid spam click schedules pending debounce
      vi.advanceTimersByTime(30);
      audioManager.playVoice('/audio/math/q1.mp3');

      // Now call stopAll
      audioManager.stopAll();
      expect(stopAllMock).toHaveBeenCalled();

      // Advance timers past debounce window
      vi.advanceTimersByTime(200);

      // The pending debounced play should have been cancelled
      expect(playVoiceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('HtmlAudioDriver (Default Driver)', () => {
    beforeEach(() => {
      if (typeof window !== 'undefined' && window.HTMLMediaElement) {
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
      }
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should instantiate safely in JSDOM / Node environments without throwing', () => {
      const driver = new HtmlAudioDriver();
      expect(driver).toBeDefined();

      // Calling driver methods in JSDOM should be safe
      expect(() => driver.playSfx('pop')).not.toThrow();
      expect(() => driver.playVoice('/audio/test.mp3')).not.toThrow();
      expect(() => driver.stopVoice()).not.toThrow();
      expect(() => driver.stopAll()).not.toThrow();
      expect(() => driver.play('click')).not.toThrow();
    });
  });
});
