import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';

interface OnboardingContextValue {
  completed: boolean;
  loading: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted)
      .then((value) => {
        if (active) setCompleted(value === 'true');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
    setCompleted(true);
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ completed, loading, complete, reset }),
    [complete, completed, loading, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider.');
  return context;
}
