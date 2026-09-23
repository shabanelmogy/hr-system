import type { LedgerSetupEntity, LedgerSetupFormValues, LedgerSetupOptionSource, LedgerSetupRecord, ResolveAccountPreviewRequest, ResolveAccountPreviewResponse } from '../models/ledger-setup';

export interface LedgerSetupRepository {
  list(entity: LedgerSetupEntity, scopeId?: number, pageNumber?: number, pageSize?: number, search?: string): Promise<LedgerSetupRecord[]>;
  account(id: number): Promise<LedgerSetupRecord>;
  accountTree(): Promise<LedgerSetupRecord[]>;
  lookups(sources?: readonly LedgerSetupOptionSource[]): Promise<Record<string, LedgerSetupRecord[]>>;
  save(entity: LedgerSetupEntity, id: number | null, request: LedgerSetupFormValues): Promise<LedgerSetupRecord>;
  archive(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<void>;
  restore(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<LedgerSetupRecord>;
  resolvePreview(request: ResolveAccountPreviewRequest): Promise<ResolveAccountPreviewResponse>;
}
