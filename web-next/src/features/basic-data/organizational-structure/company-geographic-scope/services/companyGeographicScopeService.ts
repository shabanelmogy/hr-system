import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  CompanyGeographicScope,
  UpdateCompanyGeographicScopeRequest,
} from "../types/CompanyGeographicScope";

export const companyGeographicScopeService = {
  get(): Promise<CompanyGeographicScope> {
    return apiService.get<CompanyGeographicScope>(apiRoutes.companyGeographicScope);
  },

  update(request: UpdateCompanyGeographicScopeRequest): Promise<CompanyGeographicScope> {
    return apiService.put<CompanyGeographicScope>(apiRoutes.companyGeographicScope, {
      countryIds: [...request.countryIds],
      registrationCountryId: request.registrationCountryId,
      defaultCountryId: request.defaultCountryId,
    });
  },
};
