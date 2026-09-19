import type {
  CompanyGeographicScope,
  CompanyGeographicScopeRequest,
} from '../models/company-geographic-scope';

export interface CompanyGeographicScopeRepository {
  get(): Promise<CompanyGeographicScope>;
  update(request: CompanyGeographicScopeRequest): Promise<CompanyGeographicScope>;
}
