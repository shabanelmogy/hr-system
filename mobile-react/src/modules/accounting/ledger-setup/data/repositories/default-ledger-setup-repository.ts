import type { LedgerSetupRepository } from '../../domain/repositories/ledger-setup-repository';
import type { LedgerSetupEntity, LedgerSetupFormValues, LedgerSetupOptionSource, LedgerSetupRecord, ResolveAccountPreviewRequest, ResolveAccountPreviewResponse } from '../../domain/models/ledger-setup';

export class DefaultLedgerSetupRepository implements LedgerSetupRepository {
  constructor(private readonly remote: LedgerSetupRepository) {}
  list(entity: LedgerSetupEntity, scopeId?: number, pageNumber?: number, pageSize?: number, search?: string) { return this.remote.list(entity, scopeId, pageNumber, pageSize, search); }
  account(id: number) { return this.remote.account(id); }
  accountTree() { return this.remote.accountTree(); }
  lookups(sources?: readonly LedgerSetupOptionSource[]) { return this.remote.lookups(sources); }
  save(entity: LedgerSetupEntity, id: number | null, request: LedgerSetupFormValues) { return this.remote.save(entity, id, request); }
  archive(entity: LedgerSetupEntity, item: LedgerSetupRecord) { return this.remote.archive(entity, item); }
  restore(entity: LedgerSetupEntity, item: LedgerSetupRecord) { return this.remote.restore(entity, item); }
  resolvePreview(request: ResolveAccountPreviewRequest): Promise<ResolveAccountPreviewResponse> { return this.remote.resolvePreview(request); }
}
