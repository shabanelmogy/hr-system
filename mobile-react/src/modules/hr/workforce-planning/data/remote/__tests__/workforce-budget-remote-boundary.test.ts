import { describe, expect, it } from '@jest/globals';
import { workforceBudgetEndpoints } from '../workforce-budget-endpoints';
import { budgetSourcePlanPageSchema, budgetSourcePlanSchema, positionEnvelopeDetailSchema, positionEnvelopePageSchema, workforceBudgetDetailSchema, workforceBudgetPageSchema } from '../workforce-budget-schemas';
import { toPositionEnvelopePageQuery, toWorkforceBudgetPageQuery } from '../workforce-budget-remote-data-source';

const detail = {
  id: 3, budgetCode: 'WB-2027-001', workforcePlanId: 9, fiscalYearId: 4, revisionNumber: 1, currencyCode: 'EGP', calculationPolicyVersion: '2026-09-V1', status: 1,
  submittedOn: null, submittedById: null, approvedOn: null, approvedById: null, rejectedOn: null, rejectedById: null, decisionReason: null,
  activatedOn: null, supersededOn: null, totalAuthorizedHeadcount: 2, totalSalaryBudget: 120000, totalRecruitmentBudget: 8000, grandTotalBudget: 128000, isEffective: false,
  createdOn: '2026-09-06T00:00:00Z', updatedOn: null, rowVersion: 'AQ==',
  lines: [{ id: 5, workforcePlanLineId: 11, positionId: 10, branchId: 2, departmentId: 3, divisionId: 4, authorizedHeadcount: 2, allocatedSalaryBudget: 120000, allocatedRecruitmentBudget: 8000, totalAllocatedBudget: 128000, periodAllocations: [{ id: 8, fiscalPeriodId: 100, targetHeadcount: 2, allocatedSalaryCost: 120000, allocatedRecruitmentCost: 8000 }] }],
};
describe('Workforce Budget API boundary', () => {
  it('maps paging, lifecycle, source-plan, and envelope endpoints exactly', () => {
    expect(toWorkforceBudgetPageQuery({ pageNumber: 2, pageSize: 5, status: 'submitted', fiscalYearId: 4, workforcePlanId: 9, search: ' wb ', sortBy: 'createdOn', sortDirection: 'desc' })).toBe('pageNumber=2&pageSize=5&sortBy=createdOn&sortDirection=desc&status=submitted&fiscalYearId=4&workforcePlanId=9&search=wb');
    expect(toPositionEnvelopePageQuery({ pageNumber: 1, pageSize: 5, fiscalYearId: 4, search: '', sortBy: 'createdOn', sortDirection: 'desc' })).toBe('pageNumber=1&pageSize=5&sortBy=createdOn&sortDirection=desc&fiscalYearId=4');
    expect(workforceBudgetEndpoints.submit(3)).toBe('workforce-planning/budgets/3/submit');
    expect(workforceBudgetEndpoints.approve(3)).toBe('workforce-planning/budgets/3/approve');
    expect(workforceBudgetEndpoints.reject(3)).toBe('workforce-planning/budgets/3/reject');
    expect(workforceBudgetEndpoints.sourcePlans).toBe('workforce-planning/budgets/source-plans');
    expect(workforceBudgetEndpoints.sourcePlanById(9)).toBe('workforce-planning/budgets/source-plans/9');
    expect(workforceBudgetEndpoints.envelopeById(2)).toBe('workforce-planning/position-envelopes/2');
  });

  it('parses the complete nested detail, source plans, and envelopes while rejecting incomplete pages', () => {
    expect(workforceBudgetDetailSchema.parse(detail).lines[0]?.periodAllocations).toHaveLength(1);
    const list = { id: 3, budgetCode: detail.budgetCode, workforcePlanId: 9, fiscalYearId: 4, revisionNumber: 1, currencyCode: 'EGP', status: 1, totalAuthorizedHeadcount: 2, totalSalaryBudget: 120000, totalRecruitmentBudget: 8000, grandTotalBudget: 128000, isEffective: false, activatedOn: null, createdOn: detail.createdOn, updatedOn: null, rowVersion: 'AQ==' };
    const metaData = { currentPage: 1, totalPages: 1, pageSize: 5, pageNumber: 1, totalCount: 1, hasPrev: false, hasNext: false };
    expect(workforceBudgetPageSchema.parse({ items: [list], metaData }).items).toHaveLength(1);
    expect(() => workforceBudgetPageSchema.parse({ items: [{ ...list, rowVersion: '' }], metaData })).toThrow();
    const sourcePlan = { id: 9, planCode: 'WP-2027', fiscalYearId: 4, revisionNumber: 1, titleEn: 'Plan', titleAr: 'خطة', fiscalPeriodIds: [100], lines: [{ id: 11, positionId: 10, targetBranchId: 2, departmentId: 3, divisionId: 4, baselineHeadcount: 1, newHireSlots: 2, replacementSlots: 0, plannedHiringSlots: 2, justification: null, periodTargets: [{ fiscalPeriodId: 100, newHireSlots: 2, replacementSlots: 0 }] }] };
    expect(budgetSourcePlanSchema.parse(sourcePlan).lines).toHaveLength(1);
    expect(budgetSourcePlanPageSchema.parse({ items: [sourcePlan], metaData }).items).toHaveLength(1);
    const envelope = { id: 2, envelopeCode: 'WB-2027-001-P11', workforceBudgetId: 3, workforceBudgetLineId: 5, workforcePlanId: 9, workforcePlanLineId: 11, fiscalYearId: 4, positionId: 10, branchId: 2, departmentId: 3, divisionId: 4, currencyCode: 'EGP', calculationPolicyVersion: '2026-09-V1', authorizedHeadcount: 2, reservedHeadcount: 0, hiredHeadcount: 0, availableHeadcount: 2, authorizedSalaryBudget: 120000, reservedSalaryBudget: 0, contractedSalaryBudget: 0, availableSalaryBudget: 120000, createdOn: detail.createdOn, updatedOn: null, rowVersion: 'AQ==' };
    expect(positionEnvelopeDetailSchema.parse(envelope).envelopeCode).toBe('WB-2027-001-P11');
    const { workforceBudgetLineId, workforcePlanLineId, calculationPolicyVersion, updatedOn, ...listEnvelope } = envelope;
    void workforceBudgetLineId; void workforcePlanLineId; void calculationPolicyVersion; void updatedOn;
    expect(positionEnvelopePageSchema.parse({ items: [listEnvelope], metaData }).items).toHaveLength(1);
  });
});
