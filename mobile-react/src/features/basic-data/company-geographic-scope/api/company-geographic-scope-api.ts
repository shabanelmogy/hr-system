import { apiService } from '@/src/core/api';
import { companyGeographicScopeEndpoints } from './company-geographic-scope-endpoints';
import { companyGeographicScopeSchema } from './company-geographic-scope-schemas';
import type {
  CompanyGeographicScope,
  CompanyGeographicScopeRequest,
} from '../types/company-geographic-scope';

export const companyGeographicScopeApi = {
  async get(): Promise<CompanyGeographicScope> {
    return companyGeographicScopeSchema.parse(
      await apiService.get<unknown>(companyGeographicScopeEndpoints.current),
    );
  },

  async update(request: CompanyGeographicScopeRequest): Promise<CompanyGeographicScope> {
    return companyGeographicScopeSchema.parse(
      await apiService.put<unknown, CompanyGeographicScopeRequest>(
        companyGeographicScopeEndpoints.current,
        {
          countryIds: [...request.countryIds],
          registrationCountryId: request.registrationCountryId,
          defaultCountryId: request.defaultCountryId,
        },
      ),
    );
  },
};
