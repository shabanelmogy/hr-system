import { arEmailTemplates } from "./ar-email-templates";
import { arCompanyLocalizations } from './ar-company-localizations';
import { arErrorLogs } from './ar-error-logs';
import { arRecruitment } from './ar-recruitment';
import { arCommon } from './ar-common';
import { arNavigationSettings } from './ar-navigation-settings';
import { arAdministrationTenants } from './ar-administration-tenants';
import { arAuthProfileOnboarding } from './ar-auth-profile-onboarding';
import { arPlatformToolsNotifications } from './ar-platform-tools-notifications';
import { arBasicData } from './ar-basic-data';
import { arFiscalYears } from './ar-fiscal-years';
import { arWorkforcePlanning } from './ar-workforce-planning';
import { arModules } from './ar-modules';
import { arOfflineOperations } from './ar-offline-operations';
import { arCurrencies } from './ar-currencies';
import { arLedgerSetup } from './ar-ledger-setup';

export const ar = {
  ...arEmailTemplates,
  ...arCompanyLocalizations,
  ...arErrorLogs,
  ...arCommon,
  ...arNavigationSettings,
  ...arAdministrationTenants,
  ...arAuthProfileOnboarding,
  ...arPlatformToolsNotifications,
  ...arBasicData,
  ...arRecruitment,
  ...arFiscalYears,
  ...arWorkforcePlanning,
  ...arModules,
  ...arOfflineOperations,
  ...arCurrencies,
  ...arLedgerSetup,
};
