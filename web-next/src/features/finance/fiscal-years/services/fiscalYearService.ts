import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearLookup,
  FiscalYearMutationRequest,
  FiscalYearPageQuery,
  FiscalYearPageResponse,
  UpdateFiscalYearMutation,
} from "../types/FiscalYear";

const clean = (request: FiscalYearMutationRequest): FiscalYearMutationRequest => ({
  ...request,
  code: request.code.trim().toUpperCase(),
  nameAr: request.nameAr.trim(),
  nameEn: request.nameEn.trim(),
});

export class FiscalYearService {
  static getPage(query: FiscalYearPageQuery): Promise<FiscalYearPageResponse> {
    return apiService.get(apiRoutes.fiscalYears.page, { ...query });
  }

  static getLookup(): Promise<FiscalYearLookup[]> {
    return apiService.get(apiRoutes.fiscalYears.lookup);
  }

  static getById(id: number): Promise<FiscalYearDetail> {
    return apiService.get(apiRoutes.fiscalYears.getById(id));
  }

  static create(request: FiscalYearMutationRequest): Promise<FiscalYearDetail> {
    return apiService.post(apiRoutes.fiscalYears.create, clean(request));
  }

  static update({ id, request }: UpdateFiscalYearMutation): Promise<FiscalYearDetail> {
    return apiService.put(apiRoutes.fiscalYears.update(id), { ...clean(request), rowVersion: request.rowVersion });
  }

  static async archive(id: number): Promise<number> {
    await apiService.delete(apiRoutes.fiscalYears.archive(id));
    return id;
  }

  static restore(id: number, rowVersion: string): Promise<FiscalYearDetail> {
    return apiService.post(apiRoutes.fiscalYears.restore(id), { rowVersion });
  }

  static changeLifecycle(id: number, rowVersion: string, action: FiscalYearLifecycleAction): Promise<FiscalYearDetail> {
    return apiService.post(apiRoutes.fiscalYears[action](id), { rowVersion });
  }
}

export default FiscalYearService;
