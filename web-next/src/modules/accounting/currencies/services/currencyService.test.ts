import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { currencyService } from "./currencyService";

const { get, post, put, remove } = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), remove: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put, delete: remove },
}));

describe("currencyService", () => {
  beforeEach(() => {
    get.mockReset(); post.mockReset(); put.mockReset(); remove.mockReset();
  });

  it("normalizes the Accounting-owned currency mutation", async () => {
    post.mockResolvedValue({ id: 1 });
    await currencyService.create({
      currencyCode: " egp ",
      nameEn: " Egyptian Pound ",
      nameAr: " جنيه مصري ",
      symbol: " EGP ",
    });
    expect(post).toHaveBeenCalledWith(apiRoutes.currencies.create, {
      currencyCode: "EGP",
      nameEn: "Egyptian Pound",
      nameAr: "جنيه مصري",
      symbol: "EGP",
    });
  });

  it("uses the Accounting lookup and sends RowVersion for archive and restore", async () => {
    get.mockResolvedValue([]);
    remove.mockResolvedValue(undefined);
    post.mockResolvedValue({ id: 7 });

    await currencyService.getLookup();
    await currencyService.archive({ id: 7, rowVersion: "AQ==" });
    await currencyService.restore({ id: 7, rowVersion: "Ag==" });

    expect(get).toHaveBeenCalledWith(apiRoutes.currencies.lookup);
    expect(remove).toHaveBeenCalledWith(apiRoutes.currencies.archive(7), { rowVersion: "AQ==" });
    expect(post).toHaveBeenCalledWith(apiRoutes.currencies.restore(7), { rowVersion: "Ag==" });
  });
});
