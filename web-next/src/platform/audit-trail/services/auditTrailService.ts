import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import {
  auditActions,
  type AuditAction,
  type AuditFieldChange,
  type AuditTrailDetails,
  type AuditTrailItem,
  type AuditTrailModuleFilter,
  type AuditTrailPage,
  type AuditTrailQuery,
} from "../types/auditTrail";

export async function getAuditTrailPage(
  query: AuditTrailQuery,
  cursor?: string | null,
): Promise<AuditTrailPage> {
  const payload = await apiService.get<unknown>(apiRoutes.advancedTools.auditTrail, {
    ...query,
    cursor: cursor ?? undefined,
  });
  return normalizeAuditTrailPage(payload);
}

export async function getAuditTrailEntry(
  moduleCode: string,
  id: number,
): Promise<AuditTrailDetails> {
  const payload = await apiService.get<unknown>(
    `${apiRoutes.advancedTools.auditTrail}/${encodeURIComponent(moduleCode)}/${id}`,
  );
  return normalizeAuditTrailDetails(payload);
}

export async function getAuditTrailFilters(): Promise<AuditTrailModuleFilter[]> {
  const payload = await apiService.get<unknown>(`${apiRoutes.advancedTools.auditTrail}/filters`);
  const modules = isRecord(payload) && Array.isArray(payload.modules) ? payload.modules : [];
  return modules.filter(isRecord).map((module) => ({
    moduleCode: asString(module.moduleCode),
    entityNames: Array.isArray(module.entityNames)
      ? module.entityNames.filter((name): name is string => typeof name === "string")
      : [],
  }));
}

export function normalizeAuditTrailPage(payload: unknown): AuditTrailPage {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    throw new TypeError("Invalid audit trail response.");
  }
  return {
    items: payload.items.map(normalizeItem),
    nextCursor: asNullableString(payload.nextCursor),
  };
}

export function normalizeAuditTrailDetails(payload: unknown): AuditTrailDetails {
  if (!isRecord(payload) || !isRecord(payload.entry)) {
    throw new TypeError("Invalid audit trail entry response.");
  }
  return {
    entry: normalizeItem(payload.entry),
    changes: Array.isArray(payload.changes) ? payload.changes.map(normalizeChange) : [],
  };
}

function normalizeItem(value: unknown): AuditTrailItem {
  const item = isRecord(value) ? value : {};
  return {
    moduleCode: asString(item.moduleCode),
    id: typeof item.id === "number" ? item.id : Number(item.id ?? 0),
    entityName: asString(item.entityName),
    entityKey: asString(item.entityKey),
    entityDisplay: asNullableString(item.entityDisplay),
    action: normalizeAction(item.action),
    userId: asNullableString(item.userId),
    userName: asNullableString(item.userName),
    occurredOn: asString(item.occurredOn),
    correlationId: asNullableString(item.correlationId),
    changeCount: typeof item.changeCount === "number" ? item.changeCount : 0,
  };
}

function normalizeChange(value: unknown): AuditFieldChange {
  const change = isRecord(value) ? value : {};
  return {
    field: asString(change.field),
    oldValue: asNullableString(change.oldValue),
    newValue: asNullableString(change.newValue),
  };
}

function normalizeAction(value: unknown): AuditAction {
  return auditActions.find((action) => action === value) ?? "Modified";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
