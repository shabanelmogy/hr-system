import type { LedgerSetupEntity, LedgerSetupFormValues, LedgerSetupOptionSource, LedgerSetupRecord, ResolveAccountPreviewRequest, ResolveAccountPreviewResponse } from '../domain/models/ledger-setup';
import type { LedgerSetupRepository } from '../domain/repositories/ledger-setup-repository';

export interface LedgerSetupUseCases {
  list(entity: LedgerSetupEntity, scopeId?: number, pageNumber?: number, pageSize?: number, search?: string): Promise<LedgerSetupRecord[]>;
  account(id: number): Promise<LedgerSetupRecord>;
  accountTree(): Promise<LedgerSetupRecord[]>;
  lookups(sources?: readonly LedgerSetupOptionSource[]): Promise<Record<string, LedgerSetupRecord[]>>;
  save(entity: LedgerSetupEntity, id: number | null, request: LedgerSetupFormValues): Promise<LedgerSetupRecord>;
  archive(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<void>;
  restore(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<LedgerSetupRecord>;
  resolvePreview(request: ResolveAccountPreviewRequest): Promise<ResolveAccountPreviewResponse>;
}

export function createLedgerSetupUseCases(repository: LedgerSetupRepository): LedgerSetupUseCases {
  return {
    list: (entity, scopeId, pageNumber, pageSize, search) => repository.list(entity, scopeId, pageNumber, pageSize, search),
    account: (id) => repository.account(id),
    accountTree: () => repository.accountTree(),
    lookups: (sources) => repository.lookups(sources),
    save: (entity, id, request) => repository.save(entity, id, request),
    archive: (entity, item) => repository.archive(entity, item),
    restore: (entity, item) => repository.restore(entity, item),
    resolvePreview: (request) => repository.resolvePreview(request),
  };
}
