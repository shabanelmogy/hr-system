import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, put } = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, put },
}));

import { apiRoutes } from "@/config/api";
import { offlineOperationsService, parseOfflineOperationsPolicy } from "./offlineOperationsService";
import {
  isCapabilityStateCompatible,
  isPolicySafeForEditing,
  offlineOperationsPolicyQueryKey,
  type OfflineOperationsPolicy,
} from "./types";

const response = {
  version: 1,
  tenantId: "tenant-a",
  companyId: 7,
  modes: {
    "countries.read": "offline-read",
    "workforce-plan.update-draft": "online-only",
  },
  capabilities: [
    { id: "countries.read", supportedModes: ["online-only", "offline-read"] },
    { id: "workforce-plan.update-draft", supportedModes: ["online-only", "offline-draft", "offline-command"] },
  ],
  rowVersion: "AQID",
  updatedOn: "2026-09-11T09:00:00Z",
  updatedByUserId: "admin-a",
};

describe("offlineOperationsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isolates the React Query cache key by tenant and company scope", () => {
    expect(offlineOperationsPolicyQueryKey("tenant-a", 7)).toEqual([
      "offline-operations",
      "policy",
      "tenant-a",
      7,
    ]);
    expect(offlineOperationsPolicyQueryKey("tenant-a", 7)).not.toEqual(
      offlineOperationsPolicyQueryKey("tenant-a", 8),
    );
    expect(offlineOperationsPolicyQueryKey("tenant-a", 7)).not.toEqual(
      offlineOperationsPolicyQueryKey("tenant-b", 7),
    );
  });

  it("reads and updates the Platform policy with the optimistic rowVersion", async () => {
    get.mockResolvedValue(response);
    put.mockResolvedValue({ ...response, rowVersion: "BAUG" });

    await expect(offlineOperationsService.getPolicy()).resolves.toMatchObject({ companyId: 7 });
    await offlineOperationsService.updatePolicy({ modes: response.modes as never, rowVersion: "AQID" });

    expect(apiRoutes.offlineOperations.policy).toBe("/api/v1/offline-operations/policy");
    expect(get).toHaveBeenCalledWith(apiRoutes.offlineOperations.policy);
    expect(put).toHaveBeenCalledWith(apiRoutes.offlineOperations.policy, {
      modes: response.modes,
      rowVersion: "AQID",
    });
  });

  it("rejects an unsupported wire mode instead of trusting the response", () => {
    expect(() => parseOfflineOperationsPolicy({
      ...response,
      modes: { ...response.modes, "countries.read": "unsafe-command" },
    })).toThrow("Invalid offline mode");
  });

  it("rejects a configured mode that the server capability does not support", () => {
    expect(() => parseOfflineOperationsPolicy({
      ...response,
      capabilities: [
        { id: "countries.read", supportedModes: ["online-only"] },
        response.capabilities[1],
      ],
    })).toThrow("Configured offline mode for countries.read is not server-supported");
  });

  it("rejects incomplete or unmatched server policy snapshots", () => {
    expect(() => parseOfflineOperationsPolicy({
      ...response,
      modes: { "countries.read": "offline-read" },
    })).toThrow("Missing offline mode for workforce-plan.update-draft");

    expect(() => parseOfflineOperationsPolicy({
      ...response,
      capabilities: [response.capabilities[0]],
    })).toThrow("Missing offline capability definition for workforce-plan.update-draft");
  });

  it("accepts additive server capabilities but keeps them outside the client edit ceiling", () => {
    const parsed = parseOfflineOperationsPolicy({
      ...response,
      modes: { ...response.modes, "future.safe-read": "offline-read" },
      capabilities: [
        ...response.capabilities,
        { id: "future.safe-read", supportedModes: ["online-only", "offline-read"] },
      ],
    });
    const futureCapability = parsed.capabilities.find(({ id }) => id === "future.safe-read");

    expect(futureCapability).toBeDefined();
    expect(isCapabilityStateCompatible(futureCapability!, parsed.modes["future.safe-read"])).toBe(false);
    expect(isPolicySafeForEditing(parsed)).toBe(true);
    expect(parsed.modes["future.safe-read"]).toBe("offline-read");
  });

  it("fails closed when a known capability is outside the client ceiling or missing", () => {
    const outsideClientCeiling = parseOfflineOperationsPolicy({
      ...response,
      modes: { ...response.modes, "countries.read": "offline-command" },
      capabilities: [
        { id: "countries.read", supportedModes: ["online-only", "offline-read", "offline-command"] },
        response.capabilities[1],
      ],
    });
    expect(isPolicySafeForEditing(outsideClientCeiling)).toBe(false);

    const missingKnownCapability = {
      ...parseOfflineOperationsPolicy(response),
      capabilities: [parseOfflineOperationsPolicy(response).capabilities[0]],
      modes: { "countries.read": "offline-read" },
    } as OfflineOperationsPolicy;
    expect(isPolicySafeForEditing(missingKnownCapability)).toBe(false);
  });
});
