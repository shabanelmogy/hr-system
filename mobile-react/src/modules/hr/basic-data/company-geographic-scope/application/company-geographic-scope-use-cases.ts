import type {
  CompanyGeographicScope,
  CompanyGeographicScopeRequest,
} from '../domain/models/company-geographic-scope';
import { normalizeCompanyGeographicScopeRequest } from '../domain/policies/company-geographic-scope-request-policy';
import type { CompanyGeographicScopeRepository } from '../domain/repositories/company-geographic-scope-repository';

export interface CompanyGeographicScopeUseCases {
  get(): Promise<CompanyGeographicScope>;
  update(request: CompanyGeographicScopeRequest): Promise<CompanyGeographicScope>;
}

export function createCompanyGeographicScopeUseCases(
  repository: CompanyGeographicScopeRepository,
): CompanyGeographicScopeUseCases {
  return {
    get: () => repository.get(),
    update: (request) => repository.update(normalizeCompanyGeographicScopeRequest(request)),
  };
}
