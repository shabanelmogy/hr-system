import type { TenantEntitlementModule } from './tenant-entitlements';
import { createDefaultEntitlements, toggleModuleEntitlement } from './tenant-entitlements';

const modules: TenantEntitlementModule[] = [
  {
    code: 'hr',
    isDefault: true,
    submodules: [
      { code: 'basic-data' },
      { code: 'recruitment' },
    ],
  },
  { code: 'acc', isDefault: false, submodules: [] },
];

describe('tenant module entitlements', () => {
  it('keeps HR submodules when Accounting is selected', () => {
    const updated = toggleModuleEntitlement(
      createDefaultEntitlements(modules),
      modules[1],
      true,
    );

    expect(updated).toEqual([
      { moduleCode: 'hr', submoduleCodes: ['basic-data', 'recruitment'] },
      { moduleCode: 'acc', submoduleCodes: [] },
    ]);
  });
});
