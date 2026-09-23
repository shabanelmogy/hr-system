import { describe, expect, it } from "vitest";
import { createLedgerSetupSchema } from "./ledgerSetupValidation";

describe("Ledger Setup account validation", () => {
  const schema = createLedgerSetupSchema([
    { name: "currencyPolicy", label: "Currency policy", type: "select", required: true },
    { name: "specificCurrencyId", label: "Specific currency", type: "select" },
    { name: "priority", label: "Priority", type: "number", required: true },
  ], "Required");

  it("requires a currency when the specific policy is selected, while allowing priority zero", () => {
    expect(schema.safeParse({ currencyPolicy: 3, specificCurrencyId: null, priority: 0 }).success).toBe(false);
    expect(schema.safeParse({ currencyPolicy: 3, specificCurrencyId: 8, priority: 0 }).success).toBe(true);
    expect(schema.safeParse({ currencyPolicy: 1, specificCurrencyId: null, priority: 0 }).success).toBe(true);
  });
});
