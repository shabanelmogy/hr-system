import type { RoleClaim } from '../../../domain/models/administration';
import {
  countChangedRoleClaims,
  groupRoleClaims,
  summarizePermissionBusinessModules,
} from './permission-groups';

describe('role permission screen presentation', () => {
  it('groups screens alphabetically and keeps common actions in journey order', () => {
    const claims: RoleClaim[] = [
      { displayValue: 'Users:Delete', moduleCode: 'platform', isSelected: false },
      { displayValue: 'Users:Export', moduleCode: 'platform', isSelected: false },
      { displayValue: 'Accounts:View', moduleCode: 'acc', isSelected: true },
      { displayValue: 'Users:Create', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Users:View', moduleCode: 'platform', isSelected: true },
    ];

    const groups = groupRoleClaims(claims);

    expect(groups.map((group) => group.screen)).toEqual(['Accounts', 'Users']);
    expect(groups[1]?.claims.map((claim) => claim.action)).toEqual([
      'View',
      'Create',
      'Delete',
      'Export',
    ]);
  });

  it('counts selection differences against the loaded server baseline', () => {
    const baseline: RoleClaim[] = [
      { displayValue: 'Users:View', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Users:Create', moduleCode: 'platform', isSelected: false },
      { displayValue: 'Roles:View', moduleCode: 'platform', isSelected: true },
    ];
    const current: RoleClaim[] = [
      { displayValue: 'users:view', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Users:Create', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Roles:View', moduleCode: 'platform', isSelected: false },
    ];

    expect(countChangedRoleClaims(current, baseline)).toBe(2);
    expect(countChangedRoleClaims(baseline, baseline)).toBe(0);
  });

  it('summarizes business modules independently from their screens', () => {
    const groups = groupRoleClaims([
      { displayValue: 'Users:View', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Users:Edit', moduleCode: 'platform', isSelected: false },
      { displayValue: 'Roles:View', moduleCode: 'platform', isSelected: true },
      { displayValue: 'Accounts:View', moduleCode: 'acc', isSelected: false },
    ]);

    expect(summarizePermissionBusinessModules(groups)).toEqual([
      { code: 'acc', permissionCount: 1, screenCount: 1, selectedCount: 0 },
      { code: 'platform', permissionCount: 3, screenCount: 2, selectedCount: 2 },
    ]);
  });
});
