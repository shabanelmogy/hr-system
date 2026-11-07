import {
  emptyReportFilters,
  globalReportAllowed,
  parseGlobalReports,
  renderBody,
} from './global-report';
import { globalReportFixture as report } from '../report.fixture';

describe('Global managed Crystal contract', () => {
  it('requires both system log and global report grants and preserves applied diagnostic criteria', () => {
    const actor = { roles: ['super_admin'], permissions: ['GlobalCrystalReports:View'] };
    expect(globalReportAllowed(actor, 'system-error-logs')).toBe(false);
    expect(
      globalReportAllowed(
        { ...actor, permissions: [...actor.permissions, 'SystemErrorLogs:View'] },
        'system-error-logs',
      ),
    ).toBe(true);
    expect(
      globalReportAllowed(
        {
          roles: ['tenant_admin'],
          permissions: ['SystemErrorLogs:View', 'CrystalReports:View'],
          tenantId: 'tenant',
          companyId: 1,
        },
        'system-error-logs',
      ),
    ).toBe(false);
    const body = renderBody(
      { ...report, entityKey: 'system-error-logs' },
      {
        nameAr: '',
        nameEn: '',
        systemErrorLogs: {
          statusCode: 500,
          search: 'Target',
          fromUtc: '2026-11-06T00:00:00Z',
          columnFilters: '[]',
        },
      },
      'en',
    );
    expect(body.filters).toEqual({
      StatusCode: '500',
      Search: 'Target',
      FromUtc: '2026-11-06T00:00:00Z',
      ColumnFilters: '[]',
    });
    expect(() =>
      renderBody(
        { ...report, entityKey: 'system-error-logs' },
        { nameAr: '', nameEn: '', systemErrorLogs: { statusCode: 200 } },
        'en',
      ),
    ).toThrow();
  });
  it('permits company consumers only with trusted scope, reporting and owning entity permissions', () => {
    const user = {
      roles: ['user'],
      tenantId: 'tenant-a',
      companyId: 1,
      permissions: ['CrystalReports:View', 'Countries:View'],
    };
    expect(globalReportAllowed(user)).toBe(true);
    expect(globalReportAllowed({ ...user, tenantId: null })).toBe(false);
    expect(globalReportAllowed({ ...user, companyId: 0 })).toBe(false);
    expect(globalReportAllowed(user, 'states')).toBe(false);
    expect(globalReportAllowed({ ...user, roles: ['super_admin'] })).toBe(false);
  });
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
  it('maps State parent criteria only for District reports and strips them from other entities', () => {
    const districtReport = { ...report, entityKey: 'districts' as const };
    const filters = {
      nameAr: 'حي',
      nameEn: 'District',
      stateAr: 'القاهرة',
      stateEn: 'Cairo',
    };

    expect(renderBody(districtReport, filters, 'en').filters).toEqual({
      NameAr: 'حي',
      NameEn: 'District',
      StateAr: 'القاهرة',
      StateEn: 'Cairo',
    });
    expect(renderBody(report, filters, 'en').filters).toEqual({
      NameAr: 'حي',
      NameEn: 'District',
    });
  });
});
