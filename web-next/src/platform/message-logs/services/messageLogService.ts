import { version } from "@/config/api/constants";
import { apiService } from "@/shared/services";
import { messageLogDetailSchema, messageLogPageSchema, type MessageLogCriteria } from "../types/messageLogs";

const endpoint = `${version}/message-logs`;
export function messageLogParams(criteria: MessageLogCriteria) {
  const params = new URLSearchParams();
  for (const name of ["fromUtc", "toUtc", "status", "templateId", "recipient", "search", "page", "pageSize"] as const) {
    const value = criteria[name]; if (value !== undefined && value !== "") params.set(name, String(value));
  }
  return params;
}
export async function listMessageLogs(criteria: MessageLogCriteria) {
  return messageLogPageSchema.parse(await apiService.get<unknown>(endpoint, Object.fromEntries(messageLogParams(criteria))));
}
export async function getMessageLog(id: string) {
  return messageLogDetailSchema.parse(await apiService.get<unknown>(`${endpoint}/${encodeURIComponent(id)}`));
}
export function exportMessageLogs(criteria: MessageLogCriteria) { return apiService.getBlobDownload(`${endpoint}/export?${messageLogParams(criteria)}`); }
