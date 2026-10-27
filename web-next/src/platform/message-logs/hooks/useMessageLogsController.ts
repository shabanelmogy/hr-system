"use client";
import { useMemo, useState } from "react";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { exportMessageLogs } from "../services/messageLogService";
import type { MessageLogFilters, MessageLogRow } from "../types/messageLogs";
import { emptyMessageLogFilters, messageLogCriteria } from "../utils/messageLogPresentation";
import { useMessageLogList } from "./useMessageLogs";

export function useMessageLogsController() {
  const { hasPermission } = usePermissions();
  const list = useServerListState<"startedOnUtc", MessageLogFilters>({ defaultColumn: "startedOnUtc", defaultSortDirection: "DESC", defaultFilters: emptyMessageLogFilters, defaultPageSize: 25 });
  const [view, setView] = useState<"grid" | "cards">("grid"); const [showFilters, setShowFilters] = useState(true);
  const [selected, setSelected] = useState<MessageLogRow | null>(null); const [exportState, setExportState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const filters = list.state.filters; const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const criteria = useMemo(() => messageLogCriteria(filters, list.debouncedSearchValue, list.state.page, list.state.pageSize), [filters, list.debouncedSearchValue, list.state.page, list.state.pageSize]);
  const query = useMessageLogList(criteria, !invalidRange); const canExport = query.allowed && hasPermission(permissions.ExportMessageLogs);
  const download = async () => {
    if (!canExport || invalidRange || exportState === "pending") return;
    setExportState("pending");
    try {
      const result = await exportMessageLogs(criteria); const href = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a"); anchor.href = href; anchor.download = result.fileName ?? "message-logs.xlsx";
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(href); setExportState("success");
    } catch { setExportState("error"); }
  };
  return { list, filters, query, rows: query.data?.items ?? [], total: query.data?.totalCount ?? 0, invalidRange, view, setView, showFilters, setShowFilters,
    selected, setSelected, exportState, setExportState, canExport, download, patchFilters: (patch: Partial<MessageLogFilters>) => list.setFilters({ ...filters, ...patch }) };
}
