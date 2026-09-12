import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  AddressType,
  AddressTypeDetail,
  AddressTypeLookup,
  AddressTypePageQuery,
  AddressTypePageResponse,
  AddressTypeWithAddresses,
  BulkArchiveAddressTypesResponse,
  BulkCreateAddressTypesResponse,
  CreateAddressTypeRequest,
  UpdateAddressTypeRequest,
} from "../types/AddressType";

function requestBody(request: CreateAddressTypeRequest): CreateAddressTypeRequest {
  return { nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim() };
}

export class AddressTypeService {
  static getPage(query: AddressTypePageQuery): Promise<AddressTypePageResponse> {
    return apiService.get<AddressTypePageResponse>(apiRoutes.addressTypes.page, query as unknown as Record<string, unknown>);
  }
  static getLookup(): Promise<AddressTypeLookup[]> { return apiService.get<AddressTypeLookup[]>(apiRoutes.addressTypes.lookup); }
  static getById(id: string | number): Promise<AddressTypeDetail> { return apiService.get<AddressTypeDetail>(apiRoutes.addressTypes.getById(id)); }
  static getWithAddresses(id: string | number): Promise<AddressTypeWithAddresses> { return apiService.get<AddressTypeWithAddresses>(apiRoutes.addressTypes.getWithAddresses(id)); }
  static create(data: CreateAddressTypeRequest): Promise<AddressTypeDetail> { return apiService.post<AddressTypeDetail>(apiRoutes.addressTypes.create, requestBody(data)); }
  static update(data: UpdateAddressTypeRequest): Promise<AddressTypeDetail> { return apiService.put<AddressTypeDetail>(apiRoutes.addressTypes.update(data.id), requestBody(data)); }
  static async archive(id: string | number): Promise<string | number> { await apiService.delete(apiRoutes.addressTypes.archive(id)); return id; }
  static async restore(id: string | number): Promise<string | number> { await apiService.post(apiRoutes.addressTypes.restore(id)); return id; }
  static bulkCreate(items: CreateAddressTypeRequest[]): Promise<BulkCreateAddressTypesResponse> { return apiService.post<BulkCreateAddressTypesResponse>(apiRoutes.addressTypes.bulkCreate, { addressTypes: items.map(requestBody) }); }
  static bulkArchive(ids: number[]): Promise<BulkArchiveAddressTypesResponse> { return apiService.post<BulkArchiveAddressTypesResponse>(apiRoutes.addressTypes.bulkArchive, { ids }); }
  /** Legacy compatibility for existing cross-feature consumers. */
  static async getAll(): Promise<AddressType[]> {
    const page = await this.getPage({ pageNumber: 1, pageSize: 5000, searchField: "all", searchOperator: "contains", status: "active", sortBy: "nameEn", sortDirection: "asc" });
    return page.items;
  }
  static delete(id: string | number): Promise<string | number> { return this.archive(id); }
  static search(items: AddressType[], term: string): AddressType[] {
    const normalized = term.trim().toLocaleLowerCase("en-US");
    return normalized ? items.filter((item) => item.nameEn.toLocaleLowerCase("en-US").includes(normalized) || item.nameAr.includes(term.trim())) : items;
  }
}

export default AddressTypeService;
