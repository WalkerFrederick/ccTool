'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';
type SoundState = 'muted' | 'unmuted';

interface SiteSettings {
  theme: Theme;
  soundState: SoundState;
  welcomeDismissed: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  dismissWelcome: () => void;
}

const SiteSettingsContext = createContext<SiteSettings | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [soundState, setSoundState] = useState<SoundState>('unmuted');
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme
    const isDark = document.documentElement.classList.contains('dark');
    const storedTheme = localStorage.getItem('theme');
    const currentTheme = storedTheme || (isDark ? 'dark' : 'light');
    setTheme(currentTheme as Theme);

    // Initialize sound
    const storedSound = localStorage.getItem('sound');
    const currentSound = (storedSound as SoundState) || 'unmuted';
    setSoundState(currentSound);

    // Initialize welcome dismissal
    const storedWelcomeDismissed = localStorage.getItem('welcomeDismissed');
    const currentWelcomeDismissed = storedWelcomeDismissed === 'true';
    setWelcomeDismissed(currentWelcomeDismissed);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleSound = () => {
    const newSoundState = soundState === 'unmuted' ? 'muted' : 'unmuted';
    setSoundState(newSoundState);
    localStorage.setItem('sound', newSoundState);
  };

  const dismissWelcome = () => {
    setWelcomeDismissed(true);
    localStorage.setItem('welcomeDismissed', 'true');
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SiteSettingsContext.Provider
      value={{
        theme,
        soundState,
        welcomeDismissed,
        toggleTheme,
        toggleSound,
        dismissWelcome,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error(
      'useSiteSettings must be used within a SiteSettingsProvider'
    );
  }
  return context;
}
