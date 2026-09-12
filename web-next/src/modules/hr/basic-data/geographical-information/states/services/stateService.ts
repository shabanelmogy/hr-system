import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  BulkArchiveStatesResponse,
  CreateStateRequest,
  CreateStatesRequest,
  CreateStatesResponse,
  StateDetail,
  StateLookup,
  StatePageQuery,
  StatePageResponse,
  StateWithDistricts,
  UpdateStateMutation,
} from "../types/State";

export const toStateRequest = (state: CreateStateRequest): CreateStateRequest => ({
  nameAr: state.nameAr.trim(),
  nameEn: state.nameEn.trim(),
  code: state.code.trim().toUpperCase(),
  countryId: Number(state.countryId),
});

export class StateService {
  static getPage(query: StatePageQuery): Promise<StatePageResponse> {
    return apiService.get<StatePageResponse>(apiRoutes.states.page, { ...query });
  }

  static getLookup(countryId?: number): Promise<StateLookup[]> {
    return apiService.get<StateLookup[]>(apiRoutes.states.lookup(countryId));
  }

  static getByCountry(countryId: number): Promise<StateLookup[]> {
    return apiService.get<StateLookup[]>(apiRoutes.states.byCountry(countryId));
  }

  static getById(id: number): Promise<StateDetail> {
    return apiService.get<StateDetail>(apiRoutes.states.getById(id));
  }

  static getWithDistricts(id: number): Promise<StateWithDistricts> {
    return apiService.get<StateWithDistricts>(apiRoutes.states.getWithDistricts(id));
  }

  static create(request: CreateStateRequest): Promise<StateDetail> {
    return apiService.post<StateDetail>(apiRoutes.states.create, toStateRequest(request));
  }

  static createBulk(states: CreateStateRequest[]): Promise<CreateStatesResponse> {
    const request: CreateStatesRequest = {
      states: states.map(toStateRequest),
    };
    return apiService.post<CreateStatesResponse>(
      apiRoutes.states.bulkCreate,
      request,
    );
  }

  static update({ id, request }: UpdateStateMutation): Promise<StateDetail> {
    return apiService.put<StateDetail>(apiRoutes.states.update(id), toStateRequest(request));
  }

  static async archive(id: number): Promise<number> {
    await apiService.delete(apiRoutes.states.archive(id));
    return id;
  }

  static async restore(id: number): Promise<number> {
    await apiService.post(apiRoutes.states.restore(id));
    return id;
  }

  static archiveBulk(ids: number[]): Promise<BulkArchiveStatesResponse> {
    return apiService.post<BulkArchiveStatesResponse>(apiRoutes.states.bulkArchive, { ids });
  }
}

export default StateService;
