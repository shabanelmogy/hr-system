import {
  buildAddressTypeRenderFilters,
  getAddressTypeReportDisplayName,
} from './address-type-report-api';

describe('Address Type report boundary', () => {
  it('uses only approved filters and localized summary names', () => {
    expect(buildAddressTypeRenderFilters(' منزل ', ' Home ')).toEqual({ NameAr: 'منزل', NameEn: 'Home' });
    const report = {
      id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      entityKey: 'addresstypes',
      reportKey: 'addresstypes-directory',
      displayName: 'Address types',
      summaryTitle: 'دليل أنواع العناوين',
      summarySubject: 'Address type directory',
      description: null,
      currentVersionNumber: 1,
      isPublished: true,
      isArchived: false,
      rowVersion: '0x1',
      updatedOn: '2026-08-24T10:00:00Z',
    };
    expect(getAddressTypeReportDisplayName(report, 'ar')).toBe('دليل أنواع العناوين');
    expect(getAddressTypeReportDisplayName(report, 'en')).toBe('Address type directory');
  });
});
