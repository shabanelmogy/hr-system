import { enRecruitment } from './en-recruitment';
import { enCommon } from './en-common';
import { enNavigationSettings } from './en-navigation-settings';
import { enAdministrationTenants } from './en-administration-tenants';
import { enAuthProfileOnboarding } from './en-auth-profile-onboarding';
import { enPlatformToolsNotifications } from './en-platform-tools-notifications';
import { enBasicData } from './en-basic-data';
import { enFiscalYears } from './en-fiscal-years';
import { enWorkforcePlanning } from './en-workforce-planning';
import { enModules } from './en-modules';
import { enOfflineOperations } from './en-offline-operations';
import { enCurrencies } from './en-currencies';

export const en = {
  ...enCommon,
  ...enNavigationSettings,
  ...enAdministrationTenants,
  ...enAuthProfileOnboarding,
  ...enPlatformToolsNotifications,
  ...enBasicData,
  ...enRecruitment,
  ...enFiscalYears,
  ...enWorkforcePlanning,
  ...enModules,
  ...enOfflineOperations,
  ...enCurrencies,
};
