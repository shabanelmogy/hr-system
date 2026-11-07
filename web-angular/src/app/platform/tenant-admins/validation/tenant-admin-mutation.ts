import { signal } from '@angular/core';
import {
  form,
  metadata,
  REQUIRED,
  MAX_LENGTH,
  validate,
  type FormOptions,
} from '@angular/forms/signals';
import * as z from 'zod/mini';
export type AdminMode = 'create' | 'edit';
export interface AdminDraft {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  isDisabled: boolean;
  tenantIds: readonly string[];
  defaultTenantId: string;
}
export interface AssignmentTenant {
  readonly id: string;
  readonly identifier: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly lifecycleStatus: string;
}
export interface AdminMutation {
  readonly firstName: string;
  readonly lastName: string;
  readonly userName: string;
  readonly email: string;
  readonly password?: string;
  readonly isDisabled?: boolean;
  readonly tenantIds: readonly string[];
  readonly defaultTenantId: string;
}
export const emptyAdminDraft: AdminDraft = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  isDisabled: false,
  tenantIds: [],
  defaultTenantId: '',
};
export const adminFields = [
  'firstName',
  'lastName',
  'userName',
  'email',
  'password',
  'isDisabled',
  'tenantIds',
  'defaultTenantId',
] as const;
const email = z.email();
const textFields = ['firstName', 'lastName', 'userName', 'email', 'password'] as const;
export function repairDefaultTenant(ids: readonly string[], current: string): string {
  return ids.includes(current) ? current : (ids[0] ?? '');
}
function textError(
  key: 'firstName' | 'lastName' | 'userName' | 'email' | 'password',
  value: string,
  mode: AdminMode,
): string | null {
  const text = value.trim();
  if (!text) return key === 'password' && mode === 'edit' ? null : 'required';
  if ((key === 'email' || key === 'userName') && text.length > 256) return 'maxLength';
  if (key === 'email' && !email.safeParse(text).success) return 'email';
  if (key === 'password' && text.length < 8) return 'passwordLength';
  return null;
}
function assignmentsInvalid(draft: AdminDraft, tenants: readonly AssignmentTenant[]): boolean {
  return (
    !draft.tenantIds.length ||
    new Set(draft.tenantIds).size !== draft.tenantIds.length ||
    draft.tenantIds.some(
      (id) =>
        !tenants.some(
          (tenant) => tenant.id === id && tenant.isActive && tenant.lifecycleStatus === 'active',
        ),
    )
  );
}
export function createTenantAdminForm(
  mode: () => AdminMode,
  tenants: () => readonly AssignmentTenant[],
  options: FormOptions<AdminDraft> = {},
) {
  return form(
    signal<AdminDraft>({ ...emptyAdminDraft }),
    (path) => {
      for (const key of textFields) {
        metadata(path[key], REQUIRED, () => key !== 'password' || mode() === 'create');
        if (key === 'email' || key === 'userName') metadata(path[key], MAX_LENGTH, () => 256);
        validate(path[key], ({ value }) => {
          const kind = textError(key, value(), mode());
          return kind ? { kind } : undefined;
        });
      }
      metadata(path.tenantIds, REQUIRED, () => true);
      validate(path.tenantIds, ({ value }) =>
        assignmentsInvalid({ ...emptyAdminDraft, tenantIds: value() }, tenants())
          ? { kind: value().length ? 'invalidTenants' : 'required' }
          : undefined,
      );
      metadata(path.defaultTenantId, REQUIRED, () => true);
      validate(path.defaultTenantId, (context) =>
        !context.value()
          ? { kind: 'required' }
          : !context.valueOf(path.tenantIds).includes(context.value())
            ? { kind: 'invalidDefault' }
            : undefined,
      );
    },
    options,
  );
}
export function parseAdminMutation(
  draft: AdminDraft,
  mode: AdminMode,
  tenants: readonly AssignmentTenant[],
): AdminMutation {
  if (
    textFields.some((key) => textError(key, draft[key], mode)) ||
    assignmentsInvalid(draft, tenants) ||
    !draft.tenantIds.includes(draft.defaultTenantId)
  )
    throw Error('Invalid administrator draft');
  const password = draft.password.trim();
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    userName: draft.userName.trim(),
    email: draft.email.trim(),
    ...(password ? { password } : {}),
    ...(mode === 'edit' ? { isDisabled: draft.isDisabled } : {}),
    tenantIds: [...draft.tenantIds],
    defaultTenantId: draft.defaultTenantId,
  };
}
export const adminDraftKey = (draft: AdminDraft): string =>
  JSON.stringify({ ...draft, tenantIds: [...draft.tenantIds].sort() });
