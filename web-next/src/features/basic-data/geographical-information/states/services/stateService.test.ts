import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRoutes } from "@/config";
import StateService, { toStateRequest } from "./stateService";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { post } }));
describe("StateService", () => {
  beforeEach(() => post.mockReset());
  it("normalizes the required State request fields", () => {
    expect(toStateRequest({ nameAr: " القاهرة ", nameEn: " Cairo ", code: " cai ", countryId: 7 })).toEqual({ nameAr: "القاهرة", nameEn: "Cairo", code: "CAI", countryId: 7 });
  });
  it("posts the bulk archive contract", async () => {
    post.mockResolvedValue({ archivedCount: 2 });
    await expect(StateService.archiveBulk([3, 7])).resolves.toEqual({ archivedCount: 2 });
    expect(post).toHaveBeenCalledWith(apiRoutes.states.bulkArchive, { ids: [3, 7] });
  });
});
