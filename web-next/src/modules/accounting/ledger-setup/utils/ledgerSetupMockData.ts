import type {
  LedgerSetupField,
  LedgerSetupLookupSource,
  LedgerSetupRecord,
} from "../types";
import type { LedgerSetupFormValues } from "../validation/ledgerSetupValidation";

export type LedgerSetupLookups = Partial<
  Record<LedgerSetupLookupSource, readonly LedgerSetupRecord[]>
>;

function lookupIds(
  source: LedgerSetupLookupSource,
  lookups: LedgerSetupLookups,
): number[] {
  return (lookups[source] ?? []).flatMap((record) =>
    typeof record.id === "number" && Number.isInteger(record.id) && record.id > 0
      ? [record.id]
      : [],
  );
}

/**
 * The compatibility renderer may generate a draft only from authoritative
 * lookup identities already returned by the API.
 */
export function canCreateLedgerSetupMockDraft(
  fields: readonly LedgerSetupField[],
  lookups: LedgerSetupLookups,
): boolean {
  for (const field of fields) {
    if (
      field.required &&
      field.optionSource &&
      lookupIds(field.optionSource, lookups).length === 0
    ) {
      return false;
    }
  }

  const requiresCurrencyPair = fields.some((field) => field.name === "fromCurrencyId") &&
    fields.some((field) => field.name === "toCurrencyId");
  return !requiresCurrencyPair || lookupIds("currencies", lookups).length >= 2;
}

function textValue(fieldName: string, sequence: number): string | null {
  const suffix = String(sequence).padStart(3, "0");
  if (fieldName === "nameAr") return `بيانات محاسبية تجريبية ${sequence}`;
  if (fieldName === "nameEn") return `Accounting Demo ${sequence}`;
  if (fieldName === "categoryCode") return "GENERAL";
  if (fieldName === "purposeCode") return "GENERAL_LEDGER";
  if (fieldName === "numberPrefix") return "DM";
  if (fieldName === "sourceReferenceId" || fieldName === "contextReferenceId") return null;
  if (fieldName === "code" || fieldName.endsWith("Code")) return `DEMO-${suffix}`;
  return `Demo ${sequence}`;
}

function numberValue(fieldName: string, sequence: number): number {
  if (fieldName === "rate") return 1;
  if (fieldName === "numberPadding") return 6;
  if (fieldName === "priority") return 100;
  if (fieldName === "version" || fieldName === "nextNumber") return 1;
  return sequence;
}

export interface LedgerSetupMockDraftContext {
  fields: readonly LedgerSetupField[];
  lookups: LedgerSetupLookups;
  sequence: number;
  currentValues?: LedgerSetupFormValues;
  today?: string;
}

/**
 * Builds a local form draft for setup screens that have not yet moved to a
 * typed child package. It never invents lookup IDs, scope, RowVersion or any
 * persisted state.
 */
export function createLedgerSetupMockDraft({
  fields,
  lookups,
  sequence,
  currentValues = {},
  today = new Date().toISOString().slice(0, 10),
}: LedgerSetupMockDraftContext): LedgerSetupFormValues | null {
  if (!canCreateLedgerSetupMockDraft(fields, lookups)) return null;

  const draft: LedgerSetupFormValues = {};
  for (const field of fields) {
    if (field.name === "specificCurrencyId") {
      draft[field.name] = null;
      continue;
    }

    if (field.optionSource) {
      const ids = lookupIds(field.optionSource, lookups);
      const currentId = Number(currentValues[field.name]);
      const validCurrentId = ids.includes(currentId) ? currentId : undefined;
      if (field.name === "toCurrencyId") {
        const fromCurrencyId = Number(draft.fromCurrencyId ?? currentValues.fromCurrencyId);
        draft[field.name] = validCurrentId && validCurrentId !== fromCurrencyId
          ? validCurrentId
          : ids.find((id) => id !== fromCurrencyId) ?? null;
      } else {
        draft[field.name] = validCurrentId ?? ids[0] ?? null;
      }
      continue;
    }

    if (field.type === "select" && field.options?.length) {
      draft[field.name] = field.options[0].id;
      continue;
    }
    if (field.type === "number") {
      draft[field.name] = numberValue(field.name, sequence);
      continue;
    }
    if (field.type === "date") {
      draft[field.name] = field.required ? today : null;
      continue;
    }
    draft[field.name] = textValue(field.name, sequence);
  }

  return draft;
}
