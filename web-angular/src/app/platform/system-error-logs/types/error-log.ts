import { errorLogColumnFilterJson } from './error-log-column-filters';

export type ErrorLogSource = 'api' | 'job' | 'web' | 'mobile';
export type ErrorLogSeverity = 'warning' | 'error';

export interface ErrorLogRow {
  readonly id: string;
  readonly occurredOnUtc: string;
  readonly source: ErrorLogSource;
  readonly severity: ErrorLogSeverity;
  readonly userName: string | null;
  readonly service: string | null;
  readonly action: string | null;
  readonly statusCode: number | null;
  readonly durationMs: number | null;
  readonly correlationId: string | null;
  readonly summary: string;
  readonly client: string | null;
  readonly browser: string | null;
  readonly ipAddress: string | null;
}
export interface ErrorLogPage {
  readonly items: readonly ErrorLogRow[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
}
export interface ErrorLogDetail {
  readonly entry: ErrorLogRow;
  readonly diagnostics: readonly string[];
}
export interface ErrorLogSettings {
  readonly retentionDays: number;
  readonly revision: number;
  readonly queueDepth: number;
  readonly droppedCount: number;
  readonly failedWrites: number;
}
export interface ErrorLogCriteria {
  readonly columnFilters?: string;
  readonly fromUtc?: string;
  readonly toUtc?: string;
  readonly userName?: string;
  readonly source?: ErrorLogSource;
  readonly statusCode?: number;
  readonly search?: string;
  readonly page: number;
  readonly pageSize: number;
}
export interface ErrorLogExport {
  readonly blob: Blob;
  readonly fileName: string;
}

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const utcPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const xlsxContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const criteriaKeys = [
  'fromUtc',
  'toUtc',
  'userName',
  'source',
  'statusCode',
  'search',
  'columnFilters',
] as const;

export function parseErrorLogPage(value: unknown): ErrorLogPage {
  const page = record(value);
  const items = array(page['items']).map(parseErrorLogRow);
  const totalCount = nonNegativeSafeInteger(page['totalCount'], 'total count');
  const currentPage = positiveSafeInteger(page['page'], 100000, 'page');
  const pageSize = positiveSafeInteger(page['pageSize'], 100, 'page size');
  if (
    items.length > pageSize ||
    totalCount < items.length ||
    new Set(items.map((item) => item.id)).size !== items.length
  )
    throw new Error('Invalid system error log page');
  return { items, totalCount, page: currentPage, pageSize };
}
export function parseErrorLogDetail(value: unknown, id: string): ErrorLogDetail {
  const detail = record(value);
  const expectedId = parseErrorLogId(id);
  const entry = parseErrorLogRow(detail['entry']);
  const diagnostics = array(detail['diagnostics']).map((item) => string(item, 'diagnostic'));
  if (entry.id !== expectedId) throw new Error('Invalid system error log detail identity');
  return { entry, diagnostics };
}
export function parseErrorLogSettings(value: unknown): ErrorLogSettings {
  const settings = record(value);
  return {
    retentionDays: positiveSafeInteger(settings['retentionDays'], 3650, 'retention days'),
    revision: nonNegativeSafeInteger(settings['revision'], 'revision'),
    queueDepth: nonNegativeSafeInteger(settings['queueDepth'], 'queue depth'),
    droppedCount: nonNegativeSafeInteger(settings['droppedCount'], 'dropped count'),
    failedWrites: nonNegativeSafeInteger(settings['failedWrites'], 'failed writes'),
  };
}
export function errorLogParameters(input: ErrorLogCriteria): Record<string, string> {
  const criteria = parseErrorLogCriteria(input);
  const parameters: Record<string, string> = {
    page: String(criteria.page),
    pageSize: String(criteria.pageSize),
  };
  for (const key of criteriaKeys) {
    const value = criteria[key];
    if (value !== undefined) parameters[key] = String(value);
  }
  return parameters;
}
export function parseErrorLogCriteria(input: ErrorLogCriteria): ErrorLogCriteria {
  const criteria = record(input);
  const fromUtc = optionalUtc(criteria['fromUtc']);
  const toUtc = optionalUtc(criteria['toUtc']);
  if (fromUtc !== undefined && toUtc !== undefined && Date.parse(fromUtc) > Date.parse(toUtc))
    throw new Error('Invalid system error log date range');
  const source = optionalSource(criteria['source']);
  const statusCode = optionalInteger(criteria['statusCode'], 400, 599, 'status code');
  const columnFilters = errorLogColumnFilterJson(input.columnFilters);
  return {
    page: positiveSafeInteger(criteria['page'], 100000, 'page'),
    pageSize: positiveSafeInteger(criteria['pageSize'], 100, 'page size'),
    ...(columnFilters === undefined ? {} : { columnFilters }),
    ...(fromUtc === undefined ? {} : { fromUtc }),
    ...(toUtc === undefined ? {} : { toUtc }),
    ...(source === undefined ? {} : { source }),
    ...(statusCode === undefined ? {} : { statusCode }),
    ...(criteria['userName'] === undefined
      ? {}
      : { userName: stringAtMost(criteria['userName'], 100, 'user name') }),
    ...(criteria['search'] === undefined
      ? {}
      : { search: stringAtMost(criteria['search'], 120, 'search') }),
  };
}
export function parseErrorLogId(value: string): string {
  if (!guidPattern.test(value)) throw new Error('Invalid system error log identifier');
  return value.toLowerCase();
}
export function parseXlsxErrorLogExport(
  body: unknown,
  contentDisposition: string | null,
  contentType: string | null,
): ErrorLogExport {
  if (
    !(body instanceof Blob) ||
    body.size === 0 ||
    contentType?.split(';', 1)[0]?.toLowerCase() !== xlsxContentType
  )
    throw new Error('Invalid system error log XLSX response');
  return { blob: body, fileName: xlsxFileName(contentDisposition) };
}

function parseErrorLogRow(value: unknown): ErrorLogRow {
  const row = record(value);
  return {
    id: parseErrorLogId(string(row['id'], 'identifier')),
    occurredOnUtc: utc(row['occurredOnUtc']),
    source: source(row['source']),
    severity: severity(row['severity']),
    userName: nullableString(row['userName'], 'user name'),
    service: nullableString(row['service'], 'service'),
    action: nullableString(row['action'], 'action'),
    statusCode: nullableInteger(row['statusCode'], 0, 599, 'status code'),
    durationMs: nullableNonNegativeSafeInteger(row['durationMs'], 'duration'),
    correlationId: nullableString(row['correlationId'], 'correlation'),
    summary: string(row['summary'], 'summary'),
    client: nullableString(row['client'], 'client'),
    browser: nullableString(row['browser'], 'browser'),
    ipAddress: nullableString(row['ipAddress'], 'IP address'),
  };
}
function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Invalid system error log payload');
  return value;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function array(value: unknown): readonly unknown[] {
  if (!Array.isArray(value)) throw new Error('Invalid system error log list');
  return value;
}
function string(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${name}`);
  return value;
}
function stringAtMost(value: unknown, maximum: number, name: string): string {
  const parsed = string(value, name);
  if (parsed.length > maximum) throw new Error(`Invalid ${name}`);
  return parsed;
}
function nullableString(value: unknown, name: string): string | null {
  return value === null ? null : string(value, name);
}
function utc(value: unknown): string {
  const parsed = string(value, 'UTC timestamp');
  const milliseconds = Date.parse(parsed);
  if (
    !utcPattern.test(parsed) ||
    Number.isNaN(milliseconds) ||
    new Date(milliseconds).toISOString().slice(0, 19) !== parsed.slice(0, 19)
  )
    throw new Error('Invalid UTC timestamp');
  return parsed;
}
function xlsxFileName(contentDisposition: string | null): string {
  // The current API exposes only its correlation header through CORS.
  // Match the retained Next viewer's safe name when this optional header is hidden.
  if (contentDisposition === null) return 'error-logs.xlsx';
  const parameters = contentDispositionParameters(contentDisposition);
  const extended = parameters.get('filename*');
  const fallback = parameters.get('filename');
  const fileName =
    extended === undefined ? parseFileName(fallback) : parseExtendedFileName(extended);
  if (!fileName) throw new Error('Invalid system error log XLSX filename');
  return fileName;
}
function contentDispositionParameters(value: string | null): ReadonlyMap<string, string> {
  if (value === null) throw new Error('Invalid system error log XLSX filename');
  const parts = splitHeaderParameters(value);
  const disposition = parts[0];
  if (disposition === undefined || disposition.trim().toLowerCase() !== 'attachment')
    throw new Error('Invalid system error log XLSX filename');
  const parameters = new Map<string, string>();
  for (const part of parts.slice(1)) {
    const separator = part.indexOf('=');
    if (separator < 1) throw new Error('Invalid system error log XLSX filename');
    const name = part.slice(0, separator).trim().toLowerCase();
    const parameter = part.slice(separator + 1).trim();
    if (!name || !parameter || parameters.has(name))
      throw new Error('Invalid system error log XLSX filename');
    parameters.set(name, parameter);
  }
  return parameters;
}
function splitHeaderParameters(value: string): readonly string[] {
  const parts: string[] = [];
  let current = '';
  let quoted = false;
  let escaped = false;
  for (const character of value) {
    if (character < ' ' || character === '\u007f')
      throw new Error('Invalid system error log XLSX filename');
    if (escaped) {
      current += character;
      escaped = false;
    } else if (quoted && character === '\\') {
      current += character;
      escaped = true;
    } else if (character === '"') {
      current += character;
      quoted = !quoted;
    } else if (character === ';' && !quoted) {
      parts.push(current);
      current = '';
    } else current += character;
  }
  if (quoted || escaped) throw new Error('Invalid system error log XLSX filename');
  parts.push(current);
  return parts;
}
function parseExtendedFileName(value: string): string {
  const match = /^utf-8''([A-Za-z0-9!#$&+.^_`|~%-]*)$/i.exec(value);
  if (!match?.[1]) throw new Error('Invalid system error log XLSX filename');
  try {
    return safeXlsxFileName(decodeURIComponent(match[1]));
  } catch {
    throw new Error('Invalid system error log XLSX filename');
  }
}
function parseFileName(value: string | undefined): string | null {
  if (value === undefined) return null;
  return safeXlsxFileName(unquote(value));
}
function unquote(value: string): string {
  if (!value.startsWith('"')) return value;
  if (!value.endsWith('"') || value.length < 2)
    throw new Error('Invalid system error log XLSX filename');
  let result = '';
  let escaped = false;
  for (const character of value.slice(1, -1)) {
    if (escaped) {
      result += character;
      escaped = false;
    } else if (character === '\\') escaped = true;
    else if (character === '"') throw new Error('Invalid system error log XLSX filename');
    else result += character;
  }
  if (escaped) throw new Error('Invalid system error log XLSX filename');
  return result;
}
function safeXlsxFileName(value: string): string {
  if (
    value.length === 0 ||
    value.length > 120 ||
    !/\.xlsx$/i.test(value) ||
    /[<>:"/\\|?*]/.test(value) ||
    hasControlCharacter(value)
  )
    throw new Error('Invalid system error log XLSX filename');
  return value;
}
function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}
function source(value: unknown): ErrorLogSource {
  if (value === 'api' || value === 'job' || value === 'web' || value === 'mobile') return value;
  throw new Error('Invalid source');
}
function severity(value: unknown): ErrorLogSeverity {
  if (value === 'warning' || value === 'error') return value;
  throw new Error('Invalid severity');
}
function optionalSource(value: unknown): ErrorLogSource | undefined {
  return value === undefined ? undefined : source(value);
}
function optionalUtc(value: unknown): string | undefined {
  return value === undefined ? undefined : utc(value);
}
function positiveSafeInteger(value: unknown, maximum: number, name: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > maximum)
    throw new Error(`Invalid ${name}`);
  return value;
}
function nonNegativeSafeInteger(value: unknown, name: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0)
    throw new Error(`Invalid ${name}`);
  return value;
}
function nullableNonNegativeSafeInteger(value: unknown, name: string): number | null {
  return value === null ? null : nonNegativeSafeInteger(value, name);
}
function optionalInteger(
  value: unknown,
  minimum: number,
  maximum: number,
  name: string,
): number | undefined {
  if (value === undefined) return undefined;
  const parsed = positiveSafeInteger(value, maximum, name);
  if (parsed < minimum) throw new Error(`Invalid ${name}`);
  return parsed;
}
function nullableInteger(
  value: unknown,
  minimum: number,
  maximum: number,
  name: string,
): number | null {
  if (value === null) return null;
  const parsed = positiveSafeInteger(value, maximum, name);
  if (parsed < minimum) throw new Error(`Invalid ${name}`);
  return parsed;
}
