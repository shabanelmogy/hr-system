import { describe, expect, it, vi } from "vitest";

import apiService from "@/shared/services/apiService";
import { moduleApi, parseModulesResponse } from "./moduleApi";

vi.mock("@/shared/services/apiService", () => ({
  default: { get: vi.fn() },
}));

const moduleResponse = {
  code: "hr",
  name: "Human Resources",
  submodules: [
    {
      code: "workforce",
      name: "Workforce",
      requiredPermissions: ["WorkforcePlans:View"],
      entryPath: "/workforce-planning",
    },
  ],
  isDefault: true,
};

describe("module catalog response contract", () => {
  it("loads the dedicated tenant entitlement catalog", async () => {
    vi.mocked(apiService.get).mockResolvedValue([moduleResponse]);

    await expect(moduleApi.getTenantEntitlements()).resolves.toEqual([moduleResponse]);
    expect(apiService.get).toHaveBeenCalledWith("/api/v1/modules/tenant-entitlements");
  });

  it("accepts required module metadata including isDefault and nullable entryPath", () => {
    expect(parseModulesResponse([
      moduleResponse,
      {
        ...moduleResponse,
        code: "reporting",
        submodules: [{ ...moduleResponse.submodules[0], entryPath: null }],
        isDefault: false,
      },
    ])).toHaveLength(2);
  });

  it("rejects missing default metadata and omitted submodule entry paths", () => {
    const withoutDefault: Partial<typeof moduleResponse> = { ...moduleResponse };
    delete withoutDefault.isDefault;
    expect(() => parseModulesResponse([withoutDefault])).toThrow("Invalid module response");

    const withoutEntryPath: Partial<(typeof moduleResponse.submodules)[number]> = {
      ...moduleResponse.submodules[0],
    };
    delete withoutEntryPath.entryPath;
    expect(() => parseModulesResponse([{ ...moduleResponse, submodules: [withoutEntryPath] }])).toThrow(
      "Invalid module submodule response",
    );
  });
});
