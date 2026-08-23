import type { CountriesRoutes, CrudRoutes, StatesRoutes, DistrictsRoutes, Id } from './types';
import { version } from "./constants";

export const countries: CountriesRoutes = {
  page: `${version}/countries`,
  lookup: `${version}/countries/lookup`,
  getById: (id: Id) => `${version}/countries/${id}`,
  create: `${version}/countries`,
  bulkCreate: `${version}/countries/bulk`,
  bulkArchive: `${version}/countries/bulk-archive`,
  update: (id: Id) => `${version}/countries/${id}`,
  archive: (id: Id) => `${version}/countries/${id}`,
  restore: (id: Id) => `${version}/countries/${id}/restore`,
  reportData: `${version}/countries/report-data`,
};

export const addressTypes: CrudRoutes = {
  getAll: `${version}/addressTypes/getAll`,
  getById: (id: Id) => `${version}/addressTypes/${id}`,
  add: `${version}/addressTypes/add`,
  update: `${version}/addressTypes/update`,
  delete: (id: Id) => `${version}/addressTypes/delete/${id}`,
};

export const states: StatesRoutes = {
  page: `${version}/states`,
  lookup: (countryId?: Id) => countryId == null
    ? `${version}/states/lookup`
    : `${version}/states/lookup?countryId=${countryId}`,
  byCountry: (countryId: Id) => `${version}/states/by-country/${countryId}`,
  getById: (id: Id) => `${version}/states/${id}`,
  getWithDistricts: (id: Id) => `${version}/states/${id}/districts`,
  create: `${version}/states`,
  update: (id: Id) => `${version}/states/${id}`,
  archive: (id: Id) => `${version}/states/${id}`,
  bulkArchive: `${version}/states/bulk-archive`,
  restore: (id: Id) => `${version}/states/${id}/restore`,
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
