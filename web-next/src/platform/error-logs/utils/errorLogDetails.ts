import type { ErrorLogDetail, ErrorLogRow, ErrorLogScope } from "../types/errorLogs";

export interface ErrorLogDetailField {
  id: string;
  labelKey: string;
  value: string | number | null;
  fullWidth?: boolean;
  direction?: "auto" | "ltr";
}
export function getErrorLogDetailGroups(entry: ErrorLogRow, scope: ErrorLogScope, occurred: string) {
  return [
    { id: "action", titleKey: "errorLogs.actionInformation", fields: [
      { id: "service", labelKey: "errorLogs.service", value: entry.service },
      { id: "action", labelKey: "errorLogs.action", value: entry.action },
      { id: "occurred", labelKey: "errorLogs.occurred", value: occurred },
      { id: "occurredUtc", labelKey: "errorLogs.occurredUtc", value: new Date(entry.occurredOnUtc).toISOString(), direction: "ltr" },
      { id: "duration", labelKey: "errorLogs.duration", value: entry.durationMs },
      { id: "status", labelKey: "errorLogs.status", value: entry.statusCode },
      { id: "correlation", labelKey: "errorLogs.correlation", value: entry.correlationId, direction: "ltr" },
    ] satisfies ErrorLogDetailField[] },
    { id: "user", titleKey: "errorLogs.userInformation", fields: [
      { id: "user", labelKey: "errorLogs.user", value: entry.userName },
      ...(scope === "system" ? [{ id: "ip", labelKey: "errorLogs.ipAddress", value: entry.ipAddress, direction: "ltr" } satisfies ErrorLogDetailField] : []),
      { id: "client", labelKey: "errorLogs.client", value: entry.client },
      { id: "browser", labelKey: "errorLogs.browser", value: entry.browser, fullWidth: true },
    ] satisfies ErrorLogDetailField[] },
  ] as const;
}

/** Copy only the same projected fields permitted in the current detail view. */
export function formatErrorLogDetails(detail: ErrorLogDetail, scope: ErrorLogScope,
  occurred: string, translate: (key: string) => string): string {
  const { entry } = detail;
  const lines = [translate("errorLogs.detailTitle"), `${translate("errorLogs.recordId")}: ${entry.id}`,
    `${translate("errorLogs.source")}: ${translate(`errorLogs.sources.${entry.source}`)}`,
    `${translate("errorLogs.severity")}: ${translate(`errorLogs.severities.${entry.severity}`)}`,
    "", translate("errorLogs.message"), entry.summary];
  for (const group of getErrorLogDetailGroups(entry, scope, occurred)) {
    lines.push("", translate(group.titleKey));
    for (const field of group.fields) lines.push(`${translate(field.labelKey)}: ${field.value ?? translate("errorLogs.notAvailable")}`);
  }
  if (scope === "system") lines.push("", translate("errorLogs.diagnostics"),
    ...(detail.diagnostics.length ? detail.diagnostics : [translate("errorLogs.diagnosticsEmpty"), translate("errorLogs.diagnosticsEmptyHint")]));
  return lines.join("\n");
}
