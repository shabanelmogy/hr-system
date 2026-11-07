import {
  errorLogParameters,
  parseErrorLogDetail,
  parseErrorLogPage,
  parseErrorLogSettings,
  parseXlsxErrorLogExport,
} from './error-log';

const row = {
  id: '2b92450e-c383-feee-339f-77cae87a7ad6',
  occurredOnUtc: '2026-10-17T12:00:00Z',
  source: 'web',
  severity: 'error',
  userName: null,
  service: null,
  action: null,
  statusCode: null,
  durationMs: null,
  correlationId: null,
  summary: 'Raw text stays raw',
  client: null,
  browser: null,
  ipAddress: null,
};
describe('system error log contracts', () => {
  it('uses the source fallback filename when CORS does not expose Content-Disposition', () => {
    const blob = new Blob(['xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    expect(parseXlsxErrorLogExport(blob, null, blob.type)).toMatchObject({
      blob,
      fileName: 'error-logs.xlsx',
    });
  });
  it('accepts .NET hash-derived GUIDs and nullable raw DTO fields', () => {
    expect(parseErrorLogPage({ items: [row], totalCount: 1, page: 1, pageSize: 25 })).toMatchObject(
      { items: [row] },
    );
    expect(parseErrorLogDetail({ entry: row, diagnostics: [] }, row.id)).toMatchObject({
      entry: row,
    });
  });
  it('canonicalizes valid GUID identities before matching details and rows', () => {
    const uppercaseId = row.id.toUpperCase();
    expect(parseErrorLogDetail({ entry: row, diagnostics: [] }, uppercaseId).entry.id).toBe(row.id);
    expect(() =>
      parseErrorLogPage({
        items: [row, { ...row, id: uppercaseId }],
        totalCount: 2,
        page: 1,
        pageSize: 25,
      }),
    ).toThrow();
  });
  it('rejects malformed payloads, duplicate IDs, unsafe integers and mismatched details', () => {
    expect(() =>
      parseErrorLogPage({
        items: [{ ...row, id: 'not-a-guid' }],
        totalCount: 1,
        page: 1,
        pageSize: 25,
      }),
    ).toThrow();
    expect(() =>
      parseErrorLogPage({ items: [row, row], totalCount: 2, page: 1, pageSize: 25 }),
    ).toThrow();
    expect(() =>
      parseErrorLogPage({
        items: [row],
        totalCount: Number.MAX_SAFE_INTEGER + 1,
        page: 1,
        pageSize: 25,
      }),
    ).toThrow();
    expect(() =>
      parseErrorLogDetail(
        { entry: { ...row, id: '00000000-0000-0000-0000-000000000002' }, diagnostics: [] },
        row.id,
      ),
    ).toThrow();
    expect(() =>
      parseErrorLogSettings({
        retentionDays: 90,
        revision: -1,
        queueDepth: 0,
        droppedCount: 0,
        failedWrites: 0,
      }),
    ).toThrow();
  });
  it('allows only documented valid criteria and detects inverted UTC ranges', () => {
    expect(
      errorLogParameters({ page: 1, pageSize: 25, source: 'api', userName: 'raw user' }),
    ).toEqual({ page: '1', pageSize: '25', source: 'api', userName: 'raw user' });
    expect(() =>
      errorLogParameters({
        page: 1,
        pageSize: 25,
        fromUtc: '2026-01-02T00:00:00Z',
        toUtc: '2026-01-01T00:00:00Z',
      }),
    ).toThrow();
    expect(() =>
      errorLogParameters({ page: 1, pageSize: 25, fromUtc: '2026-02-30T00:00:00Z' }),
    ).toThrow();
  });
  it('prefers a UTF-8 filename star from the ASP.NET attachment header', () => {
    const blob = new Blob(['xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    expect(
      parseXlsxErrorLogExport(
        blob,
        "attachment; filename=legacy.xlsx; filename*=UTF-8''system%20error%20logs.xlsx",
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ),
    ).toMatchObject({ fileName: 'system error logs.xlsx' });
    expect(
      parseXlsxErrorLogExport(
        blob,
        ' attachment ; filename*=UTF-8\'\'first.xlsx ; filename="fallback.xlsx" ',
        blob.type,
      ),
    ).toMatchObject({ fileName: 'first.xlsx' });
  });
  it('rejects malformed or unsafe XLSX attachment parameters', () => {
    const blob = new Blob(['xlsx'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    expect(() =>
      parseXlsxErrorLogExport(blob, 'attachment; filename="../../logs.xlsx"', blob.type),
    ).toThrow();
    expect(() =>
      parseXlsxErrorLogExport(blob, "attachment; filename*=UTF-8''%E0%A4.xlsx", blob.type),
    ).toThrow();
    expect(() =>
      parseXlsxErrorLogExport(blob, 'attachment; filename="bad\u0001.xlsx"', blob.type),
    ).toThrow();
    expect(() =>
      parseXlsxErrorLogExport(
        new Blob(['not-xlsx']),
        'attachment; filename="error-logs.xlsx"',
        'text/html',
      ),
    ).toThrow();
  });
});
