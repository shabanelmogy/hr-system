import { auth } from './auth';
import { countries, addressTypes, states, districts } from './basicData';
import { roles, users } from './rolesUsers';
import { exportRoutes, advancedTools, google } from './advanced';
import { appointments } from './appointments';
import { files } from './files';
import { version } from './constants';
import { notifications } from './notifications';

export { version } from './constants';

export const apiRoutes = {
  version,
  auth,
  countries,
  addressTypes,
  states,
  districts,
  roles,
  users,
  export: exportRoutes,
  advancedTools,
  google,
  appointments,
  files,
  notifications,
};

export default apiRoutes;

export * from './types';
