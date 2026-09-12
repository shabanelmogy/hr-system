import apiService from "@/shared/services/apiService";
import { apiRoutes } from "@/config/api";
import {
  isOfflineOperationMode,
  type OfflineOperationCapability,
  type OfflineOperationsPolicy,
  type UpdateOfflineOperationsPolicyRequest,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function parseCapability(value: unknown): OfflineOperationCapability {
  if (!isRecord(value)
    || typeof value.id !== "string"
    || value.id.trim().length === 0
    || !Array.isArray(value.supportedModes)
    || value.supportedModes.length === 0) {
    throw new Error("Invalid offline capability response.");
  }
  if (!value.supportedModes.every(isOfflineOperationMode)) {
    throw new Error("Invalid offline capability mode response.");
  }
  if (new Set(value.supportedModes).size !== value.supportedModes.length) {
    throw new Error(`Duplicate supported offline mode for ${value.id}.`);
  }
  return { id: value.id, supportedModes: [...value.supportedModes] };
}

export function parseOfflineOperationsPolicy(value: unknown): OfflineOperationsPolicy {
  if (!isRecord(value)) {
    throw new Error("Invalid offline operations policy response.");
  }

  const {
    version,
    tenantId,
    companyId,
    modes: rawModes,
    capabilities: rawCapabilities,
    rowVersion,
    updatedOn,
    updatedByUserId,
  } = value;
  if (typeof version !== "number"
    || !Number.isInteger(version)
    || version <= 0
    || typeof tenantId !== "string"
    || tenantId.trim().length === 0
    || typeof companyId !== "number"
    || !Number.isInteger(companyId)
    || companyId <= 0
    || !isRecord(rawModes)
    || !Array.isArray(rawCapabilities)
    || !isNullableString(rowVersion)
    || !isNullableString(updatedOn)
    || !isNullableString(updatedByUserId)) {
    throw new Error("Invalid offline operations policy response.");
  }

  const modes = Object.fromEntries(Object.entries(rawModes).map(([id, mode]) => {
    if (!isOfflineOperationMode(mode)) throw new Error(`Invalid offline mode for ${id}.`);
    return [id, mode];
  }));
  const capabilities = rawCapabilities.map(parseCapability);
  const capabilityIds = new Set<string>();
  for (const capability of capabilities) {
    if (capabilityIds.has(capability.id)) {
      throw new Error(`Duplicate offline capability ${capability.id}.`);
    }
    capabilityIds.add(capability.id);

    const currentMode = modes[capability.id];
    if (!currentMode) {
      throw new Error(`Missing offline mode for ${capability.id}.`);
    }
    if (!capability.supportedModes.includes(currentMode)) {
      throw new Error(`Configured offline mode for ${capability.id} is not server-supported.`);
    }
  }
  for (const capabilityId of Object.keys(modes)) {
    if (!capabilityIds.has(capabilityId)) {
      throw new Error(`Missing offline capability definition for ${capabilityId}.`);
    }
  }

  return {
    version,
    tenantId,
    companyId,
    modes,
    capabilities,
    rowVersion,
    updatedOn,
    updatedByUserId,
  };
}

export const offlineOperationsService = {
  async getPolicy(): Promise<OfflineOperationsPolicy> {
    return parseOfflineOperationsPolicy(await apiService.get<unknown>(apiRoutes.offlineOperations.policy));
  },

  async updatePolicy(request: UpdateOfflineOperationsPolicyRequest): Promise<OfflineOperationsPolicy> {
    return parseOfflineOperationsPolicy(
      await apiService.put<unknown>(apiRoutes.offlineOperations.policy, request),
    );
  },
};
