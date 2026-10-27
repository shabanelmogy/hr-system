import { createErrorLogUseCases } from '../../application/error-log-use-cases';
import { errorLogEndpoints } from './error-log-endpoints';
import { errorLogParams } from './error-log-remote-data-source';
import { errorLogDetailSchema, errorLogPageSchema, errorLogSettingsSchema } from './error-log-schemas';

const row = {
  id: '60c804af-c503-49e8-9187-753c641563fa', occurredOnUtc: '2026-10-17T12:00:00Z', source: 'api', severity: 'error',
  userName: null, service: null, action: null, statusCode: 500, durationMs: null,
  correlationId: null, summary: 'Request failed', client: null, browser: null, ipAddress: null,
};

describe('error log remote boundary', () => {
  it('accepts the persisted .NET GUID contract without requiring RFC UUID bits', () => {
    const captured = { ...row, id: '2b92450e-c383-feee-339f-77cae87a7ad6', source: 'mobile' };
    expect(errorLogPageSchema.parse({ items: [captured], totalCount: 1, page: 1, pageSize: 10 }).items[0].id).toBe(captured.id);
    expect(errorLogDetailSchema.parse({ entry: captured, diagnostics: [] }).entry.id).toBe(captured.id);
    expect(() => errorLogDetailSchema.parse({ entry: { ...captured, id: 'not-a-guid' }, diagnostics: [] })).toThrow();
  });
  it('maps criteria without client-provided scope', () => {
    expect(errorLogEndpoints.list('company')).toBe('error-logs');
    expect(errorLogEndpoints.list('system')).toBe('system-error-logs');
    expect(errorLogEndpoints.settings).toBe('system-error-logs/settings');
    expect(errorLogParams({ page: 2, pageSize: 10, search: 'failure', source: 'api' })).toEqual({ page: 2, pageSize: 10, search: 'failure', source: 'api' });
  });

  it('fails closed on incomplete rows and parses safe detail/settings envelopes', () => {
    expect(errorLogPageSchema.parse({ items: [row], totalCount: 1, page: 1, pageSize: 10 }).items).toHaveLength(1);
    expect(() => errorLogPageSchema.parse({ items: [{ ...row, summary: undefined }], totalCount: 1, page: 1, pageSize: 10 })).toThrow();
    expect(errorLogDetailSchema.parse({ entry: row, diagnostics: ['Method.Frame'] }).diagnostics).toEqual(['Method.Frame']);
    expect(errorLogSettingsSchema.parse({ retentionDays: 30, revision: 1, queueDepth: 0, droppedCount: 0, failedWrites: 0 }).retentionDays).toBe(30);
    expect(() => errorLogSettingsSchema.parse({ retentionDays: 3651, revision: 1, queueDepth: 0, droppedCount: 0, failedWrites: 0 })).toThrow();
  });

  it('rejects invalid retention before a repository call', async () => {
    const repository = { list: jest.fn(), detail: jest.fn(), export: jest.fn(), settings: jest.fn(), saveSettings: jest.fn() };
    const cases = createErrorLogUseCases(repository);
    expect(() => cases.saveSettings(0, 2)).toThrow();
    expect(() => cases.saveSettings(20, -1)).toThrow();
    expect(repository.saveSettings).not.toHaveBeenCalled();
  });
});
