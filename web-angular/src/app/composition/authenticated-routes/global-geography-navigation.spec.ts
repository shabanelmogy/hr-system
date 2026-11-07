import { globalGeographyEntries } from './global-geography-navigation';
import { sessionFixture } from '../../platform/auth/auth.fixture';

describe('Global Geography sidebar composition', () => {
  const actor = { ...sessionFixture, roles: ['super_admin'] };
  const text = (key: string) => key;
  it('groups States and Districts with Countries under the same Global Geography entry', () => {
    const entries = globalGeographyEntries(
      { ...actor, permissions: ['Countries:View', 'States:View', 'Districts:View'] },
      text,
      '/super-admin/geography/states',
      true,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe('global-geography');
    expect(entries[0]?.children?.map((entry) => entry.id)).toEqual([
      'countries',
      'states',
      'districts',
    ]);
    expect(entries[0]?.children?.find((entry) => entry.id === 'states')?.selected).toBe(true);
  });
  it('keeps the group available without Countries permission and hides each unauthorized child independently', () => {
    const entries = globalGeographyEntries(
      { ...actor, permissions: ['Districts:View'] },
      text,
      '/super-admin/geography/districts',
      true,
    );
    expect(entries[0]?.children?.map((entry) => entry.id)).toEqual(['districts']);
    expect(entries[0]?.children?.[0]?.selected).toBe(true);
  });
  it('does not expose the development-only Countries pilot in a production build', () => {
    const entries = globalGeographyEntries(
      { ...actor, permissions: ['Countries:View', 'States:View'] },
      text,
      '',
      false,
    );
    expect(entries[0]?.children?.map((entry) => entry.id)).toEqual(['states']);
  });
  it('omits empty or unauthorized geography groups', () => {
    for (const user of [
      null,
      { ...actor, permissions: [] },
      { ...actor, roles: ['tenant_admin'], permissions: ['States:View', 'Districts:View'] },
    ])
      expect(globalGeographyEntries(user, text, '', true)).toEqual([]);
  });
});
