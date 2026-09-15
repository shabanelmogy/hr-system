import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { organizationalStructureService } from "./organizationalStructureService";

const { post, put } = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get: vi.fn(), post, put, delete: vi.fn() } }));

describe("organizationalStructureService", () => {
  beforeEach(() => { post.mockReset(); put.mockReset(); });

  it("keeps centralized state in the form and omits it from the mutation wire contract", async () => {
    post.mockResolvedValue({ id: 8 });

    await organizationalStructureService.create({
      resource: "departments",
      request: { code: " fin ", nameEn: " Finance ", nameAr: " المالية ", isCentralized: true },
    });

    expect(post).toHaveBeenCalledWith(apiRoutes.organizationalStructure.create("departments"), {
      code: "FIN",
      nameEn: "Finance",
      nameAr: "المالية",
    });
  });
});
