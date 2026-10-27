import { ROUTES } from '@/src/core/constants/routes';

/** Navigation only: every child keeps its own route policy and business owner. */
export const systemSettingsLinks = [
  {route:ROUTES.systemUiTexts,titleKey:'navigation.systemUiTexts',icon:'language-outline'},
  { route: ROUTES.errorLogSettings, titleKey: 'navigation.errorLogSettings', icon: 'alert-circle-outline' },
  { route: ROUTES.administration.companyLocalizations, titleKey: 'companyLocalizations.title', icon: 'language-outline' },
  { route: ROUTES.administration.offlineOperations, titleKey: 'navigation.offlineOperations', icon: 'cloud-offline-outline' },
  { route: ROUTES.basicData.companyGeographicScope, titleKey: 'navigation.companyGeographicScope', icon: 'globe-outline' },
  { route: ROUTES.advancedTools.localizationApi, titleKey: 'navigation.localizationApi', icon: 'language-outline' },
] as const;

