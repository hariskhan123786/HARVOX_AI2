import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const ACCENT_PALETTES = {
  purple: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#c084fc' },
  blue: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', text: '#60a5fa' },
  green: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)', text: '#4ade80' },
  orange: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', text: '#fb923c' },
  pink: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', text: '#f472b6' },
  cyan: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#22d3ee' },
};

export const FONT_SIZES = {
  small: { root: '14px', body: '0.875rem' },
  medium: { root: '16px', body: '1rem' },
  large: { root: '18px', body: '1.125rem' },
  xl: { root: '20px', body: '1.25rem' },
};

export const FONT_FAMILIES = {
  inter: "'Inter', sans-serif",
  outfit: "'Outfit', sans-serif",
  roboto: "'Roboto', sans-serif",
  fira: "'Fira Code', monospace",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: 'dark', // 'light' | 'dark' | 'system' | 'amoled'
      accentColor: 'purple',
      customAccent: '#a855f7',
      fontSize: 'medium',
      fontFamily: 'inter',
      lineHeight: 'normal',
      reducedMotion: false,
      highContrast: false,
      compactMode: false,
      language: 'en',

      setMode: (mode) => {
        set({ mode });
        get().applyTheme();
      },

      setAccentColor: (accentColor) => {
        set({ accentColor });
        get().applyTheme();
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        get().applyTheme();
      },

      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        get().applyTheme();
      },

      setReducedMotion: (reducedMotion) => {
        set({ reducedMotion });
        get().applyTheme();
      },

      setHighContrast: (highContrast) => {
        set({ highContrast });
        get().applyTheme();
      },

      setCompactMode: (compactMode) => {
        set({ compactMode });
        get().applyTheme();
      },

      setLanguage: (language) => set({ language }),

      applyTheme: () => {
        const { mode, accentColor, fontSize, fontFamily, reducedMotion, highContrast } = get();
        const root = document.documentElement;

        // Mode class update
        root.classList.remove('light', 'dark', 'amoled', 'high-contrast');
        if (mode === 'amoled') {
          root.classList.add('dark', 'amoled');
        } else if (mode === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
          root.classList.add(mode);
        }

        if (highContrast) {
          root.classList.add('high-contrast');
        }

        // Accent palette
        const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.purple;
        root.style.setProperty('--color-accent-primary', palette.primary);
        root.style.setProperty('--color-accent-glow', palette.glow);
        root.style.setProperty('--color-accent-text', palette.text);

        // Typography
        const sizeConfig = FONT_SIZES[fontSize] || FONT_SIZES.medium;
        root.style.setProperty('--font-size-root', sizeConfig.root);
        root.style.setProperty('--font-family-base', FONT_FAMILIES[fontFamily] || FONT_FAMILIES.inter);

        // Motion
        if (reducedMotion) {
          root.classList.add('reduced-motion');
        } else {
          root.classList.remove('reduced-motion');
        }
      },
    }),
    {
      name: 'harvox-theme-storage',
    }
  )
);
