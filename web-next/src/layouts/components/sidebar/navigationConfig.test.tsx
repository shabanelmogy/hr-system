import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { getNavigationConfig } from "./navigationConfig";
import { NavigationSectionId } from "./navigationTypes";

describe("application navigation configuration", () => {
  it("exposes Workforce Planning as its own module for any module view permission", () => {
    const config = getNavigationConfig([], [permissions.ViewEnvelopeAmendments]);
    const workforceSection = config.find(
      (section) => section.id === NavigationSectionId.WORKFORCE_PLANNING,
    );

    expect(workforceSection?.items).toHaveLength(1);
    expect(workforceSection?.items?.[0]?.path).toBe(appRoutes.workforcePlanning.index);
  });

  it("keeps Finance limited to Fiscal Years", () => {
    const config = getNavigationConfig([], [
      permissions.ViewFiscalYears,
      permissions.ViewWorkforcePlans,
    ]);
    const financeSection = config.find(
      (section) => section.id === NavigationSectionId.FINANCE,
    );

    expect(financeSection?.items?.map((item) => item.path)).toEqual([
      appRoutes.finance.fiscalYears,
    ]);
  });
});
