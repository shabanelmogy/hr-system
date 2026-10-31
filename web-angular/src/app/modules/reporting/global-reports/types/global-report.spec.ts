import {
  emptyReportFilters,
  globalReportAllowed,
  parseGlobalReports,
  renderBody,
} from './global-report';
import { globalReportFixture as report } from '../report.fixture';

describe('Global managed Crystal contract', () => {
  it('requires both the exact global permission and the SuperAdmin role', () => {
    expect(globalReportAllowed(null)).toBe(false);
    expect(globalReportAllowed({ roles: ['super_admin'], permissions: [] })).toBe(false);
    expect(
      globalReportAllowed({ roles: ['user'], permissions: ['GlobalCrystalReports:View'] }),
    ).toBe(false);
    expect(
      globalReportAllowed({ roles: ['SUPER_ADMIN'], permissions: ['GlobalCrystalReports:View'] }),
    ).toBe(true);
    expect(globalReportAllowed({ roles: ['super_admin'], permissions: ['*'] })).toBe(false);
  });
  it('rejects duplicate sources, untrusted identities, and another entity', () => {
    expect(parseGlobalReports([report])).toEqual([report]);
    for (const value of [
      [report, report],
      [{ ...report, id: '../report' }],
      [{ ...report, entityKey: 'states' }],
      [{ ...report, isPublished: false }],
      {},
    ]) {
      expect(() => parseGlobalReports(value)).toThrow();
    }
  });
  it('maps only owned filter keys with the selected source hash and language', () => {
    expect(renderBody(report, emptyReportFilters, 'en')).toEqual({
      entityKey: 'countries',
      expectedSha256: report.rowVersion,
      language: 'en',
      filters: {},
    });
    expect(renderBody(report, { nameAr: 'مصر', nameEn: ' Egypt ' }, 'ar').filters).toEqual({
      NameAr: 'مصر',
      NameEn: ' Egypt ',
    });
    expect(
      renderBody(report, { nameAr: 'ع'.repeat(200), nameEn: '' }, 'ar').filters['NameAr'],
    ).toHaveLength(200);
    for (const input of [
      { nameAr: 'ع'.repeat(201), nameEn: '' },
      { ...emptyReportFilters, hidden: 'x' },
      { nameAr: null, nameEn: '' },
    ]) {
      expect(() => renderBody(report, input, 'ar')).toThrow();
    }
    expect(() => renderBody(report, emptyReportFilters, 'fr' as 'en')).toThrow();
  });
});
