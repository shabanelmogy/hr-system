import { apiService } from '@/src/core/api';
import type {
  AddressTypeDetail,
  AddressTypePage,
  AddressTypePageQuery,
  AddressTypeRequest,
  BulkArchiveAddressTypesResponse,
  BulkCreateAddressTypesResponse,
} from '../../domain/models/address-type';
import { addressTypeEndpoints } from './address-type-endpoints';
import {
  addressTypeDetailSchema,
  addressTypePageSchema,
  bulkArchiveAddressTypesSchema,
  bulkCreateAddressTypesSchema,
} from './address-type-schemas';

export interface AddressTypeRemoteDataSource {
  getPage(query: AddressTypePageQuery): Promise<AddressTypePage>;
  getById(id: number): Promise<AddressTypeDetail>;
  create(request: AddressTypeRequest): Promise<AddressTypeDetail>;
  update(id: number, request: AddressTypeRequest): Promise<AddressTypeDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkCreate(requests: readonly AddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveAddressTypesResponse>;
}

export function toAddressTypePageQuery(query: AddressTypePageQuery): string {
  const parameters = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    status: query.status,
    searchField: query.searchField,
    searchOperator: query.searchOperator,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  return parameters.toString();
}

export const addressTypeRemoteDataSource: AddressTypeRemoteDataSource = {
  async getPage(query) {
    return addressTypePageSchema.parse(await apiService.get<unknown>(
      `${addressTypeEndpoints.base}?${toAddressTypePageQuery(query)}`,
    ));
  },
  async getById(id) {
    return addressTypeDetailSchema.parse(await apiService.get<unknown>(addressTypeEndpoints.byId(id)));
  },
  async create(request) {
    return addressTypeDetailSchema.parse(await apiService.post<unknown, AddressTypeRequest>(
      addressTypeEndpoints.base,
      request,
    ));
  },
  async update(id, request) {
    return addressTypeDetailSchema.parse(await apiService.put<unknown, AddressTypeRequest>(
      addressTypeEndpoints.byId(id),
      request,
    ));
  },
  async archive(id) {
    await apiService.delete<unknown>(addressTypeEndpoints.byId(id));
  },
  async restore(id) {
    await apiService.post<unknown, undefined>(addressTypeEndpoints.restore(id), undefined);
  },
  async bulkCreate(requests) {
    return bulkCreateAddressTypesSchema.parse(await apiService.post<unknown, { addressTypes: readonly AddressTypeRequest[] }>(
      addressTypeEndpoints.bulkCreate,
      { addressTypes: requests },
    ));
  },
  async bulkArchive(ids) {
    return bulkArchiveAddressTypesSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(
      addressTypeEndpoints.bulkArchive,
      { ids },
    ));
  },
};
