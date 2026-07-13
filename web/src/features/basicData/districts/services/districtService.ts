import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { District, CreateDistrictRequest, UpdateDistrictRequest } from "../types/District";

// District Service
export class DistrictService {
  static async getAll(): Promise<District[]> {
    const response = await apiService.get(apiRoutes.districts.getAll);
    const districts = extractValues<District>(response);
    return districts.filter((district) => !district.isDeleted);
  }

  static async getById(id: string | number): Promise<District> {
    const response = await apiService.get(apiRoutes.districts.getById(id));
    return extractValue<District>(response);
  }

  static async getAllByState(stateId: string | number): Promise<District[]> {
    const response = await apiService.get(apiRoutes.districts.getAllByState(stateId));
    const districts = extractValues<District>(response);
    return districts.filter((district) => !district.isDeleted);
  }

  static async getDistrictWithAddresses(id: string | number): Promise<District> {
    const response = await apiService.get(apiRoutes.districts.getDistrictWithAddresses(id));
    return extractValue<District>(response);
  }

  static async getCount(): Promise<number> {
    const response = await apiService.get(apiRoutes.districts.getCount);
    return extractValue<number>(response);
  }

  static async create(districtData: CreateDistrictRequest): Promise<District> {
    const response = await apiService.post(
      apiRoutes.districts.add,
      districtData
    );
    return extractValue<District>(response);
  }

  static async update(districtData: UpdateDistrictRequest): Promise<District> {
    const response = await apiService.put(
      apiRoutes.districts.update,
      districtData
    );
    return extractValue<District>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.districts.delete(id));
    return id;
  }

  static searchDistricts(districts: District[], searchTerm: string): District[] {
    if (!searchTerm.trim()) {
      return districts;
    }

    const term = searchTerm.toLowerCase().trim();
    return districts.filter((district) => {
      if (!district || district.isDeleted) return false;

      // Search in district fields
      const districtMatch = (
        district.nameEn?.toLowerCase().includes(term) ||
        district.nameAr?.includes(term) ||
        district.code?.toLowerCase().includes(term)
      );

      // Search in state
      const stateMatch = district.state ? (
        district.state.nameEn?.toLowerCase().includes(term) ||
        district.state.nameAr?.includes(term) ||
        district.state.code?.toLowerCase().includes(term)
      ) : false;

      return districtMatch || stateMatch;
    });
  }
}

export default DistrictService;