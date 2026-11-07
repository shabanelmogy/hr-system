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

export const districtMutationFields = ['nameAr', 'nameEn', 'code', 'stateId'] as const;
export type DistrictMutationField = (typeof districtMutationFields)[number];
export interface DistrictDraft {
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number | null;
}
export interface DistrictMutation {
  readonly nameAr: string;
  readonly nameEn: string;
  readonly code: string;
  readonly stateId: number;
}
export const districtFieldLimits = Object.freeze({ nameAr: 100, nameEn: 100, code: 10 });
export const emptyDistrictDraft: DistrictDraft = {
  nameAr: '',
  nameEn: '',
  code: '',
  stateId: null,
};
const draftSchema = z.strictObject({
  nameAr: z.string(),
  nameEn: z.string(),
  code: z.string(),
  stateId: z.nullable(z.number()),
});
const printable = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
export function districtFieldError(
  field: DistrictMutationField,
  input: unknown,
): Readonly<Record<string, unknown>> | null {
  if (field === 'stateId')
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
export const districtSchema = schema<DistrictDraft>((path) => {
  const validateField =
    (field: DistrictMutationField) =>
    ({ value }: { value: () => unknown }) => {
      const errors = districtFieldError(field, value());
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
  metadata(path.stateId, REQUIRED, () => true);
  validate(path.stateId, validateField('stateId'));
});
export function createDistrictForm(
  options: FormOptions<DistrictDraft> = {},
  canSelectState?: (id: number | null) => boolean,
) {
  return form(
    signal({ ...emptyDistrictDraft }),
    (path) => {
      apply(path, districtSchema);
      if (canSelectState) {
        validate(path.stateId, (context) => {
          const id = context.value();
          return id !== null && !canSelectState(id) ? { kind: 'parentUnavailable' } : undefined;
        });
      }
    },
    options,
  );
}
export function parseDistrictMutation(input: unknown): DistrictMutation {
  const draft = draftSchema.parse(input);
  const stateId = draft.stateId;
  if (
    stateId === null ||
    districtMutationFields.some((field) => districtFieldError(field, draft[field]))
  )
    throw Error('Invalid District mutation');
  return {
    nameAr: draft.nameAr.trim().normalize('NFC'),
    nameEn: draft.nameEn.trim().normalize('NFC'),
    code: draft.code.trim().toUpperCase(),
    stateId,
  };
}
function normalizeStateDraft(input: DistrictDraft): DistrictDraft {
  return {
    nameAr: input.nameAr.trim().normalize('NFC'),
    nameEn: input.nameEn.trim().normalize('NFC'),
    code: input.code.trim().toUpperCase(),
    stateId: input.stateId,
  };
}
export const districtDraftKey = (input: DistrictDraft) =>
  JSON.stringify(normalizeStateDraft(input));
export function districtDetailDraft<T extends DistrictMutation>(input: T): DistrictDraft {
  return {
    nameAr: input.nameAr,
    nameEn: input.nameEn,
    code: input.code,
    stateId: input.stateId,
  };
}
