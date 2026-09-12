import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import reportTemplateService from "./reportTemplateService";

const { get, post, put } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put },
}));

describe("reportTemplateService", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    put.mockReset();
  });

  it("uses the management collection without a tenant identifier", async () => {
    get.mockResolvedValue([]);

    await reportTemplateService.listForManagement("countries");

    expect(get).toHaveBeenCalledWith(apiRoutes.reportTemplates.manage, {
      featureKey: "countries",
    });
  });

  it("requests only the server-approved data source descriptor", async () => {
    get.mockResolvedValue([]);

    await reportTemplateService.getDataSources("countries");

    expect(get).toHaveBeenCalledWith(apiRoutes.reportTemplates.dataSources, {
      featureKey: "countries",
    });
  });

  it("sends row version on updates and publication", async () => {
    const request = {
      name: "Directory",
      definitionJson: "{}",
      dataSourceKey: "countries",
      rowVersion: "AQID",
    };

    await reportTemplateService.update("template-id", request);
    await reportTemplateService.publish("template-id", "AQID");

    expect(put).toHaveBeenCalledWith(apiRoutes.reportTemplates.update("template-id"), request);
    expect(post).toHaveBeenCalledWith(apiRoutes.reportTemplates.publish("template-id"), {
      rowVersion: "AQID",
    });
  });
});
