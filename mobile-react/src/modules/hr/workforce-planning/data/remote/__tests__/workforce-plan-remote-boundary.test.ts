import { describe, expect, it } from '@jest/globals';
import { workforcePlanEndpoints } from '../workforce-plan-endpoints';
import { workforcePlanDetailSchema, workforcePlanPageSchema } from '../workforce-plan-schemas';
import { toWorkforcePlanPageQuery } from '../workforce-plan-remote-data-source';

const detail = {
  id: 7, planSeriesId: '30d95a3e-6608-4c42-b1aa-5213026f485a', planCode: 'WP-2027', fiscalYearId: 1, revisionNumber: 1, previousRevisionId: null,
  titleEn: 'Workforce plan', titleAr: 'خطة القوى العاملة', description: null, status: 1, submittedOn: null, submittedById: null, approvedOn: null, approvedById: null,
  rejectedOn: null, rejectedById: null, decisionReason: null, activatedOn: null, supersededOn: null, createdOn: '2026-09-06T00:00:00Z', updatedOn: null, isDeleted: false, rowVersion: 'AQ==',
  lines: [{ id: 1, positionId: 10, targetBranchId: 2, departmentId: 3, divisionId: 4, baselineHeadcount: 1, baselineAsOfDate: '2026-09-06', newHireSlots: 2, replacementSlots: 1, targetHeadcount: 3, plannedHiringSlots: 3, justification: null, periodTargets: [{ id: 1, fiscalPeriodId: 100, newHireSlots: 2, replacementSlots: 1 }] }],
};
describe('Workforce Plan API boundary', () => {
  it('maps paging, lifecycle, and revision endpoints exactly', () => {
    expect(toWorkforcePlanPageQuery({ pageNumber: 2, pageSize: 5, status: 'underReview', recordStatus: 'archived', fiscalYearId: 1, search: ' plan ', sortBy: 'createdOn', sortDirection: 'desc' })).toBe('pageNumber=2&pageSize=5&sortBy=createdOn&sortDirection=desc&status=underReview&recordStatus=archived&fiscalYearId=1&search=plan');
    expect(workforcePlanEndpoints.beginReview(7)).toBe('workforce-planning/plans/7/begin-review');
    expect(workforcePlanEndpoints.revisions(7)).toBe('workforce-planning/plans/7/revisions');
    expect(workforcePlanEndpoints.restore(7)).toBe('workforce-planning/plans/7/restore');
  });

  it('parses the complete nested detail and rejects incomplete pages', () => {
    expect(workforcePlanDetailSchema.parse(detail).lines[0]?.periodTargets).toHaveLength(1);
    const list = { id: 7, planSeriesId: detail.planSeriesId, planCode: detail.planCode, fiscalYearId: 1, revisionNumber: 1, titleEn: detail.titleEn, titleAr: detail.titleAr, status: 1, linesCount: 1, newHireSlots: 2, replacementSlots: 1, plannedHiringSlots: 3, isEffective: false, isDeleted: false, createdOn: detail.createdOn, updatedOn: null, rowVersion: 'AQ==' };
    const metaData = { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false };
    expect(workforcePlanPageSchema.parse({ items: [list], metaData }).items).toHaveLength(1);
    expect(() => workforcePlanPageSchema.parse({ items: [{ ...list, rowVersion: '' }], metaData })).toThrow();
  });
});
