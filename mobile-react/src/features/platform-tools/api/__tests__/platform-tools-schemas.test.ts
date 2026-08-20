import { appointmentSchema } from '../../appointments/api-schemas';
import { storedFileSchema } from '../../file-manager/api-schemas';
import { localizationSchema } from '../../localization/api-schemas';
import { trackChangeLogSchema } from '../../track-changes/api-schemas';

describe('platform-tools response schemas', () => {
  it('accepts canonical file and appointment responses', () => {
    expect(storedFileSchema.parse({
      id: 'fba56d28-71a8-4c19-81f5-8eccae5883e7',
      fileName: 'policy.pdf',
      storedFileName: '2ykf3p5a.pdf',
      contentType: 'application/pdf',
      fileExtension: '.pdf',
      createdOn: '2026-08-20T10:00:00Z',
      createdByPc: 'MOBILE',
      createdById: 'user-1',
      isDeleted: false,
    })).toMatchObject({ fileName: 'policy.pdf', isDeleted: false });

    expect(appointmentSchema.parse({
      id: 12,
      start: '2026-08-20T10:00:00+00:00',
      end: '2026-08-20T10:30:00+00:00',
      text: 'Review',
      isAllDay: false,
    })).toMatchObject({ id: 12, text: 'Review' });
  });

  it('accepts canonical localization and change-log responses', () => {
    expect(localizationSchema.parse({ greeting: 'Hello' })).toEqual({ greeting: 'Hello' });

    expect(trackChangeLogSchema.parse({
      changeLogId: 'change-1',
      entityName: 'Country',
      key: 'NameEn',
      oldValue: 'Old',
      newValue: 'New',
      changedBy: 'admin',
      changedAt: '2026-08-20T10:00:00Z',
      changedByPc: 'WEB',
    })).toMatchObject({ changeLogId: 'change-1', entityName: 'Country' });
  });

  it('rejects malformed responses instead of silently defaulting fields', () => {
    expect(storedFileSchema.safeParse({ fileName: 'missing-fields.pdf' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ id: 0 }).success).toBe(false);
    expect(localizationSchema.safeParse({ greeting: { nested: true } }).success).toBe(false);
  });
});
