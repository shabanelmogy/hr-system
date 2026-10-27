import type { ChipProps } from "@mui/material";
import type { MessageLogCriteria, MessageLogFilters, MessageLogStatus } from "../types/messageLogs";

export const emptyMessageLogFilters: MessageLogFilters = { from: "", to: "", status: "", templateId: "", recipient: "" };
export function messageLogCriteria(filters: MessageLogFilters, search: string, page: number, pageSize: number): MessageLogCriteria {
  return { ...(filters.from ? { fromUtc: `${filters.from}T00:00:00.000Z` } : {}), ...(filters.to ? { toUtc: `${filters.to}T23:59:59.999Z` } : {}),
    ...(filters.status ? { status: filters.status } : {}), ...(filters.templateId ? { templateId: filters.templateId } : {}),
    ...(filters.recipient.trim() ? { recipient: filters.recipient.trim() } : {}), ...(search.trim() ? { search: search.trim() } : {}), page: page + 1, pageSize };
}
export function messageStatusColor(status: MessageLogStatus): ChipProps["color"] {
  return status === "accepted" ? "success" : status === "failed" ? "error" : status === "uncertain" ? "warning" : status === "pending" ? "info" : "default";
}
