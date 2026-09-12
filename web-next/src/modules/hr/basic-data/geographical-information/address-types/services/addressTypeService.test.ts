import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRoutes } from "@/config";
import AddressTypeService from "./addressTypeService";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/shared/services/apiService", () => ({ default: { post } }));

describe("AddressTypeService", () => {
  beforeEach(() => post.mockReset());

  it("posts an exact normalized bulk-create envelope", async () => {
    post.mockResolvedValue({ createdCount: 2 });

    await expect(AddressTypeService.bulkCreate([
      { nameAr: "  سكن  ", nameEn: "  Residence " },
      { nameAr: " عمل ", nameEn: " Work " },
    ])).resolves.toEqual({ createdCount: 2 });

    expect(post).toHaveBeenCalledWith(apiRoutes.addressTypes.bulkCreate, {
      addressTypes: [
        { nameAr: "سكن", nameEn: "Residence" },
        { nameAr: "عمل", nameEn: "Work" },
      ],
    });
  });

  it("posts the exact named bulk archive envelope", async () => {
    post.mockResolvedValue({ archivedCount: 2 });

    await expect(AddressTypeService.bulkArchive([3, 7])).resolves.toEqual({ archivedCount: 2 });
    expect(post).toHaveBeenCalledWith(apiRoutes.addressTypes.bulkArchive, { ids: [3, 7] });
  });
});
