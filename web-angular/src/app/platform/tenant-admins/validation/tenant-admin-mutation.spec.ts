import { TestBed } from '@angular/core/testing';
import { submit } from '@angular/forms/signals';
import {
  createTenantAdminForm,
  emptyAdminDraft,
  parseAdminMutation,
  repairDefaultTenant,
} from './tenant-admin-mutation';
const tenants = [
  {
    id: 't',
    identifier: 'alpha',
    name: 'Alpha',
    isActive: true,
    lifecycleStatus: 'active' as const,
  },
];
const draft = {
  ...emptyAdminDraft,
  firstName: ' Ali ',
  lastName: ' Hassan ',
  userName: ' ali ',
  email: ' ali@example.test ',
  password: ' Example123 ',
  tenantIds: ['t'],
  defaultTenantId: 't',
};
describe('Tenant administrator native form contract', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('trims source fields, requires create password and omits blank edit password', () => {
    expect(parseAdminMutation(draft, 'create', tenants)).toEqual({
      firstName: 'Ali',
      lastName: 'Hassan',
      userName: 'ali',
      email: 'ali@example.test',
      password: 'Example123',
      tenantIds: ['t'],
      defaultTenantId: 't',
    });
    expect(
      parseAdminMutation({ ...draft, password: '', isDisabled: true }, 'edit', tenants),
    ).toEqual({
      firstName: 'Ali',
      lastName: 'Hassan',
      userName: 'ali',
      email: 'ali@example.test',
      isDisabled: true,
      tenantIds: ['t'],
      defaultTenantId: 't',
    });
    expect(() => parseAdminMutation({ ...draft, password: '' }, 'create', tenants)).toThrow();
    expect(() => parseAdminMutation({ ...draft, password: 'short' }, 'edit', tenants)).toThrow();
  });
  it('preserves valid defaults and repairs only when a selected Tenant is removed', () => {
    expect(repairDefaultTenant(['one', 'two'], 'two')).toBe('two');
    expect(repairDefaultTenant(['one', 'two'], 'missing')).toBe('one');
    expect(repairDefaultTenant([], 'one')).toBe('');
    expect(() =>
      parseAdminMutation({ ...draft, defaultTenantId: 'other' }, 'create', tenants),
    ).toThrow();
    expect(() =>
      parseAdminMutation(draft, 'create', [
        {
          ...tenants[0],
          id: 't',
          identifier: 'alpha',
          name: 'Alpha',
          isActive: false,
          lifecycleStatus: 'active',
        },
      ]),
    ).toThrow();
    expect(() =>
      parseAdminMutation({ ...draft, tenantIds: ['t', 't'] }, 'create', tenants),
    ).toThrow();
  });
  it('shows required and membership errors before dispatch through Signal Forms', async () => {
    TestBed.configureTestingModule({});
    const action = vi.fn();
    const native = TestBed.runInInjectionContext(() =>
      createTenantAdminForm(
        () => 'create',
        () => tenants,
        { submission: { action } },
      ),
    );
    expect(await submit(native)).toBe(false);
    expect(native.firstName().invalid()).toBe(true);
    expect(native.tenantIds().invalid()).toBe(true);
    native().value.set(draft);
    await submit(native);
    expect(action).toHaveBeenCalledOnce();
  });
});
