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
import type { OfflineReadableFeature } from '@/src/core/offline/offline-read-policy';

type OfflineReadPreferences = Record<OfflineReadableFeature, boolean>;

interface OfflineReadPreferencesContextValue {
  loaded: boolean;
  isOfflineReadEnabled: (feature: OfflineReadableFeature) => boolean;
  setOfflineReadEnabled: (feature: OfflineReadableFeature, enabled: boolean) => void;
}

const defaultPreferences: OfflineReadPreferences = {
  countries: false,
};

const OfflineReadPreferencesContext = createContext<OfflineReadPreferencesContextValue | null>(null);

export function OfflineReadPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<OfflineReadPreferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);
  const changedLocally = useRef(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEYS.offlineReadPreferences)
      .then((stored) => {
        if (!active || changedLocally.current || !stored) return;
        const parsed = JSON.parse(stored) as Partial<OfflineReadPreferences>;
        setPreferences({
          countries: parsed.countries === true,
        });
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setOfflineReadEnabled = useCallback((feature: OfflineReadableFeature, enabled: boolean) => {
    changedLocally.current = true;
    setLoaded(true);
    setPreferences((current) => {
      const next = { ...current, [feature]: enabled };
      void AsyncStorage.setItem(STORAGE_KEYS.offlineReadPreferences, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<OfflineReadPreferencesContextValue>(() => ({
    loaded,
    isOfflineReadEnabled: (feature) => preferences[feature],
    setOfflineReadEnabled,
  }), [loaded, preferences, setOfflineReadEnabled]);

  return (
    <OfflineReadPreferencesContext.Provider value={value}>
      {children}
    </OfflineReadPreferencesContext.Provider>
  );
}

export function useOfflineReadPreferences(): OfflineReadPreferencesContextValue {
  const context = useContext(OfflineReadPreferencesContext);
  if (!context) {
    throw new Error('useOfflineReadPreferences must be used inside OfflineReadPreferencesProvider.');
  }
  return context;
}
