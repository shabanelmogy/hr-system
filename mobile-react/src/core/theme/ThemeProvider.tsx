import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import {
  createNavigationTheme,
  type AppTheme,
  type ResolvedThemeMode,
  type ThemeMode,
  themes,
} from '@/src/core/theme/theme';

interface AppThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: AppTheme;
  navigationTheme: ReturnType<typeof createNavigationTheme>;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);
const themeModes: ThemeMode[] = ['system', 'light', 'dark'];

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.themeMode).then((storedMode) => {
      if (themeModes.includes(storedMode as ThemeMode)) {
        setModeState(storedMode as ThemeMode);
      }
    });
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(STORAGE_KEYS.themeMode, nextMode);
  };

  const resolvedMode: ResolvedThemeMode = mode === 'system' ? (systemMode ?? 'light') : mode;
  const theme = themes[resolvedMode];

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      setMode,
      theme,
      navigationTheme: createNavigationTheme(theme),
    }),
    [mode, resolvedMode, theme],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider.');
  }

  return context;
}
