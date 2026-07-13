import type { CrudRoutes, StatesRoutes, DistrictsRoutes, Id } from './types';

const version = "/api/v1";

export const countries: CrudRoutes = {
  getAll: `${version}/countries/getAll`,
  getById: (id: Id) => `${version}/countries/${id}`,
  add: `${version}/countries/add`,
  update: `${version}/countries/update`,
  delete: (id: Id) => `${version}/countries/delete/${id}`,
};

export const addressTypes: CrudRoutes = {
  getAll: `${version}/addressTypes/getAll`,
  getById: (id: Id) => `${version}/addressTypes/${id}`,
  add: `${version}/addressTypes/add`,
  update: `${version}/addressTypes/update`,
  delete: (id: Id) => `${version}/addressTypes/delete/${id}`,
};

export const states: StatesRoutes = {
  getAll: `${version}/states/getAll`,
  getById: (id: Id) => `${version}/states/${id}`,
  add: `${version}/states/add`,
  update: `${version}/states/update`,
  delete: (id: Id) => `${version}/states/delete/${id}`,
};

export const districts: DistrictsRoutes = {
  getAll: `${version}/districts/getAll`,
  getById: (id: Id) => `${version}/districts/${id}`,
  getAllByState: (stateId: Id) => `${version}/districts/getAllByState/by-state/${stateId}`,
  getDistrictWithAddresses: (id: Id) => `${version}/districts/getDistrictWithAddresses/${id}/addresses`,
  add: `${version}/districts/add`,
  update: `${version}/districts/update`,
  delete: (id: Id) => `${version}/districts/delete/${id}`,
  getCount: `${version}/districts/getCount/count`,
};
