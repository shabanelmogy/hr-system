import { sessionFixture } from '../auth/auth.fixture';
import {
  errorLogSettingsAllowed,
  errorLogSettingsEditAllowed,
  systemErrorLogDetailsAllowed,
  systemErrorLogExportAllowed,
  systemErrorLogsAllowed,
} from './system-error-log-access';

const actor = { ...sessionFixture, roles: ['super_admin'], permissions: ['SystemErrorLogs:View'] };
describe('system error log access', () => {
  it('keeps list, detail, export, and settings grants independent', () => {
    expect(systemErrorLogsAllowed(actor)).toBe(true);
    expect(systemErrorLogDetailsAllowed(actor)).toBe(false);
    expect(systemErrorLogExportAllowed(actor)).toBe(false);
    expect(errorLogSettingsAllowed(actor)).toBe(false);
  });
  it('requires settings view and edit grants and a mutable tenant', () => {
    const editable = { ...actor, permissions: ['ErrorLogSettings:View', 'ErrorLogSettings:Edit'] };
    expect(errorLogSettingsEditAllowed(editable)).toBe(true);
    expect(errorLogSettingsEditAllowed({ ...editable, tenantReadOnly: true })).toBe(false);
  });
});
