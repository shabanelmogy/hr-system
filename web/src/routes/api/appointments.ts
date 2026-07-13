import type { CrudRoutes, Id } from './types';

const version = "/api/v1";

export const appointments: Omit<CrudRoutes, 'getById'> = {
  getAll: `${version}/Appointments/GetAll`,
  add: `${version}/Appointments/Add`,
  update: `${version}/Appointments/Update`,
  delete: (id: Id) => `${version}/Appointments/Delete?id=${id}`,
};
