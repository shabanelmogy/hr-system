import type {
  AddressTypeDetail,
  AddressTypePage,
  AddressTypePageQuery,
  AddressTypeRequest,
  BulkArchiveAddressTypesResponse,
  BulkCreateAddressTypesResponse,
} from '../models/address-type';

export interface AddressTypeRepository {
  getPage(query: AddressTypePageQuery): Promise<AddressTypePage>;
  getById(id: number): Promise<AddressTypeDetail>;
  create(request: AddressTypeRequest): Promise<AddressTypeDetail>;
  update(id: number, request: AddressTypeRequest): Promise<AddressTypeDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveAddressTypesResponse>;
  bulkCreate(requests: readonly AddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse>;
}
