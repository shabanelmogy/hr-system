import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRoutes } from "@/config";
import DistrictService, { toDistrictRequest } from "./districtService";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/shared/services/apiService", () => ({ default: { post } }));

describe("DistrictService", () => {
  beforeEach(() => post.mockReset());

  it("normalizes the District-specific parent request", () => {
    expect(toDistrictRequest({
      nameAr: " المعادي ",
      nameEn: " Maadi ",
      code: " maa ",
      stateId: 7,
    })).toEqual({
      nameAr: "المعادي",
      nameEn: "Maadi",
      code: "MAA",
      stateId: 7,
    });
  });

  it("posts the exact named bulk archive envelope", async () => {
    post.mockResolvedValue({ archivedCount: 2 });

    await expect(DistrictService.archiveBulk([3, 7])).resolves.toEqual({ archivedCount: 2 });
    expect(post).toHaveBeenCalledWith(apiRoutes.districts.bulkArchive, { ids: [3, 7] });
  });

  it("posts the exact bulk create envelope with normalized District rows", async () => {
    post.mockResolvedValue({ createdCount: 1 });

    await expect(DistrictService.createBulk([
      { nameAr: " المعادي ", nameEn: " Maadi ", code: " maa ", stateId: 7 },
    ])).resolves.toEqual({ createdCount: 1 });

    expect(post).toHaveBeenCalledWith(apiRoutes.districts.bulkCreate, {
      districts: [
        { nameAr: "المعادي", nameEn: "Maadi", code: "MAA", stateId: 7 },
      ],
    });
  });
});
