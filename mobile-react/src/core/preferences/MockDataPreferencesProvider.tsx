import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';

interface MockDataPreferencesContextValue {
  isMockDataEnabled: boolean;
  setMockDataEnabled: (enabled: boolean) => void;
}

const MockDataPreferencesContext = createContext<MockDataPreferencesContextValue | null>(null);

export function MockDataPreferencesProvider({ children }: PropsWithChildren) {
  const [isMockDataEnabled, setMockDataEnabledState] = useState(true);
  const wasChangedLocally = useRef(false);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(STORAGE_KEYS.mockDataEnabled)
      .then((storedValue) => {
        if (!active || wasChangedLocally.current) return;
        setMockDataEnabledState(storedValue !== 'false');
      })
      .catch(() => {
        // Keep the development default when local preferences cannot be read.
      });

    return () => {
      active = false;
    };
  }, []);

  const setMockDataEnabled = useCallback((enabled: boolean) => {
    wasChangedLocally.current = true;
    setMockDataEnabledState(enabled);
    void AsyncStorage.setItem(STORAGE_KEYS.mockDataEnabled, String(enabled));
  }, []);

  const value = useMemo<MockDataPreferencesContextValue>(
    () => ({ isMockDataEnabled, setMockDataEnabled }),
    [isMockDataEnabled, setMockDataEnabled],
  );

  return (
    <MockDataPreferencesContext.Provider value={value}>
      {children}
    </MockDataPreferencesContext.Provider>
  );
}

export function useMockDataPreferences(): MockDataPreferencesContextValue {
  const context = useContext(MockDataPreferencesContext);

  if (!context) {
    throw new Error('useMockDataPreferences must be used inside MockDataPreferencesProvider.');
  }

  return context;
}
