import { trackChangeEndpoints } from './track-change-endpoints';
import { toTrackChangeLogs } from './track-change-remote-data-source';
import { trackChangeLogSchema } from './track-change-schemas';

describe('track changes remote boundary', () => {
  it('preserves the change-log endpoint', () => {
    expect(trackChangeEndpoints.all).toBe('entityChangeLogs/getAllChangesLogs');
  });

  it('accepts canonical change-log responses', () => {
    const change = trackChangeLogSchema.parse({
      changeLogId: 'change-1',
      entityName: 'Country',
      key: 'NameEn',
      oldValue: 'Old',
      newValue: 'New',
      changedBy: 'admin',
      changedAt: '2026-08-20T10:00:00Z',
      changedByPc: 'WEB',
    });
    expect(change).toMatchObject({ changeLogId: 'change-1', entityName: 'Country' });

    const normalized = toTrackChangeLogs([change, change]);
    expect(normalized[0]?.id).toBeDefined();
    expect(normalized[1]?.id).toBe(`${normalized[0]?.id}|1`);
  });
});
