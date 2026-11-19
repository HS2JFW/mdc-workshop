import { useState, useEffect } from 'react';

export type MoralThemeMode = 'family' | 'thai-modern';

export interface MoralThemeOption {
  id: MoralThemeMode;
  name: string;
  enName: string;
  tagline: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
}

export const MORAL_THEME_OPTIONS: MoralThemeOption[] = [
  {
    id: 'family',
    name: 'Family',
    enName: 'Family Theme',
    tagline: 'สไตล์ครอบครัว อบอุ่น สดใส เข้าถึงง่าย',
    icon: '👨‍👩‍👧‍👦',
    primaryColor: '#0284c7',
    accentColor: '#2563eb'
  },
  {
    id: 'thai-modern',
    name: 'Thai Modern',
    enName: 'Thai Modern (MDC)',
    tagline: 'สไตล์ไทยโมเดิร์น ทางการ สดใส เรียบหรู ตามแบบฉบับ MDC ศูนย์คุณธรรม',
    icon: '🏛️',
    primaryColor: '#3f62d3',
    accentColor: '#4575ff'
  }
];

const THEME_STORAGE_KEY = 'moral_center_theme_mode_v2';
const THEME_EVENT_NAME = 'moral-theme-change';

/**
 * Reads the currently stored theme, defaulting to 'thai-modern'.
 */
export function getStoredMoralTheme(): MoralThemeMode {
  if (typeof window === 'undefined') return 'thai-modern';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'thai-modern' || saved === 'family') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'thai-modern';
}

/**
 * Updates the stored theme and applies attributes to DOM elements.
 */
export function setStoredMoralTheme(theme: MoralThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }

  // Apply to document element and body
  document.documentElement.setAttribute('data-moral-theme', theme);
  if (document.body) {
    document.body.setAttribute('data-moral-theme', theme);
  }

  // Dispatch custom event for reactive subscribers
  window.dispatchEvent(new CustomEvent(THEME_EVENT_NAME, { detail: theme }));
}

// Ensure DOM has initial theme attribute immediately on load
if (typeof window !== 'undefined') {
  const initialTheme = getStoredMoralTheme();
  document.documentElement.setAttribute('data-moral-theme', initialTheme);
  if (document.body) {
    document.body.setAttribute('data-moral-theme', initialTheme);
  }
}

/**
 * React hook for consuming and updating the current theme.
 */
export function useMoralTheme() {
  const [theme, setThemeState] = useState<MoralThemeMode>(() => getStoredMoralTheme());

  useEffect(() => {
    // Initialize DOM attribute
    const current = getStoredMoralTheme();
    document.documentElement.setAttribute('data-moral-theme', current);
    if (document.body) {
      document.body.setAttribute('data-moral-theme', current);
    }

    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<MoralThemeMode>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener(THEME_EVENT_NAME, handleThemeChange);
    return () => {
      window.removeEventListener(THEME_EVENT_NAME, handleThemeChange);
    };
  }, []);

  const setTheme = (newTheme: MoralThemeMode) => {
    setThemeState(newTheme);
    setStoredMoralTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'family' ? 'thai-modern' : 'family';
    setTheme(next);
  };

  return {
    theme,
    isThaiModern: theme === 'thai-modern',
    isFamily: theme === 'family',
    setTheme,
    toggleTheme,
    options: MORAL_THEME_OPTIONS
  };
}
