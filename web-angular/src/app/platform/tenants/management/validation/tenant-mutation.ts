import { signal } from '@angular/core';
import {
  apply,
  form,
  MAX_LENGTH,
  metadata,
  REQUIRED,
  schema,
  validate,
  type FormOptions,
} from '@angular/forms/signals';
import * as z from 'zod/mini';
import { isDateOnly } from '../../../../shared/ui/public-api';
import { subscriptionStatuses, type SubscriptionStatus } from '../../types/dashboard-contracts';
import type { TenantEntitlementModule } from '../../../modules/entitlements.public-api';

export const tenantMutationFields = [
  'identifier',
  'name',
  'isActive',
  'subscriptionStatus',
  'subscriptionStartedOn',
  'subscriptionEndsOn',
  'planName',
  'maxAdmins',
  'maxUsers',
  'billingEmail',
  'contactName',
  'contactPhone',
  'notes',
  'entitlements',
] as const;
export type TenantMutationField = (typeof tenantMutationFields)[number];
export interface TenantEntitlementDraft {
  readonly moduleCode: string;
  readonly submoduleCodes: readonly string[];
}
export interface TenantDraft {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string;
  planName: string;
  maxAdmins: string;
  maxUsers: string;
  billingEmail: string;
  contactName: string;
  contactPhone: string;
  notes: string;
  entitlements: readonly TenantEntitlementDraft[];
}
export interface TenantMutation {
  readonly identifier: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly subscriptionStatus: SubscriptionStatus;
  readonly subscriptionStartedOn: string;
  readonly subscriptionEndsOn: string;
  readonly planName: string | null;
  readonly maxAdmins: number;
  readonly maxUsers: number;
  readonly billingEmail: string | null;
  readonly contactName: string | null;
  readonly contactPhone: string | null;
  readonly notes: string | null;
  readonly entitlements: readonly TenantEntitlementDraft[];
}
export interface TenantFormContext {
  readonly currentAdminCount?: number;
  readonly currentUserCount?: number;
}
export const emptyTenantDraft: TenantDraft = {
  identifier: '',
  name: '',
  isActive: true,
  subscriptionStatus: 'free',
  subscriptionStartedOn: '',
  subscriptionEndsOn: '',
  planName: '',
  maxAdmins: '',
  maxUsers: '',
  billingEmail: '',
  contactName: '',
  contactPhone: '',
  notes: '',
  entitlements: [],
};

const limits = Object.freeze({
  identifier: 100,
  name: 200,
  planName: 100,
  billingEmail: 256,
  contactName: 200,
  contactPhone: 32,
  notes: 2000,
});
const identifier = /^[A-Za-z0-9][A-Za-z0-9-]*$/;
const printable = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
const draftSchema = z.strictObject({
  identifier: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  subscriptionStatus: z.enum(subscriptionStatuses),
  subscriptionStartedOn: z.string(),
  subscriptionEndsOn: z.string(),
  planName: z.string(),
  maxAdmins: z.string(),
  maxUsers: z.string(),
  billingEmail: z.string(),
  contactName: z.string(),
  contactPhone: z.string(),
  notes: z.string(),
  entitlements: z.array(z.object({ moduleCode: z.string(), submoduleCodes: z.array(z.string()) })),
});

export function tenantFieldError(
  field: Exclude<TenantMutationField, 'entitlements'>,
  input: unknown,
): Readonly<Record<string, unknown>> | null {
  if (field === 'isActive') return typeof input === 'boolean' ? null : { boolean: true };
  if (field === 'subscriptionStatus')
    return subscriptionStatuses.includes(input as SubscriptionStatus) ? null : { option: true };
  if (field === 'subscriptionStartedOn' || field === 'subscriptionEndsOn')
    return isDateOnly(input) ? null : { date: true };
  if (field === 'maxAdmins' || field === 'maxUsers')
    return positiveInt32(input) ? null : { integer: true };
  if (typeof input !== 'string') return { text: true };
  const value = input.trim().normalize('NFC');
  const maximum = limits[field];
  if (
    !value &&
    ['planName', 'billingEmail', 'contactName', 'contactPhone', 'notes'].includes(field)
  )
    return null;
  if (!value) return { required: true };
  if (value.length > maximum) return { maxlength: { requiredLength: maximum } };
  if (field === 'identifier') return identifier.test(value) ? null : { identifier: true };
  if (field === 'name') return printable.test(value) ? { invalidText: true } : null;
  if (field === 'billingEmail' && !z.email().safeParse(value).success) return { email: true };
  return null;
}

export function tenantSavedEntitlements(
  saved: readonly TenantEntitlementDraft[],
  catalog: readonly TenantEntitlementModule[],
): readonly TenantEntitlementDraft[] {
  return validateEntitlements(saved, catalog);
}

export const tenantSchema = schema<TenantDraft>((path) => {
  metadata(path.identifier, REQUIRED, () => true);
  metadata(path.identifier, MAX_LENGTH, () => limits.identifier);
  validate(path.identifier, ({ value }) => errors(tenantFieldError('identifier', value())));
  metadata(path.name, REQUIRED, () => true);
  metadata(path.name, MAX_LENGTH, () => limits.name);
  validate(path.name, ({ value }) => errors(tenantFieldError('name', value())));
  validate(path.isActive, ({ value }) => errors(tenantFieldError('isActive', value())));
  metadata(path.subscriptionStatus, REQUIRED, () => true);
  validate(path.subscriptionStatus, ({ value }) =>
    errors(tenantFieldError('subscriptionStatus', value())),
  );
  metadata(path.subscriptionStartedOn, REQUIRED, () => true);
  validate(path.subscriptionStartedOn, ({ value }) =>
    errors(tenantFieldError('subscriptionStartedOn', value())),
  );
  metadata(path.subscriptionEndsOn, REQUIRED, () => true);
  validate(path.subscriptionEndsOn, (context) =>
    errors(
      tenantFieldError('subscriptionEndsOn', context.value()) ??
        dateOrder(context.valueOf(path.subscriptionStartedOn), context.value()),
    ),
  );
  metadata(path.planName, MAX_LENGTH, () => limits.planName);
  validate(path.planName, ({ value }) => errors(tenantFieldError('planName', value())));
  metadata(path.maxAdmins, REQUIRED, () => true);
  validate(path.maxAdmins, ({ value }) => errors(tenantFieldError('maxAdmins', value())));
  metadata(path.maxUsers, REQUIRED, () => true);
  validate(path.maxUsers, (context) =>
    errors(
      tenantFieldError('maxUsers', context.value()) ??
        seatRange(context.valueOf(path.maxAdmins), context.value()),
    ),
  );
  metadata(path.billingEmail, MAX_LENGTH, () => limits.billingEmail);
  validate(path.billingEmail, ({ value }) => errors(tenantFieldError('billingEmail', value())));
  metadata(path.contactName, MAX_LENGTH, () => limits.contactName);
  validate(path.contactName, ({ value }) => errors(tenantFieldError('contactName', value())));
  metadata(path.contactPhone, MAX_LENGTH, () => limits.contactPhone);
  validate(path.contactPhone, ({ value }) => errors(tenantFieldError('contactPhone', value())));
  metadata(path.notes, MAX_LENGTH, () => limits.notes);
  validate(path.notes, ({ value }) => errors(tenantFieldError('notes', value())));
});

export function createTenantForm(
  catalog: () => readonly TenantEntitlementModule[],
  options: FormOptions<TenantDraft> = {},
  context: () => TenantFormContext = () => ({}),
) {
  return form(
    signal({ ...emptyTenantDraft, entitlements: defaultTenantEntitlements(catalog()) }),
    (path) => {
      apply(path, tenantSchema);
      validate(path.maxAdmins, ({ value }) =>
        errors(minimumUsage(value(), context().currentAdminCount)),
      );
      validate(path.maxUsers, ({ value }) =>
        errors(minimumUsage(value(), context().currentUserCount)),
      );
      validate(path.entitlements, ({ value }) => {
        try {
          validateEntitlements(value(), catalog());
          return undefined;
        } catch {
          return [{ kind: 'catalogCompatibility' }];
        }
      });
    },
    options,
  );
}

export function parseTenantMutation(
  input: unknown,
  catalog: readonly TenantEntitlementModule[],
): TenantMutation {
  const draft = draftSchema.parse(input);
  const invalid = tenantMutationFields
    .filter(
      (field): field is Exclude<TenantMutationField, 'entitlements'> => field !== 'entitlements',
    )
    .some((field) => tenantFieldError(field, draft[field]));
  if (
    invalid ||
    dateOrder(draft.subscriptionStartedOn, draft.subscriptionEndsOn) ||
    seatRange(draft.maxAdmins, draft.maxUsers)
  )
    throw Error('Invalid Tenant mutation');
  return {
    identifier: normalize(draft.identifier),
    name: normalize(draft.name),
    isActive: draft.isActive,
    subscriptionStatus: draft.subscriptionStatus,
    subscriptionStartedOn: toUtcStart(draft.subscriptionStartedOn),
    subscriptionEndsOn: toUtcEnd(draft.subscriptionEndsOn),
    planName: optional(draft.planName),
    maxAdmins: Number(draft.maxAdmins),
    maxUsers: Number(draft.maxUsers),
    billingEmail: optional(draft.billingEmail),
    contactName: optional(draft.contactName),
    contactPhone: optional(draft.contactPhone),
    notes: optional(draft.notes),
    entitlements: validateEntitlements(draft.entitlements, catalog),
  };
}

export function tenantDraftKey(input: TenantDraft): string {
  return JSON.stringify({
    ...input,
    identifier: normalize(input.identifier),
    name: normalize(input.name),
    planName: normalize(input.planName),
    billingEmail: normalize(input.billingEmail),
    contactName: normalize(input.contactName),
    contactPhone: normalize(input.contactPhone),
    notes: normalize(input.notes),
    maxAdmins: input.maxAdmins.trim(),
    maxUsers: input.maxUsers.trim(),
    entitlements: normalizedEntitlementKey(input.entitlements),
  });
}

export function defaultTenantEntitlements(
  catalog: readonly TenantEntitlementModule[],
): readonly TenantEntitlementDraft[] {
  return catalog
    .filter((module) => module.isDefault)
    .map((module) => ({
      moduleCode: module.code,
      submoduleCodes: module.submodules.map((item) => item.code),
    }));
}

function validateEntitlements(
  entries: readonly TenantEntitlementDraft[],
  catalog: readonly TenantEntitlementModule[],
): readonly TenantEntitlementDraft[] {
  const seenModules = new Set<string>();
  return entries.map((entry) => {
    const module = catalog.find(
      (candidate) => candidate.code.toLowerCase() === entry.moduleCode.toLowerCase(),
    );
    if (!module || seenModules.has(module.code.toLowerCase()))
      throw Error('Invalid Tenant entitlement');
    seenModules.add(module.code.toLowerCase());
    const seenSubmodules = new Set<string>();
    const submoduleCodes = entry.submoduleCodes.map((code) => {
      const submodule = module.submodules.find(
        (candidate) => candidate.code.toLowerCase() === code.toLowerCase(),
      );
      if (!submodule || seenSubmodules.has(submodule.code.toLowerCase()))
        throw Error('Invalid Tenant entitlement');
      seenSubmodules.add(submodule.code.toLowerCase());
      return submodule.code;
    });
    return { moduleCode: module.code, submoduleCodes };
  });
}

function errors(value: Readonly<Record<string, unknown>> | null) {
  return value
    ? Object.entries(value).map(([kind, details]) => ({
        kind,
        ...(typeof details === 'object' && details !== null ? details : {}),
      }))
    : undefined;
}

function normalize(value: string): string {
  return value.trim().normalize('NFC');
}

function optional(value: string): string | null {
  const normalized = normalize(value);
  return normalized || null;
}

function positiveInt32(value: unknown): value is string {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return (
    typeof value === 'string' &&
    /^\d+$/.test(normalized) &&
    Number(normalized) > 0 &&
    Number(normalized) <= 2147483647
  );
}

function normalizedEntitlementKey(
  entries: readonly TenantEntitlementDraft[],
): readonly TenantEntitlementDraft[] {
  return [...entries]
    .map((entry) => ({
      moduleCode: normalize(entry.moduleCode).toLowerCase(),
      submoduleCodes: [...entry.submoduleCodes].map((code) => normalize(code).toLowerCase()).sort(),
    }))
    .sort((left, right) => left.moduleCode.localeCompare(right.moduleCode));
}

function dateOrder(start: unknown, end: unknown): Readonly<Record<string, unknown>> | null {
  return isDateOnly(start) && isDateOnly(end) && end < start ? { dateOrder: true } : null;
}

function seatRange(admins: unknown, users: unknown): Readonly<Record<string, unknown>> | null {
  return positiveInt32(admins) && positiveInt32(users) && Number(admins) > Number(users)
    ? { seatRange: true }
    : null;
}

function minimumUsage(
  value: unknown,
  current: number | undefined,
): Readonly<Record<string, unknown>> | null {
  return current !== undefined && positiveInt32(value) && Number(value) < current
    ? { usageLimit: { current } }
    : null;
}

function toUtcStart(value: string): string {
  return new Date(value + 'T00:00:00.000Z').toISOString();
}

function toUtcEnd(value: string): string {
  return new Date(value + 'T23:59:59.000Z').toISOString();
}
