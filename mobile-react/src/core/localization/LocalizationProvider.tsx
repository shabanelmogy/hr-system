import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nextProvider } from 'react-i18next';

import { STORAGE_KEYS } from '@/src/core/constants/storage-keys';
import i18n from '@/src/core/localization/i18n';
import { getResolvedCompanyUiLanguage, setExplicitCompanyUiLanguage } from './company-ui-resources';

export type AppLanguage = 'en' | 'ar';
export type AppDirection = 'ltr' | 'rtl';

interface LocalizationContextValue {
  language: AppLanguage;
  direction: AppDirection;
  isRTL: boolean;
  setLanguage: (language: AppLanguage) => void;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

const isSupportedLanguage = (value: string | null): value is AppLanguage =>
  value === 'en' || value === 'ar';

export function LocalizationProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    let active = true;
    const synchronize = () => { if (active) setLanguageState(getResolvedCompanyUiLanguage()); };
    i18n.on('languageChanged', synchronize);

    void AsyncStorage.getItem(STORAGE_KEYS.language).then((storedLanguage) => {
      if (!active) {
        return;
      }

      setExplicitCompanyUiLanguage(isSupportedLanguage(storedLanguage) ? storedLanguage : null);
      synchronize();
    });

    return () => {
      active = false;
      i18n.off('languageChanged', synchronize);
    };
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setExplicitCompanyUiLanguage(nextLanguage);
    void AsyncStorage.setItem(STORAGE_KEYS.language, nextLanguage);
  };

  const value = useMemo<LocalizationContextValue>(() => {
    const isRTL = language === 'ar';

    return {
      language,
      isRTL,
      direction: isRTL ? 'rtl' : 'ltr',
      setLanguage,
    };
  }, [language]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = value.direction;
    }
  }, [language, value.direction]);

  return (
    <I18nextProvider i18n={i18n}>
      <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>
    </I18nextProvider>
  );
}

export function useLocalization(): LocalizationContextValue {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used inside LocalizationProvider.');
  }

  return context;
}
