import type { UpdateWorkforcePlanRequest, WorkforcePlanDetail } from './workforce-plan';

export interface WorkforcePlanEditingOption {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
}

export interface WorkforcePlanEditingSnapshot {
  fiscalYears: WorkforcePlanEditingOption[];
  positions: WorkforcePlanEditingOption[];
  branches: WorkforcePlanEditingOption[];
  fiscalPeriodsByYear: Record<string, WorkforcePlanEditingOption[]>;
}

export interface WorkforcePlanLocalDraft {
  planId: number;
  commandId: string | null;
  request: UpdateWorkforcePlanRequest;
  baseDetail: WorkforcePlanDetail;
  editingSnapshot: WorkforcePlanEditingSnapshot;
  savedAt: string;
}

export type WorkforcePlanDraftSyncStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'conflict'
  | 'uncertain'
  | 'blocked'
  | 'dead-letter';

export interface WorkforcePlanDraftState {
  draft: WorkforcePlanLocalDraft;
  status: WorkforcePlanDraftSyncStatus | null;
  lastError: string | null;
}
