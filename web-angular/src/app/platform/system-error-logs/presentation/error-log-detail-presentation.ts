import type { RecordSummaryField } from '../../../shared/ui/public-api';
import type { ErrorLogDetail, ErrorLogRow } from '../types/error-log';
import type { ErrorLogPresentation } from './error-log-presentation';

export function errorLogDetailGroups(
  entry: ErrorLogRow,
  captions: ErrorLogPresentation,
): readonly {
  readonly id: string;
  readonly title: string;
  readonly fields: readonly RecordSummaryField[];
}[] {
  const field = (
    id: string,
    key: string,
    value: string | number | null,
    direction: 'auto' | 'ltr' = 'auto',
    fullWidth = false,
  ): RecordSummaryField => ({
    id,
    label: captions.text(key),
    value:
      value === null
        ? captions.text('notAvailable')
        : typeof value === 'number'
          ? captions.numeric(value)
          : value,
    direction,
    fullWidth,
  });
  return [
    {
      id: 'action',
      title: captions.text('actionInformation'),
      fields: [
        field('service', 'service', entry.service),
        field('action', 'action', entry.action),
        field('occurred', 'occurred', captions.date(entry.occurredOnUtc)),
        field('utc', 'occurredUtc', new Date(entry.occurredOnUtc).toISOString(), 'ltr'),
        field('duration', 'duration', entry.durationMs),
        field('status', 'status', entry.statusCode),
        field('correlation', 'correlation', entry.correlationId, 'ltr'),
      ],
    },
    {
      id: 'user',
      title: captions.text('userInformation'),
      fields: [
        field('user', 'user', entry.userName),
        field('ip', 'ipAddress', entry.ipAddress, 'ltr'),
        field('client', 'client', entry.client),
        field('browser', 'browser', entry.browser, 'auto', true),
      ],
    },
  ];
}

export function formatErrorLogDetail(
  detail: ErrorLogDetail,
  captions: ErrorLogPresentation,
): string {
  const entry = detail.entry;
  const lines = [
    captions.text('detailTitle'),
    `${captions.text('recordId')}: ${entry.id}`,
    `${captions.text('source')}: ${captions.text('sources.' + entry.source)}`,
    `${captions.text('severity')}: ${captions.text('severities.' + entry.severity)}`,
    '',
    captions.text('message'),
    entry.summary,
  ];
  for (const group of errorLogDetailGroups(entry, captions)) {
    lines.push('', group.title);
    for (const field of group.fields) lines.push(`${field.label}: ${field.value}`);
  }
  lines.push(
    '',
    captions.text('diagnostics'),
    ...(detail.diagnostics.length
      ? detail.diagnostics
      : [captions.text('diagnosticsEmpty'), captions.text('diagnosticsEmptyHint')]),
  );
  return lines.join('\n');
}
