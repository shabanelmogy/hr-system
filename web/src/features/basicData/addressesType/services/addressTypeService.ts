import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { AddressType, CreateAddressTypeRequest, UpdateAddressTypeRequest } from "../types/AddressType";

// AddressType Service
export class AddressTypeService {
  static async getAll(): Promise<AddressType[]> {
    const response = await apiService.get(apiRoutes.addressTypes.getAll);
    const addressTypes = extractValues<AddressType>(response);
    return addressTypes.filter((a) => !a.isDeleted);
  }

  static async getById(id: string | number): Promise<AddressType> {
    const response = await apiService.get(apiRoutes.addressTypes.getById(id));
    return extractValue<AddressType>(response);
  }

  static async create(data: CreateAddressTypeRequest): Promise<AddressType> {
    const response = await apiService.post(apiRoutes.addressTypes.add, data);
    return extractValue<AddressType>(response);
  }

  static async update(data: UpdateAddressTypeRequest): Promise<AddressType> {
    const response = await apiService.put(apiRoutes.addressTypes.update, data);
    return extractValue<AddressType>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.addressTypes.delete(id));
    return id;
  }

  static search(items: AddressType[], searchTerm: string): AddressType[] {
    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase().trim();
    return items.filter((item) => {
      if (!item || item.isDeleted) return false;
      return (
        item.nameEn?.toLowerCase().includes(term) ||
        item.nameAr?.includes(term)
      );
    });
  }
}

export default AddressTypeService;
