import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  AddressTypeDetail,
  AddressTypeLookup,
  AddressTypePageQuery,
  AddressTypePageResponse,
  AddressTypeWithAddresses,
  BulkArchiveAddressTypesResponse,
  BulkCreateAddressTypesResponse,
  CreateAddressTypeRequest,
  UpdateAddressTypeMutation,
} from "../types/AddressType";

function requestBody(request: CreateAddressTypeRequest): CreateAddressTypeRequest {
  return { nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim() };
}

export class AddressTypeService {
  static getPage(query: AddressTypePageQuery): Promise<AddressTypePageResponse> {
    return apiService.get<AddressTypePageResponse>(apiRoutes.addressTypes.page, { ...query });
  }
  static getLookup(): Promise<AddressTypeLookup[]> { return apiService.get<AddressTypeLookup[]>(apiRoutes.addressTypes.lookup); }
  static getById(id: string | number): Promise<AddressTypeDetail> { return apiService.get<AddressTypeDetail>(apiRoutes.addressTypes.getById(id)); }
  static getWithAddresses(id: string | number): Promise<AddressTypeWithAddresses> { return apiService.get<AddressTypeWithAddresses>(apiRoutes.addressTypes.getWithAddresses(id)); }
  static create(data: CreateAddressTypeRequest): Promise<AddressTypeDetail> { return apiService.post<AddressTypeDetail>(apiRoutes.addressTypes.create, requestBody(data)); }
  static update({ id, request }: UpdateAddressTypeMutation): Promise<AddressTypeDetail> { return apiService.put<AddressTypeDetail>(apiRoutes.addressTypes.update(id), requestBody(request)); }
  static async archive(id: string | number): Promise<string | number> { await apiService.delete(apiRoutes.addressTypes.archive(id)); return id; }
  static async restore(id: string | number): Promise<string | number> { await apiService.post(apiRoutes.addressTypes.restore(id)); return id; }
  static bulkCreate(items: CreateAddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse> { return apiService.post<BulkCreateAddressTypesResponse>(apiRoutes.addressTypes.bulkCreate, { addressTypes: items.map(requestBody) }); }
  static bulkArchive(ids: number[]): Promise<BulkArchiveAddressTypesResponse> { return apiService.post<BulkArchiveAddressTypesResponse>(apiRoutes.addressTypes.bulkArchive, { ids }); }
}

export default AddressTypeService;
