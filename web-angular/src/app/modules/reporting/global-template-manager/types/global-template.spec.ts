import {
  globalTemplateAllowed,
  globalTemplateFileError,
  globalTemplateManagerAllowed,
} from './global-template';

describe('global template authority', () => {
  const user = {
    roles: ['super_admin'],
    permissions: ['GlobalCrystalReports:View', 'Countries:Edit', 'GlobalCrystalReports:Upload'],
  };
  it('requires exact role, reporting action and entity Edit without wildcard shortcuts', () => {
    expect(globalTemplateManagerAllowed(user)).toBe(true);
    expect(globalTemplateAllowed(user, 'countries', 'Upload')).toBe(true);
    expect(globalTemplateAllowed(user, 'states', 'Upload')).toBe(false);
    expect(globalTemplateAllowed(user, 'countries', 'Publish')).toBe(false);
    expect(globalTemplateManagerAllowed({ ...user, roles: ['admin'] })).toBe(false);
    expect(globalTemplateManagerAllowed({ ...user, permissions: ['*'] })).toBe(false);
    expect(
      globalTemplateManagerAllowed({
        ...user,
        permissions: ['GlobalCrystalReports:View', 'Countries:View'],
      }),
    ).toBe(false);
  });
  it('rejects missing, empty, oversized and non-RPT selections before HTTP', () => {
    expect(globalTemplateFileError(null)).toBe('required');
    expect(globalTemplateFileError(new File([], 'Countries.rpt'))).toBe('invalidFile');
    expect(globalTemplateFileError(new File(['test'], 'Countries.pdf'))).toBe('invalidFile');
    expect(globalTemplateFileError(new File(['test'], 'Countries.rpt'))).toBeNull();
  });
});
