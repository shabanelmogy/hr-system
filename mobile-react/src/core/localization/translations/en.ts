import { enRecruitment } from './en-recruitment';
import { enCommon } from './en-common';
import { enNavigationSettings } from './en-navigation-settings';
import { enAdministrationTenants } from './en-administration-tenants';
import { enAuthProfileOnboarding } from './en-auth-profile-onboarding';
import { enPlatformToolsNotifications } from './en-platform-tools-notifications';
import { enBasicData } from './en-basic-data';
import { enFiscalYears } from './en-fiscal-years';

export const en = {
  ...enCommon,
  ...enNavigationSettings,
  ...enAdministrationTenants,
  ...enAuthProfileOnboarding,
  ...enPlatformToolsNotifications,
  ...enBasicData,
  ...enRecruitment,
  ...enFiscalYears,
};
