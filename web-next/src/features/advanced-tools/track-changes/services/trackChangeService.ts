import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type { TrackChangeLog } from "../types/trackChange";

export async function getTrackChanges(): Promise<TrackChangeLog[]> {
  const response = await apiService.get(apiRoutes.advancedTools.trackChanges);
  return normalizeTrackChanges(unwrapResponse(response));
}

export function normalizeTrackChanges(data: unknown): TrackChangeLog[] {
  if (!Array.isArray(data)) return [];

  const fingerprintCounts = new Map<string, number>();

  return data.map((row) => {
    const record = isRecord(row) ? row : {};
    const changeLogId = asStringOrNumber(
      record.changeLogId ?? record.ChangeLogId,
    );
    const entityName = asString(record.entityName ?? record.EntityName);
    const key = asString(record.key ?? record.Key);
    const oldValue = asString(record.oldValue ?? record.OldValue);
    const newValue = asString(record.newValue ?? record.NewValue);
    const changedBy = asString(record.changedBy ?? record.ChangedBy);
    const changedAt = asString(record.changedAt ?? record.ChangedAt);
    const changedByPc = asString(record.changedByPc ?? record.ChangedByPc);
    const fingerprint = createFingerprint([
      changeLogId,
      entityName,
      key,
      oldValue,
      newValue,
      changedBy,
      changedAt,
      changedByPc,
    ]);
    const occurrence = fingerprintCounts.get(fingerprint) ?? 0;
    fingerprintCounts.set(fingerprint, occurrence + 1);

    return {
      id: occurrence === 0 ? fingerprint : `${fingerprint}|${occurrence}`,
      changeLogId,
      entityName,
      key,
      oldValue,
      newValue,
      changedBy,
      changedAt,
      changedByPc,
    };
  });
}

function createFingerprint(values: Array<string | number>): string {
  return values.map((value) => encodeURIComponent(String(value))).join("|");
}

function unwrapResponse(response: unknown): unknown {
  if (!isRecord(response)) return response;
  return response.data ?? response.value ?? response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringOrNumber(value: unknown): string | number {
  return typeof value === "number" || typeof value === "string" ? value : "";
}
