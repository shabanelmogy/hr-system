import { describe, expect, it } from "vitest";
import { getFirstTenantErrorField, getFirstTenantErrorTab } from "./tenantFormTabs";

describe("tenant form error navigation", () => {
  it("maps the first subscription error to its tab and field", () => {
    const errors = {
      notes: { type: "required", message: "Required" },
      maxUsers: { type: "min", message: "At least one" },
    } as never;

    expect(getFirstTenantErrorTab(errors)).toBe("subscription");
    expect(getFirstTenantErrorField(errors)).toBe("maxUsers");
  });

  it("preserves the deterministic field order inside a tab", () => {
    const errors = {
      contactPhone: { type: "required" },
      billingEmail: { type: "invalid" },
    } as never;

    expect(getFirstTenantErrorTab(errors)).toBe("contact");
    expect(getFirstTenantErrorField(errors)).toBe("billingEmail");
  });
});
