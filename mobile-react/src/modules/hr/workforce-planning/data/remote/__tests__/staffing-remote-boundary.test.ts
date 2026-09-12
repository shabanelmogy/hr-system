import { staffingEndpoints } from '../staffing-endpoints';
import { toStaffingQuery } from '../staffing-remote-data-source';

describe('staffing remote boundary', () => {
  it('preserves request and amendment query serialization', () => {
    expect(toStaffingQuery({ pageNumber: 2, pageSize: 10, envelopeId: 7, fiscalYearId: 4, status: 'approved', search: ' urgent ', sortBy: 'targetStartDate', sortDirection: 'asc' })).toBe(
      'pageNumber=2&pageSize=10&sortBy=targetStartDate&sortDirection=asc&envelopeId=7&fiscalYearId=4&status=approved&search=urgent',
    );
    expect(toStaffingQuery({ pageNumber: 1, pageSize: 5, envelopeId: 7, status: 'draft', search: '', sortBy: 'createdOn', sortDirection: 'desc' })).toBe(
      'pageNumber=1&pageSize=5&sortBy=createdOn&sortDirection=desc&envelopeId=7&status=draft',
    );
  });

  it('preserves lifecycle endpoint paths', () => {
    expect(staffingEndpoints.amendmentApprove(3)).toBe('workforce-planning/envelope-amendments/3/approve');
    expect(staffingEndpoints.requestClose(9)).toBe('workforce-planning/staffing-requests/9/close');
  });
});
