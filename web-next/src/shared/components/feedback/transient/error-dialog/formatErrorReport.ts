import type { ErrorDialogDetails } from "./types";

export function formatErrorReport(
  details: ErrorDialogDetails,
  heading: string,
): string {
  const lines = [heading];
  if (details.reportId) lines.push(`Report ID: ${details.reportId}`);
  if (details.title) lines.push("", details.title);
  if (details.messages.length) {
    lines.push("", ...details.messages.map((message) => `- ${message}`));
  }

  if (details.status != null) lines.push("", `Status: ${details.status}`);
  if (details.traceId) lines.push(`Trace ID: ${details.traceId}`);
  if (details.errorType) lines.push(`Error type: ${details.errorType}`);
  if (details.errorCodes?.length) {
    lines.push(`Error codes: ${details.errorCodes.join(", ")}`);
  }
  if (details.detail && !details.messages.includes(details.detail)) {
    lines.push(`Detail: ${details.detail}`);
  }
  if (details.path) lines.push(`Page: ${details.path}`);
  if (details.occurredAt) {
    const occurredAt = new Date(details.occurredAt);
    lines.push(`Local time: ${occurredAt.toLocaleString()}`);
    lines.push(`UTC time: ${details.occurredAt}`);
  }

  if (details.environment) {
    const environment = details.environment;
    lines.push(
      "",
      "Technical context",
      `App version: ${environment.appVersion}`,
      `App language: ${environment.appLanguage}`,
      `Browser language: ${environment.browserLanguage}`,
      `Direction: ${environment.direction}`,
      `Theme: ${environment.theme}`,
      `Time zone: ${environment.timeZone}`,
      `Platform: ${environment.platform}`,
      `Viewport: ${environment.viewport}`,
      `Screen: ${environment.screen}`,
      `Online: ${environment.online ? "Yes" : "No"}`,
      `Browser: ${environment.browser}`,
    );
  }

  return lines.join("\n");
}
