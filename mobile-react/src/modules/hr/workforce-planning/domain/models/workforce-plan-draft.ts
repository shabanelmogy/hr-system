import type { UpdateWorkforcePlanRequest, WorkforcePlanDetail } from './workforce-plan';

export interface WorkforcePlanLocalDraft {
  planId: number;
  commandId: string | null;
  request: UpdateWorkforcePlanRequest;
  baseDetail: WorkforcePlanDetail;
  savedAt: string;
}

export type WorkforcePlanDraftSyncStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'conflict'
  | 'uncertain'
  | 'blocked';

export interface WorkforcePlanDraftState {
  draft: WorkforcePlanLocalDraft;
  status: WorkforcePlanDraftSyncStatus | null;
  lastError: string | null;
}
