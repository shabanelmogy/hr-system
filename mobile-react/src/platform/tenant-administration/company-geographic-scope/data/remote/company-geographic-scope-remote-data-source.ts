import { apiService } from '@/src/core/api';

import type {
  CompanyGeographicScope,
  CompanyGeographicScopeRequest,
} from '../../domain/models/company-geographic-scope';
import { companyGeographicScopeEndpoints } from './company-geographic-scope-endpoints';
import { companyGeographicScopeSchema } from './company-geographic-scope-schemas';

export interface CompanyGeographicScopeRemoteDataSource {
  get(): Promise<CompanyGeographicScope>;
  update(request: CompanyGeographicScopeRequest): Promise<CompanyGeographicScope>;
}

export const companyGeographicScopeRemoteDataSource: CompanyGeographicScopeRemoteDataSource = {
  async get() {
    return companyGeographicScopeSchema.parse(
      await apiService.get<unknown>(companyGeographicScopeEndpoints.current),
    );
  },
  async update(request) {
    return companyGeographicScopeSchema.parse(
      await apiService.put<unknown, CompanyGeographicScopeRequest>(
        companyGeographicScopeEndpoints.current,
        request,
      ),
    );
  },
};
