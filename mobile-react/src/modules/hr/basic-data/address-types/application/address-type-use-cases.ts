import type {
  AddressTypeDetail,
  AddressTypePage,
  AddressTypePageQuery,
  AddressTypeRequest,
  BulkArchiveAddressTypesResponse,
  BulkCreateAddressTypesResponse,
} from '../domain/models/address-type';
import {
  normalizeAddressTypeRequest,
  normalizeAddressTypeRequests,
} from '../domain/policies/address-type-request-policy';
import type { AddressTypeRepository } from '../domain/repositories/address-type-repository';

export interface SaveAddressTypeInput {
  id: number | null;
  request: AddressTypeRequest;
}

export interface AddressTypeUseCases {
  getPage(query: AddressTypePageQuery): Promise<AddressTypePage>;
  getById(id: number): Promise<AddressTypeDetail>;
  create(request: AddressTypeRequest): Promise<AddressTypeDetail>;
  update(id: number, request: AddressTypeRequest): Promise<AddressTypeDetail>;
  save(input: SaveAddressTypeInput): Promise<AddressTypeDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveAddressTypesResponse>;
  bulkCreate(requests: readonly AddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse>;
}

export function createAddressTypeUseCases(repository: AddressTypeRepository): AddressTypeUseCases {
  const create = (request: AddressTypeRequest) => repository.create(normalizeAddressTypeRequest(request));
  const update = (id: number, request: AddressTypeRequest) =>
    repository.update(id, normalizeAddressTypeRequest(request));

  return {
    getPage: (query) => repository.getPage(query),
    getById: (id) => repository.getById(id),
    create,
    update,
    save: ({ id, request }) => id === null ? create(request) : update(id, request),
    archive: (id) => repository.archive(id),
    restore: (id) => repository.restore(id),
    bulkArchive: (ids) => repository.bulkArchive(ids),
    bulkCreate: (requests) => repository.bulkCreate(normalizeAddressTypeRequests(requests)),
  };
}
