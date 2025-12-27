import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          return { theme: newTheme };
        }),
      setTheme: (theme: Theme) =>
        set(() => {
          document.documentElement.classList.toggle('dark', theme === 'dark');
          return { theme };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Initialize theme on client side
if (typeof window !== 'undefined') {
  const theme = localStorage.getItem('theme-storage');
  if (theme) {
    const parsed = JSON.parse(theme);
    document.documentElement.classList.toggle('dark', parsed.state.theme === 'dark');
  } else {
    document.documentElement.classList.add('dark'); // default to dark
  }
}