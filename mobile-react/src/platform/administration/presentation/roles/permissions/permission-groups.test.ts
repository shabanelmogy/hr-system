import type { RoleClaim } from '../../../domain/models/administration';
import { countChangedRoleClaims, groupRoleClaims } from './permission-groups';

describe('role permission screen presentation', () => {
  it('groups screens alphabetically and keeps common actions in journey order', () => {
    const claims: RoleClaim[] = [
      { displayValue: 'Users:Delete', isSelected: false },
      { displayValue: 'Users:Export', isSelected: false },
      { displayValue: 'Accounts:View', isSelected: true },
      { displayValue: 'Users:Create', isSelected: true },
      { displayValue: 'Users:View', isSelected: true },
    ];

    const groups = groupRoleClaims(claims);

    expect(groups.map((group) => group.module)).toEqual(['Accounts', 'Users']);
    expect(groups[1]?.claims.map((claim) => claim.action)).toEqual([
      'View',
      'Create',
      'Delete',
      'Export',
    ]);
  });

  it('counts selection differences against the loaded server baseline', () => {
    const baseline: RoleClaim[] = [
      { displayValue: 'Users:View', isSelected: true },
      { displayValue: 'Users:Create', isSelected: false },
      { displayValue: 'Roles:View', isSelected: true },
    ];
    const current: RoleClaim[] = [
      { displayValue: 'users:view', isSelected: true },
      { displayValue: 'Users:Create', isSelected: true },
      { displayValue: 'Roles:View', isSelected: false },
    ];

    expect(countChangedRoleClaims(current, baseline)).toBe(2);
    expect(countChangedRoleClaims(baseline, baseline)).toBe(0);
  });
});
