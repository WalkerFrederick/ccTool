'use client';

import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const CLICK_SOUND_PATH = '/sounds/ui/ui-pop-sound.mp3';

class SoundManager {
  private static instance: SoundManager;
  private audio: HTMLAudioElement | null = null;

  private constructor() {
    // Preload the audio file
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio(CLICK_SOUND_PATH);
      this.audio.load();
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playClickSound() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(err => {
        console.warn('Failed to play click sound:', err);
      });
    }
  }
}

// Hook for playing sounds that respects user preferences
export function useSound() {
  const { soundState } = useSiteSettings();
  const soundManager = SoundManager.getInstance();

  const playClickSound = () => {
    if (soundState === 'unmuted') {
      soundManager.playClickSound();
    }
  };

  const playSoundOnUnmute = () => {
    // This sound confirms the unmute action, so we play it directly
    soundManager.playClickSound();
  };

  return {
    playClickSound,
    playSoundOnUnmute,
  };
}
