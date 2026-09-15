import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getLookup } = vi.hoisted(() => ({ getLookup: vi.fn() }));

vi.mock("../services/fiscalYearService", () => ({
  default: {
    getLookup: (...args: unknown[]) => getLookup(...args),
  },
}));

import { fiscalYearKeys, fiscalYearLookupQueryOptions } from "./useFiscalYearQueries";

const oldYears = [
  { id: 1, code: "FY-2026", nameAr: "السنة المالية 2026", nameEn: "Fiscal Year 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: 1 },
];
const currentYears = [
  { id: 2, code: "FY-2027", nameAr: "السنة المالية 2027", nameEn: "Fiscal Year 2027", startDate: "2027-01-01", endDate: "2027-12-31", status: 1 },
  ...oldYears,
];

describe("Fiscal Year lookup cache", () => {
  afterEach(() => vi.clearAllMocks());

  it("refetches an invalidated inactive lookup when a dependent screen mounts", async () => {
    getLookup.mockResolvedValueOnce(oldYears).mockResolvedValueOnce(currentYears);
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnMount: false },
      },
    });

    await client.fetchQuery(fiscalYearLookupQueryOptions());
    await client.invalidateQueries({ queryKey: fiscalYearKeys.all, refetchType: "active" });
    expect(getLookup).toHaveBeenCalledTimes(1);

    const observer = new QueryObserver(client, fiscalYearLookupQueryOptions());
    const unsubscribe = observer.subscribe(() => undefined);

    try {
      await vi.waitFor(() => {
        expect(getLookup).toHaveBeenCalledTimes(2);
        expect(observer.getCurrentResult().data).toEqual(currentYears);
      });
    } finally {
      unsubscribe();
      client.clear();
    }
  });
});
