import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import { State, CreateStateRequest, UpdateStateRequest } from "../types/State";

// State Service
export class StateService {
  static async getAll(): Promise<State[]> {
    const response = await apiService.get(apiRoutes.states.getAll);
    const states = extractValues<State>(response);
    return states.filter((state) => !state.isDeleted);
  }

  static async getById(id: string | number): Promise<State> {
    const response = await apiService.get(apiRoutes.states.getById(id));
    return extractValue<State>(response);
  }

  static async create(stateData: CreateStateRequest): Promise<State> {
    const response = await apiService.post(
      apiRoutes.states.add,
      stateData
    );
    return extractValue<State>(response);
  }

  static async update(stateData: UpdateStateRequest): Promise<State> {
    const response = await apiService.put(
      apiRoutes.states.update,
      stateData
    );
    return extractValue<State>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.states.delete(id));
    return id;
  }

  static searchStates(states: State[], searchTerm: string): State[] {
    if (!searchTerm.trim()) {
      return states;
    }

    const term = searchTerm.toLowerCase().trim();
    return states.filter((state) => {
      if (!state || state.isDeleted) return false;

      return (
        state.nameEn?.toLowerCase().includes(term) ||
        state.nameAr?.includes(term) ||
        state.code?.toLowerCase().includes(term) ||
        state.country?.nameEn?.toLowerCase().includes(term) ||
        state.country?.nameAr?.includes(term)
      );
    });
  }

  // Additional method for getting states by country
  static async getByCountry(countryId: string | number): Promise<State[]> {
    const allStates = await this.getAll();
    return allStates.filter((state) => state.countryId === Number(countryId));
  }
}

export default StateService;

// Export the service instance for backward compatibility
export const stateService = {
  getStates: () => StateService.getAll(),
  getStateById: (id: number) => StateService.getById(id),
  createState: (data: CreateStateRequest) => StateService.create(data),
  updateState: (data: UpdateStateRequest) => StateService.update(data),
  deleteState: (id: number) => StateService.delete(id),
  getStatesByCountry: (countryId: number) => StateService.getByCountry(countryId),
};