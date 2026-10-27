import { version } from "@/config/api/constants";
import { apiService } from "@/shared/services";
import {
  errorLogDetailSchema,
  errorLogPageSchema,
  errorLogSettingsSchema,
} from "../validation/errorLogs";
import type { ErrorLogCriteria, ErrorLogScope } from "../types/errorLogs";

const endpoint = (scope: ErrorLogScope) =>
  `${version}/${scope === "system" ? "system-error-logs" : "error-logs"}`;

export function errorLogParams(criteria: ErrorLogCriteria): URLSearchParams {
  const params = new URLSearchParams();
  for (const name of ["fromUtc", "toUtc", "userName", "source", "statusCode", "search"] as const) {
    const value = criteria[name];
    if (value !== undefined && value !== "") params.set(name, String(value));
  }
  params.set("page", String(criteria.page));
  params.set("pageSize", String(criteria.pageSize));
  return params;
}

export async function listErrorLogs(scope: ErrorLogScope, criteria: ErrorLogCriteria) {
  return errorLogPageSchema.parse(await apiService.get<unknown>(endpoint(scope), Object.fromEntries(errorLogParams(criteria))));
}

export async function getErrorLogDetail(scope: ErrorLogScope, id: string) {
  return errorLogDetailSchema.parse(await apiService.get<unknown>(`${endpoint(scope)}/${encodeURIComponent(id)}`));
}

export async function exportErrorLogs(scope: ErrorLogScope, criteria: ErrorLogCriteria) {
  return apiService.getBlobDownload(`${endpoint(scope)}/export?${errorLogParams(criteria)}`);
}

export async function getErrorLogSettings() {
  return errorLogSettingsSchema.parse(await apiService.get<unknown>(`${endpoint("system")}/settings`));
}

export async function updateErrorLogSettings(retentionDays: number, expectedRevision: number) {
  return errorLogSettingsSchema.parse(await apiService.put<unknown>(`${endpoint("system")}/settings`, { retentionDays, expectedRevision }));
}
