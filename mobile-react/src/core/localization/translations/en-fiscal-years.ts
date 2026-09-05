export const enFiscalYears = {
  fiscalYears: {
    empty: 'No fiscal years match the current search and filters.',
    fields: { code: 'Code', nameAr: 'Arabic name', nameEn: 'English name', startDate: 'Start date', endDate: 'End date', frequency: 'Period frequency', status: 'Status' },
    frequency: { monthly: 'Monthly', quarterly: 'Quarterly' },
    status: { all: 'All statuses', draft: 'Draft', open: 'Open', closing: 'Closing', closed: 'Closed', locked: 'Locked' },
    recordStatus: { active: 'Active records', archived: 'Archived records', all: 'All records' },
    search: {
      placeholder: 'Search fiscal years', fields: { all: 'All columns', code: 'Code', nameAr: 'Arabic name', nameEn: 'English name' },
      operators: { contains: 'Contains', doesNotContain: 'Does not contain', equals: 'Equals', doesNotEqual: 'Does not equal', startsWith: 'Starts with', endsWith: 'Ends with' },
    },
    filters: { title: 'Fiscal year filters', description: 'Filter the company financial calendar by record and lifecycle status.', recordStatus: 'Record status', lifecycle: 'Lifecycle status', searchField: 'Search column', operator: 'Condition' },
    actions: { add: 'Add fiscal year', lifecycle: 'Advance lifecycle' },
    lifecycle: { open: 'Open year', beginClosing: 'Begin closing', close: 'Close year', lock: 'Lock year' },
    form: { createTitle: 'Add Fiscal Year', editTitle: 'Edit Fiscal Year', viewTitle: 'Fiscal Year Details', subtitle: 'Define the financial calendar used by workforce plans and budgets.', identity: 'Fiscal year identity', calendar: 'Calendar and periods', endDateHelper: 'Calculated automatically to cover exactly twelve months.', periodsHelper: 'Monthly or quarterly periods are generated automatically.' },
    periods: { title: 'Generated periods', count: '{{count}} periods', item: 'Period {{sequence}}' },
    validation: { code: 'Enter a valid code of 2–20 characters.', name: 'Enter a valid name of 2–100 characters.', startDate: 'Select the start date.', endDate: 'Select the end date.', duration: 'The fiscal year must cover exactly twelve months.' },
    messages: { created: 'Fiscal year created.', updated: 'Fiscal year updated.', archive: 'Fiscal year archived.', restore: 'Fiscal year restored.', lifecycle: 'Fiscal year lifecycle advanced.', loadFailed: 'Unable to load fiscal years.', saveFailed: 'Unable to save the fiscal year.', actionFailed: 'Unable to complete the fiscal-year action.' },
    confirm: {
      archiveTitle: 'Archive fiscal year?', archiveDescription: 'Only a draft fiscal year can be archived.', restoreTitle: 'Restore fiscal year?', restoreDescription: 'The draft calendar will become active again.',
      openTitle: 'Open fiscal year?', openDescription: 'The calendar becomes available to workforce plans and can no longer be edited.', beginClosingTitle: 'Begin fiscal-year closing?', beginClosingDescription: 'The year enters the controlled closing phase.', closeTitle: 'Close fiscal year?', closeDescription: 'All periods will be closed.', lockTitle: 'Lock fiscal year?', lockDescription: 'Locking is final in this release.',
    },
  },
  FiscalYearNotificationTitle: 'Fiscal year updated',
  FiscalYearCreatedNotificationMessage: 'Fiscal year {{Code}} was created.',
  FiscalYearUpdatedNotificationMessage: 'Fiscal year {{Code}} was updated.',
  FiscalYearArchivedNotificationMessage: 'Fiscal year {{Code}} was archived.',
  FiscalYearRestoredNotificationMessage: 'Fiscal year {{Code}} was restored.',
};
