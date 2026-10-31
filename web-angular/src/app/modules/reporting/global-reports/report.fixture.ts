import type { GlobalReport } from './types/global-report';
/** Synthetic deployment source; contains no deployed report bytes or credentials. */
export const globalReportFixture: GlobalReport = {
  id: 'a'.repeat(64),
  entityKey: 'countries',
  reportKey: 'countries',
  displayName: 'Countries fixture',
  summaryTitle: 'الدول',
  summarySubject: 'Countries',
  description: null,
  currentVersionNumber: null,
  isPublished: true,
  isArchived: false,
  rowVersion: 'b'.repeat(64),
  updatedOn: null,
};
