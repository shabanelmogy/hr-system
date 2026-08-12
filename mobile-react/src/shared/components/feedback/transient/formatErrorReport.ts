import type { ErrorDialogDetails, ErrorReportContext } from './types';

export function formatErrorReport(
  details: ErrorDialogDetails,
  context: ErrorReportContext,
): string {
  const lines = [context.heading, `Report ID: ${details.reportId}`];

  if (details.title) lines.push('', details.title);
  if (details.messages.length) {
    lines.push('', ...details.messages.map((message) => `- ${message}`));
  }
  if (details.status != null) lines.push('', `Status: ${details.status}`);
  if (details.traceId) lines.push(`Trace ID: ${details.traceId}`);
  if (details.correlationId) lines.push(`Correlation ID: ${details.correlationId}`);
  lines.push(`UTC time: ${details.occurredAt}`);

  if (context.includeTechnical) {
    lines.push('', 'Technical details');
    if (details.errorType) lines.push(`Error type: ${details.errorType}`);
    if (details.errorCodes?.length) {
      lines.push(`Error codes: ${details.errorCodes.join(', ')}`);
    }
    if (details.detail && !details.messages.includes(details.detail)) {
      lines.push(`Detail: ${details.detail}`);
    }
    if (details.stack) lines.push(`Stack: ${details.stack}`);
    if (context.appVersion) lines.push(`App version: ${context.appVersion}`);
    if (context.language) lines.push(`Language: ${context.language}`);
    if (context.direction) lines.push(`Direction: ${context.direction}`);
    if (context.theme) lines.push(`Theme: ${context.theme}`);
    if (context.platform) lines.push(`Platform: ${context.platform}`);
    if (context.screen) lines.push(`Screen: ${context.screen}`);
  }

  return lines.join('\n');
}
