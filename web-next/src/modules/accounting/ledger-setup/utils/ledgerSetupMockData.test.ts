import { describe, expect, it } from "vitest";
import type { LedgerSetupField } from "../types";
import {
  canCreateLedgerSetupMockDraft,
  createLedgerSetupMockDraft,
} from "./ledgerSetupMockData";

const exchangeRateFields: readonly LedgerSetupField[] = [
  { name: "exchangeRateTypeId", label: "type", type: "select", optionSource: "exchangeRateTypes", required: true },
  { name: "fromCurrencyId", label: "from", type: "select", optionSource: "currencies", required: true },
  { name: "toCurrencyId", label: "to", type: "select", optionSource: "currencies", required: true },
  { name: "effectiveFrom", label: "from date", type: "date", required: true },
  { name: "effectiveTo", label: "to date", type: "date" },
  { name: "version", label: "version", type: "number", required: true },
  { name: "rate", label: "rate", type: "number", required: true },
];

describe("generic ledger setup mock drafts", () => {
  it("uses only real lookup IDs and distinct currencies", () => {
    const draft = createLedgerSetupMockDraft({
      fields: exchangeRateFields,
      lookups: {
        exchangeRateTypes: [{ id: 8 }],
        currencies: [{ id: 10 }, { id: 11 }],
      },
      sequence: 4,
      today: "2026-09-23",
    });

    expect(draft).toEqual({
      exchangeRateTypeId: 8,
      fromCurrencyId: 10,
      toCurrencyId: 11,
      effectiveFrom: "2026-09-23",
      effectiveTo: null,
      version: 1,
      rate: 1,
    });
  });

  it("disables generation when a required lookup is absent or a currency pair is impossible", () => {
    expect(canCreateLedgerSetupMockDraft(exchangeRateFields, {
      exchangeRateTypes: [{ id: 8 }],
      currencies: [{ id: 10 }],
    })).toBe(false);
    expect(canCreateLedgerSetupMockDraft(exchangeRateFields, {
      exchangeRateTypes: [],
      currencies: [{ id: 10 }, { id: 11 }],
    })).toBe(false);
  });

  it("preserves an authoritative scoped lookup and creates bilingual local values", () => {
    const fields: readonly LedgerSetupField[] = [
      { name: "dimensionDefinitionId", label: "dimension", type: "select", optionSource: "dimensions", required: true },
      { name: "code", label: "code", required: true },
      { name: "nameAr", label: "Arabic", required: true },
      { name: "nameEn", label: "English", required: true },
    ];
    const draft = createLedgerSetupMockDraft({
      fields,
      lookups: { dimensions: [{ id: 2 }, { id: 7 }] },
      currentValues: { dimensionDefinitionId: 7 },
      sequence: 3,
    });

    expect(draft).toMatchObject({
      dimensionDefinitionId: 7,
      code: "DEMO-003",
      nameAr: "بيانات محاسبية تجريبية 3",
      nameEn: "Accounting Demo 3",
    });
  });
});
