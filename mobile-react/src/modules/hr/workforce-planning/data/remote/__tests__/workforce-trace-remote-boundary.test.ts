import { workforceTraceEndpoints } from '../workforce-trace-endpoints';
import { toCommitmentQuery } from '../workforce-trace-remote-data-source';

describe('workforce trace remote boundary', () => {
  it('preserves trace endpoint paths', () => {
    expect(workforceTraceEndpoints.application(5)).toBe('workforce-planning/trace/application/5');
    expect(workforceTraceEndpoints.offer(6)).toBe('workforce-planning/trace/offer/6');
    expect(workforceTraceEndpoints.employee(7)).toBe('workforce-planning/trace/employee/7');
  });

  it('serializes commitment filters exactly', () => {
    expect(toCommitmentQuery({ fiscalYearId: 4, pageNumber: 2, pageSize: 25, positionId: 11, branchId: 3 })).toBe(
      'fiscalYearId=4&pageNumber=2&pageSize=25&positionId=11&branchId=3',
    );
  });
});
