import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  BulkArchiveDistrictsResponse,
  CreateDistrictRequest,
  CreateDistrictsRequest,
  CreateDistrictsResponse,
  DistrictDetail,
  DistrictLookup,
  DistrictPageQuery,
  DistrictPageResponse,
  DistrictWithAddresses,
  UpdateDistrictMutation,
} from "../types/District";

export const toDistrictRequest = (district: CreateDistrictRequest): CreateDistrictRequest => ({
  nameAr: district.nameAr.trim(),
  nameEn: district.nameEn.trim(),
  code: district.code.trim().toUpperCase(),
  stateId: Number(district.stateId),
});

export class DistrictService {
  static getPage(query: DistrictPageQuery): Promise<DistrictPageResponse> {
    return apiService.get<DistrictPageResponse>(apiRoutes.districts.page, { ...query });
  }

  static getLookup(stateId?: number): Promise<DistrictLookup[]> {
    return apiService.get<DistrictLookup[]>(apiRoutes.districts.lookup(stateId));
  }

  static getByState(stateId: number): Promise<DistrictLookup[]> {
    return apiService.get<DistrictLookup[]>(apiRoutes.districts.byState(stateId));
  }

  static getById(id: number): Promise<DistrictDetail> {
    return apiService.get<DistrictDetail>(apiRoutes.districts.getById(id));
  }

  static getWithAddresses(id: number): Promise<DistrictWithAddresses> {
    return apiService.get<DistrictWithAddresses>(apiRoutes.districts.getWithAddresses(id));
  }

  static create(request: CreateDistrictRequest): Promise<DistrictDetail> {
    return apiService.post<DistrictDetail>(apiRoutes.districts.create, toDistrictRequest(request));
  }

  static createBulk(districts: CreateDistrictRequest[]): Promise<CreateDistrictsResponse> {
    const request: CreateDistrictsRequest = {
      districts: districts.map(toDistrictRequest),
    };
    return apiService.post<CreateDistrictsResponse>(
      apiRoutes.districts.bulkCreate,
      request,
    );
  }

  static update({ id, request }: UpdateDistrictMutation): Promise<DistrictDetail> {
    return apiService.put<DistrictDetail>(apiRoutes.districts.update(id), toDistrictRequest(request));
  }

  static async archive(id: number): Promise<number> {
    await apiService.delete(apiRoutes.districts.archive(id));
    return id;
  }

  static async restore(id: number): Promise<number> {
    await apiService.post(apiRoutes.districts.restore(id));
    return id;
  }

  static archiveBulk(ids: number[]): Promise<BulkArchiveDistrictsResponse> {
    return apiService.post<BulkArchiveDistrictsResponse>(apiRoutes.districts.bulkArchive, { ids });
  }
}

export default DistrictService;
