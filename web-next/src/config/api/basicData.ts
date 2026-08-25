import type { CountriesRoutes, AddressTypesRoutes, StatesRoutes, DistrictsRoutes, Id } from './types';
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

export const addressTypes: AddressTypesRoutes = {
  page: `${version}/addresstypes`,
  lookup: `${version}/addresstypes/lookup`,
  getById: (id: Id) => `${version}/addresstypes/${id}`,
  getWithAddresses: (id: Id) => `${version}/addresstypes/${id}/addresses`,
  create: `${version}/addresstypes`,
  bulkCreate: `${version}/addresstypes/bulk`,
  update: (id: Id) => `${version}/addresstypes/${id}`,
  archive: (id: Id) => `${version}/addresstypes/${id}`,
  bulkArchive: `${version}/addresstypes/bulk-archive`,
  restore: (id: Id) => `${version}/addresstypes/${id}/restore`,
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
  bulkCreate: `${version}/states/bulk`,
  update: (id: Id) => `${version}/states/${id}`,
  archive: (id: Id) => `${version}/states/${id}`,
  bulkArchive: `${version}/states/bulk-archive`,
  restore: (id: Id) => `${version}/states/${id}/restore`,
};

export const districts: DistrictsRoutes = {
  page: `${version}/districts`,
  lookup: (stateId?: Id) => stateId == null
    ? `${version}/districts/lookup`
    : `${version}/districts/lookup?stateId=${stateId}`,
  byState: (stateId: Id) => `${version}/districts/by-state/${stateId}`,
  getById: (id: Id) => `${version}/districts/${id}`,
  getWithAddresses: (id: Id) => `${version}/districts/${id}/addresses`,
  create: `${version}/districts`,
  bulkCreate: `${version}/districts/bulk`,
  update: (id: Id) => `${version}/districts/${id}`,
  archive: (id: Id) => `${version}/districts/${id}`,
  bulkArchive: `${version}/districts/bulk-archive`,
  restore: (id: Id) => `${version}/districts/${id}/restore`,
};
