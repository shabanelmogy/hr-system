import type { CompanyGeographicScopeRepository } from '../../domain/repositories/company-geographic-scope-repository';
import type { CompanyGeographicScopeRemoteDataSource } from '../remote/company-geographic-scope-remote-data-source';

export class DefaultCompanyGeographicScopeRepository implements CompanyGeographicScopeRepository {
  constructor(
    private readonly remote: CompanyGeographicScopeRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Company geographic scope requires an internet connection.');
  }

  get() {
    this.requireOnline();
    return this.remote.get();
  }

  update(request: Parameters<CompanyGeographicScopeRepository['update']>[0]) {
    this.requireOnline();
    return this.remote.update(request);
  }
}
