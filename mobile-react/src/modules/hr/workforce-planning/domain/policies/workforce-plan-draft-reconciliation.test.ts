import type { WorkforcePlanDetail } from '../models/workforce-plan';
import { workforcePlanMatchesDraftUpdate } from './workforce-plan-draft-reconciliation';

const detail: WorkforcePlanDetail = {
  id: 7, planSeriesId: '123e4567-e89b-12d3-a456-426614174000', planCode: 'WP-1', fiscalYearId: 1,
  revisionNumber: 1, previousRevisionId: null, titleEn: 'Plan', titleAr: 'خطة', description: null,
  status: 1, submittedOn: null, submittedById: null, approvedOn: null, approvedById: null,
  rejectedOn: null, rejectedById: null, decisionReason: null, activatedOn: null, supersededOn: null,
  lines: [{ id: 3, positionId: 2, targetBranchId: null, departmentId: 1, divisionId: 1,
    baselineHeadcount: 4, baselineAsOfDate: '2026-09-10', newHireSlots: 1, replacementSlots: 0,
    targetHeadcount: 5, plannedHiringSlots: 1, justification: null,
    periodTargets: [{ id: 5, fiscalPeriodId: 9, newHireSlots: 1, replacementSlots: 0 }] }],
  isDeleted: false, createdOn: '2026-09-10T00:00:00Z', updatedOn: null, rowVersion: 'AQ==',
};

describe('workforce plan draft reconciliation', () => {
  const request = {
    titleEn: 'Plan', titleAr: 'خطة', description: null, rowVersion: 'OLD==',
    lines: [{ positionId: 2, targetBranchId: null, newHireSlots: 1, replacementSlots: 0,
      justification: null, periodTargets: [{ fiscalPeriodId: 9, newHireSlots: 1, replacementSlots: 0 }] }],
  };

  it('matches the intended business fields while ignoring server generated line metadata', () => {
    expect(workforcePlanMatchesDraftUpdate(detail, request)).toBe(true);
  });

  it('detects a concurrent business-field change', () => {
    expect(workforcePlanMatchesDraftUpdate(detail, { ...request, titleEn: 'Different' })).toBe(false);
  });
});
