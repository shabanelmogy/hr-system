import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ar } from '@/src/core/localization/translations/ar';
import { en } from '@/src/core/localization/translations/en';
import { registerCompanyUiInstance } from './company-ui-resources';

const appI18n = createInstance();

void appI18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

registerCompanyUiInstance(appI18n);

export default appI18n;
