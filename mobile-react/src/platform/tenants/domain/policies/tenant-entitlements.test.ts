import type { TenantEntitlementModule } from './tenant-entitlements';
import {
  createDefaultEntitlements,
  hydrateEntitlements,
  toggleModuleEntitlement,
} from './tenant-entitlements';

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

  it('drops modules and submodules absent from the tenant entitlement catalog', () => {
    expect(hydrateEntitlements([
      { moduleCode: 'hr', submoduleCodes: ['basic-data', 'geography'] },
      { moduleCode: 'platform', submoduleCodes: ['identity'] },
    ], modules)).toEqual([
      { moduleCode: 'hr', submoduleCodes: ['basic-data'] },
    ]);
  });
});
