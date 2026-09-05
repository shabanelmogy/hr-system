import { arRecruitment } from './ar-recruitment';
import { arCommon } from './ar-common';
import { arNavigationSettings } from './ar-navigation-settings';
import { arAdministrationTenants } from './ar-administration-tenants';
import { arAuthProfileOnboarding } from './ar-auth-profile-onboarding';
import { arPlatformToolsNotifications } from './ar-platform-tools-notifications';
import { arBasicData } from './ar-basic-data';
import { arFiscalYears } from './ar-fiscal-years';

export const ar = {
  ...arCommon,
  ...arNavigationSettings,
  ...arAdministrationTenants,
  ...arAuthProfileOnboarding,
  ...arPlatformToolsNotifications,
  ...arBasicData,
  ...arRecruitment,
  ...arFiscalYears,
};
