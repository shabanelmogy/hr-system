import { describe, expect, it } from '@jest/globals';
import {
  getNextOrganizationalStructureMockData,
  organizationalStructureMockDependenciesReady,
} from './organizational-structure-mock-data';

const lookups = {
  branches: [{ id: 11, code: 'BR-CAI', nameEn: 'Cairo', nameAr: 'القاهرة' }],
  departments: [{ id: 21, code: 'FIN', nameEn: 'Finance', nameAr: 'المالية' }],
  divisions: [{ id: 31, code: 'AP', nameEn: 'Accounts Payable', nameAr: 'الحسابات الدائنة' }],
  'job-titles': [{ id: 41, code: 'ACCOUNTANT', nameEn: 'Accountant', nameAr: 'محاسب' }],
  'job-levels': [{ id: 51, code: 'L3', nameEn: 'Professional III', nameAr: 'أخصائي ثالث' }],
  positions: [{ id: 61, code: 'FIN-001', nameEn: 'Finance Position', nameAr: 'وظيفة مالية' }],
};

describe('organizational structure mock data', () => {
  it('resolves active lookup relationships for dependent resources', () => {
    expect(getNextOrganizationalStructureMockData('departments', new Set(), lookups).branchId).toBe(11);
    expect(getNextOrganizationalStructureMockData('divisions', new Set(), lookups).departmentId).toBe(21);
    expect(getNextOrganizationalStructureMockData('positions', new Set(), lookups)).toMatchObject({ divisionId: 31, jobTitleId: 41, jobLevelId: 51 });
    expect(getNextOrganizationalStructureMockData('job-descriptions', new Set(), lookups).positionId).toBe(61);
  });

  it('reports when a dependent lookup is not ready', () => {
    expect(organizationalStructureMockDependenciesReady('branches', {})).toBe(true);
    expect(organizationalStructureMockDependenciesReady('positions', {})).toBe(false);
    expect(organizationalStructureMockDependenciesReady('positions', lookups)).toBe(true);
  });
});
