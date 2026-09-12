import {
  buildDistrictRenderFilters,
  getDistrictReportDisplayName,
} from './district-report-api';

describe('district report presentation boundary', () => {
  it('maps only nonblank District and State filters to the managed render contract', () => {
    expect(buildDistrictRenderFilters(' المعادي ', ' Maadi ', ' القاهرة ', ' Cairo ')).toEqual({
      NameAr: 'المعادي',
      NameEn: 'Maadi',
      StateAr: 'القاهرة',
      StateEn: 'Cairo',
    });
    expect(buildDistrictRenderFilters(' ', '', '  ', '')).toEqual({});
  });

  it('uses managed SummaryInfo for localized District report names with a stable fallback', () => {
    const report = {
      id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      entityKey: 'districts',
      reportKey: 'districts-directory',
      displayName: 'Districts directory',
      summaryTitle: 'دليل الأحياء',
      summarySubject: 'Districts directory report',
      description: null,
      currentVersionNumber: 1,
      isPublished: true,
      isArchived: false,
      rowVersion: 'AQIDBA==',
      updatedOn: '2026-08-24T10:00:00Z',
    };

    expect(getDistrictReportDisplayName(report, 'ar')).toBe('دليل الأحياء');
    expect(getDistrictReportDisplayName(report, 'en')).toBe('Districts directory report');
    expect(getDistrictReportDisplayName({ ...report, summaryTitle: null }, 'ar')).toBe('Districts directory');
  });
});
