import { adminFixture } from '../tenant-admin.fixture';
import { adminTenantDirectory } from './admin-tenant-directory';

describe('Tenant administrator directory', () => {
  it('includes empty Tenants and multi-membership accounts without altering unique accounts', () => {
    const shared = {
      ...adminFixture,
      tenants: [
        ...adminFixture.tenants,
        { id: 'b', name: 'Beta', identifier: 'beta', isDefault: false },
      ],
    };
    const rows = [shared, { ...adminFixture, id: 'unassigned', tenants: [], defaultTenantId: '' }];
    const groups = adminTenantDirectory(
      rows,
      [{ id: 'empty', name: 'Empty', identifier: 'empty' }],
      'Unassigned',
    );
    expect(groups.map((group) => group.id)).toEqual([
      'tenant:empty',
      'tenant:t',
      'tenant:b',
      'unassigned',
    ]);
    expect(groups.map((group) => group.admins.length)).toEqual([0, 1, 1, 1]);
    expect(groups[1]?.admins[0]).toBe(shared);
    expect(groups[2]?.admins[0]).toBe(shared);
    expect(rows).toHaveLength(2);
  });
  it('uses current Tenant names when lookup succeeds and membership snapshots when lookup fails', () => {
    expect(
      adminTenantDirectory(
        [adminFixture],
        [{ id: 't', name: 'Renamed', identifier: 'renamed' }],
        'Unassigned',
      )[0]?.label,
    ).toBe('Renamed');
    expect(adminTenantDirectory([adminFixture], [], 'Unassigned')[0]?.label).toBe('Alpha');
    expect(adminTenantDirectory([], [], 'Unassigned')).toEqual([]);
  });
});
