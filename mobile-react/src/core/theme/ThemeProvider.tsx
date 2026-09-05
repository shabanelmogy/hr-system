import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import {
  createNavigationTheme,
  getAppTheme,
  type AppTheme,
  type ResolvedThemeMode,
  type ThemeMode,
  type ThemePalette,
} from '@/src/core/theme/theme';

interface AppThemeContextValue {
  mode: ThemeMode;
  palette: ThemePalette;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  theme: AppTheme;
  navigationTheme: ReturnType<typeof createNavigationTheme>;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);
const themeModes: ThemeMode[] = ['system', 'light', 'dark'];
const themePalettes: ThemePalette[] = ['orange', 'green', 'blue', 'monochrome'];

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [palette, setPaletteState] = useState<ThemePalette>('green');

  useEffect(() => {
    void AsyncStorage.multiGet([STORAGE_KEYS.themeMode, STORAGE_KEYS.themePalette]).then((values) => {
      const storedMode = values[0]?.[1] ?? null;
      const storedPalette = values[1]?.[1] ?? null;
      if (themeModes.includes(storedMode as ThemeMode)) {
        setModeState(storedMode as ThemeMode);
      }
      if (themePalettes.includes(storedPalette as ThemePalette)) {
        setPaletteState(storedPalette as ThemePalette);
      }
    });
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(STORAGE_KEYS.themeMode, nextMode);
  }, []);

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette);
    void AsyncStorage.setItem(STORAGE_KEYS.themePalette, nextPalette);
  }, []);

  const resolvedMode: ResolvedThemeMode = mode === 'system'
    ? (systemMode === 'dark' ? 'dark' : 'light')
    : mode;
  const theme = getAppTheme(palette, resolvedMode);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      palette,
      resolvedMode,
      setMode,
      setPalette,
      theme,
      navigationTheme: createNavigationTheme(theme),
    }),
    [mode, palette, resolvedMode, setMode, setPalette, theme],
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
