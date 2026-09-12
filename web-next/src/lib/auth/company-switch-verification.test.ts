import { describe, expect, it, vi } from "vitest";
import { verifyTargetCompany } from "./company-switch-verification";

describe("verifyTargetCompany", () => {
  it("retries after clearing the stale company and accepts the target session", async () => {
    const revalidate = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const clearStaleSession = vi.fn();
    const companyIds = [12, 42];

    const verified = await verifyTargetCompany({
      companyId: 42,
      revalidate,
      readCompanyId: () => companyIds.shift(),
      clearStaleSession,
    });

    expect(verified).toBe(true);
    expect(revalidate).toHaveBeenCalledTimes(2);
    expect(clearStaleSession).toHaveBeenCalledTimes(1);
  });

  it("stops after the bounded attempts when the server never confirms the target", async () => {
    const revalidate = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const clearStaleSession = vi.fn();

    const verified = await verifyTargetCompany({
      companyId: 42,
      revalidate,
      readCompanyId: () => 12,
      clearStaleSession,
      attempts: 2,
    });

    expect(verified).toBe(false);
    expect(revalidate).toHaveBeenCalledTimes(2);
    expect(clearStaleSession).toHaveBeenCalledTimes(1);
  });
});
