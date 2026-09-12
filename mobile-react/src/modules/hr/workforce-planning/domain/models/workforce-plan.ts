export type WorkforcePlanStatus = 1 | 2 | 3 | 4 | 5 | 6;
export interface WorkforcePlan {
  id: number; planSeriesId: string; planCode: string; fiscalYearId: number; revisionNumber: number;
  titleEn: string; titleAr: string; status: WorkforcePlanStatus; linesCount: number;
  newHireSlots: number; replacementSlots: number; plannedHiringSlots: number; isEffective: boolean; isDeleted: boolean; createdOn: string; updatedOn: string | null; rowVersion: string;
}
export interface WorkforcePlanPeriodTarget extends WorkforcePlanPeriodTargetRequest { id: number }
export interface WorkforcePlanLine extends WorkforcePlanLineRequest {
  id: number; departmentId: number; divisionId: number; baselineHeadcount: number; baselineAsOfDate: string;
  targetHeadcount: number; plannedHiringSlots: number;
  periodTargets: WorkforcePlanPeriodTarget[];
}
export interface WorkforcePlanDetail {
  id: number; planSeriesId: string; planCode: string; fiscalYearId: number; revisionNumber: number; titleEn: string; titleAr: string; status: WorkforcePlanStatus;
  previousRevisionId: number | null; description: string | null; submittedOn: string | null; submittedById: string | null;
  approvedOn: string | null; approvedById: string | null; rejectedOn: string | null; rejectedById: string | null;
  decisionReason: string | null; activatedOn: string | null; supersededOn: string | null; lines: WorkforcePlanLine[]; isDeleted: boolean;
  createdOn: string; updatedOn: string | null; rowVersion: string;
}
export interface WorkforcePlanPageQuery { pageNumber: number; pageSize: number; fiscalYearId?: number; status?: string; recordStatus?: 'active' | 'archived' | 'all'; search?: string; sortBy: string; sortDirection: 'asc' | 'desc'; }
export interface WorkforcePlanPeriodTargetRequest { fiscalPeriodId: number; newHireSlots: number; replacementSlots: number; }
export interface WorkforcePlanLineRequest { positionId: number; targetBranchId: number | null; newHireSlots: number; replacementSlots: number; justification?: string | null; periodTargets: WorkforcePlanPeriodTargetRequest[]; }
export interface WorkforcePlanRequest { planCode: string; fiscalYearId: number; titleEn: string; titleAr: string; description?: string | null; lines: WorkforcePlanLineRequest[]; }
export interface UpdateWorkforcePlanRequest { titleEn: string; titleAr: string; description?: string | null; lines: WorkforcePlanLineRequest[]; rowVersion: string }
export interface WorkforcePlanAction { id: number; rowVersion: string }
export interface RejectWorkforcePlanAction extends WorkforcePlanAction { reason: string }
