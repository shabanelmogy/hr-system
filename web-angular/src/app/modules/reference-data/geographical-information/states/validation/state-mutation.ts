import { signal } from '@angular/core';
import {
  form,
  apply,
  validate,
  metadata,
  MAX_LENGTH,
  REQUIRED,
  schema,
  type FormOptions,
} from '@angular/forms/signals';
import * as z from 'zod/mini';

export const stateMutationFields = ['nameAr', 'nameEn', 'code', 'countryId'] as const;
export type StateMutationField = (typeof stateMutationFields)[number];
export interface StateDraft {
  nameAr: string;
  nameEn: string;
  code: string;
  countryId: number | null;
}
export interface StateMutation {
  readonly nameAr: string;
  readonly nameEn: string;
  readonly code: string;
  readonly countryId: number;
}
export const stateFieldLimits = Object.freeze({ nameAr: 100, nameEn: 100, code: 10 });
export const emptyStateDraft: StateDraft = { nameAr: '', nameEn: '', code: '', countryId: null };
const draftSchema = z.strictObject({
  nameAr: z.string(),
  nameEn: z.string(),
  code: z.string(),
  countryId: z.nullable(z.number()),
});
const printable = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
export function stateFieldError(
  field: StateMutationField,
  input: unknown,
): Readonly<Record<string, unknown>> | null {
  if (field === 'countryId')
    return typeof input === 'number' && Number.isInteger(input) && input > 0 && input <= 2147483647
      ? null
      : { required: true };
  if (typeof input !== 'string') return { pattern: true };
  const value = input.trim().normalize('NFC');
  if (field === 'nameAr' || field === 'nameEn') {
    if (!value) return { required: true };
    if (printable.test(value)) return { invalidText: true };
    if (value.length < 2) return { minlength: { requiredLength: 2, actualLength: value.length } };
    return value.length > 100
      ? { maxlength: { requiredLength: 100, actualLength: value.length } }
      : null;
  }
  if (!value) return { required: true };
  if (value.length < 2) return { minlength: { requiredLength: 2, actualLength: value.length } };
  return value.length > 10
    ? { maxlength: { requiredLength: 10, actualLength: value.length } }
    : /^[A-Za-z0-9-]+$/.test(value)
      ? null
      : { pattern: true };
}
export const stateSchema = schema<StateDraft>((path) => {
  const validateField =
    (field: StateMutationField) =>
    ({ value }: { value: () => unknown }) => {
      const errors = stateFieldError(field, value());
      return errors
        ? Object.entries(errors).map(([kind, details]) => ({
            kind,
            ...(typeof details === 'object' && details !== null ? details : {}),
          }))
        : undefined;
    };
  metadata(path.nameAr, MAX_LENGTH, () => 100);
  metadata(path.nameAr, REQUIRED, () => true);
  validate(path.nameAr, validateField('nameAr'));
  metadata(path.nameEn, MAX_LENGTH, () => 100);
  metadata(path.nameEn, REQUIRED, () => true);
  validate(path.nameEn, validateField('nameEn'));
  metadata(path.code, MAX_LENGTH, () => 10);
  metadata(path.code, REQUIRED, () => true);
  validate(path.code, validateField('code'));
  metadata(path.countryId, REQUIRED, () => true);
  validate(path.countryId, validateField('countryId'));
});
export function createStateForm(
  options: FormOptions<StateDraft> = {},
  canSelectCountry?: (id: number | null) => boolean,
) {
  return form(
    signal({ ...emptyStateDraft }),
    (path) => {
      apply(path, stateSchema);
      if (canSelectCountry) {
        validate(path.countryId, (context) => {
          const id = context.value();
          return id !== null && !canSelectCountry(id) ? { kind: 'parentUnavailable' } : undefined;
        });
      }
    },
    options,
  );
}
export function parseStateMutation(input: unknown): StateMutation {
  const draft = draftSchema.parse(input);
  const countryId = draft.countryId;
  if (
    countryId === null ||
    stateMutationFields.some((field) => stateFieldError(field, draft[field]))
  )
    throw Error('Invalid State mutation');
  return {
    nameAr: draft.nameAr.trim().normalize('NFC'),
    nameEn: draft.nameEn.trim().normalize('NFC'),
    code: draft.code.trim().toUpperCase(),
    countryId,
  };
}
function normalizeStateDraft(input: StateDraft): StateDraft {
  return {
    nameAr: input.nameAr.trim().normalize('NFC'),
    nameEn: input.nameEn.trim().normalize('NFC'),
    code: input.code.trim().toUpperCase(),
    countryId: input.countryId,
  };
}
export const stateDraftKey = (input: StateDraft) => JSON.stringify(normalizeStateDraft(input));
export function stateDetailDraft<T extends StateMutation>(input: T): StateDraft {
  return {
    nameAr: input.nameAr,
    nameEn: input.nameEn,
    code: input.code,
    countryId: input.countryId,
  };
}
