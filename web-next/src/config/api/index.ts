import { auth } from './auth';
import { countries, addressTypes, states, districts, companyGeographicScope } from './basicData';
import { roles, users, userInvitations } from './rolesUsers';
import { exportRoutes, advancedTools, google } from './advanced';
import { appointments } from './appointments';
import { files } from './files';
import { version } from './constants';
import { tenants } from './tenants';
import { tenantAdmins } from './tenantAdmins';
import { reportTemplates } from './reportTemplates';
import { crystalReports } from './crystalReports';
import { attendanceDevices } from './attendanceDevices';

export { version } from './constants';

export const apiRoutes = {
  version,
  auth,
  countries,
  addressTypes,
  states,
  districts,
  companyGeographicScope,
  roles,
  users,
  userInvitations,
  export: exportRoutes,
  advancedTools,
  google,
  appointments,
  files,
  tenants,
  tenantAdmins,
  reportTemplates,
  crystalReports,
  attendanceDevices,
};

export default apiRoutes;

export * from './types';
