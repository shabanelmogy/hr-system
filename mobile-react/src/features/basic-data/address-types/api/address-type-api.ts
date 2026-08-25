import { apiService, type PageResponse } from '@/src/core/api';
import { addressTypeEndpoints } from './address-type-endpoints';
import { addressTypeDetailSchema, addressTypePageSchema, bulkArchiveAddressTypesSchema, bulkCreateAddressTypesSchema } from './address-type-schemas';
import type { AddressType, AddressTypeDetail, AddressTypePageQuery, AddressTypeRequest, BulkArchiveAddressTypesResponse, BulkCreateAddressTypesResponse } from '../types/address-type';

export function toAddressTypePageQuery(query: AddressTypePageQuery): string {
  const parameters = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status, searchField: query.searchField, searchOperator: query.searchOperator, sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.search.trim()) parameters.set('search', query.search.trim()); return parameters.toString();
}
const normalize = (request: AddressTypeRequest): AddressTypeRequest => ({ nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim() });
export const addressTypeApi = {
  async getPage(query: AddressTypePageQuery): Promise<PageResponse<AddressType>> { return addressTypePageSchema.parse(await apiService.get<unknown>(`${addressTypeEndpoints.base}?${toAddressTypePageQuery(query)}`)); },
  async getById(id: number): Promise<AddressTypeDetail> { return addressTypeDetailSchema.parse(await apiService.get<unknown>(addressTypeEndpoints.byId(id))); },
  async create(request: AddressTypeRequest): Promise<AddressTypeDetail> { return addressTypeDetailSchema.parse(await apiService.post<unknown, AddressTypeRequest>(addressTypeEndpoints.base, normalize(request))); },
  async update(id: number, request: AddressTypeRequest): Promise<AddressTypeDetail> { return addressTypeDetailSchema.parse(await apiService.put<unknown, AddressTypeRequest>(addressTypeEndpoints.byId(id), normalize(request))); },
  async archive(id: number): Promise<void> { await apiService.delete<unknown>(addressTypeEndpoints.byId(id)); },
  async restore(id: number): Promise<void> { await apiService.post<unknown, undefined>(addressTypeEndpoints.restore(id), undefined); },
  async bulkCreate(requests: readonly AddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse> { return bulkCreateAddressTypesSchema.parse(await apiService.post<unknown, { addressTypes: AddressTypeRequest[] }>(addressTypeEndpoints.bulkCreate, { addressTypes: requests.map(normalize) })); },
  async bulkArchive(ids: readonly number[]): Promise<BulkArchiveAddressTypesResponse> { return bulkArchiveAddressTypesSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(addressTypeEndpoints.bulkArchive, { ids })); },
};
