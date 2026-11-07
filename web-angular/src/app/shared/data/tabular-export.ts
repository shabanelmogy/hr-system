import { InjectionToken, type Signal } from '@angular/core';
import { fromEvent, firstValueFrom, takeUntil, throwIfEmpty, type Observable } from 'rxjs';

export type TabularFormat = 'xlsx' | 'csv';
export type TabularScalar = string | number | boolean | null;
export type TabularRecord = Readonly<Record<string, TabularScalar>>;
export interface TabularFile {
  readonly blob: Blob;
  readonly fileName: string;
}
export interface TabularFileRequest {
  readonly rows: readonly TabularRecord[];
  readonly format: TabularFormat;
  readonly fileName: string;
  readonly culture: 'en' | 'ar';
  readonly actor: object;
}
export interface TabularFileWriter {
  readonly actor: Signal<object | null>;
  readonly allowed: Signal<boolean>;
  write(request: TabularFileRequest, signal: AbortSignal): Promise<TabularFile>;
}
export const TABULAR_FILE_WRITER = new InjectionToken<TabularFileWriter>('ERP tabular file writer');
export interface TabularExportSource {
  readonly actor: object;
  readonly criteriaKey: string;
  readonly fileName: string;
  readonly culture: 'en' | 'ar';
  readonly load: (signal: AbortSignal) => Promise<readonly TabularRecord[]>;
}
export interface TabularColumn<T> {
  readonly key: string;
  readonly header: string;
  readonly value: (row: T) => TabularScalar | undefined;
  readonly exportable?: boolean;
}
export interface TabularSourceOptions<T> {
  readonly actor: object;
  readonly criteriaKey: string;
  readonly fileName: string;
  readonly culture: 'en' | 'ar';
  readonly columns: readonly TabularColumn<T>[];
  readonly isCurrent: () => boolean;
}
export function pagedTabularSource<T>(
  options: TabularSourceOptions<T> & {
    readonly read: (
      page: number,
      signal: AbortSignal,
    ) => Promise<{ readonly rows: readonly T[]; readonly total: number }>;
    readonly rowId: (row: T) => string | number;
    readonly maximumRows?: number;
  },
): TabularExportSource {
  return {
    actor: options.actor,
    criteriaKey: options.criteriaKey,
    fileName: options.fileName,
    culture: options.culture,
    load: async (signal) =>
      projectTabularRows(
        options.columns,
        await collectExportPages({
          signal,
          read: (page) => {
            if (!options.isCurrent())
              throw new DOMException('Export context changed', 'AbortError');
            return options.read(page, signal);
          },
          rowId: options.rowId,
          ...(options.maximumRows === undefined ? {} : { maximumRows: options.maximumRows }),
        }),
      ),
  };
}
export function localTabularSource<T>(
  options: TabularSourceOptions<T> & { readonly rows: readonly T[] },
): TabularExportSource {
  return {
    actor: options.actor,
    criteriaKey: options.criteriaKey,
    fileName: options.fileName,
    culture: options.culture,
    load: (signal) => {
      abortExport(signal);
      if (!options.isCurrent()) throw new DOMException('Export context changed', 'AbortError');
      return Promise.resolve(projectTabularRows(options.columns, options.rows));
    },
  };
}
export class TabularExportError extends Error {
  constructor(readonly reason: 'limit' | 'changed' | 'invalid') {
    super('Tabular export ' + reason);
  }
}
export const tabularExportLimits = Object.freeze({
  rows: 100000,
  columns: 200,
  cells: 2000000,
  bytes: 8 * 1024 * 1024,
});
export function validateTabularRecords(rows: readonly TabularRecord[]): void {
  if (!rows.length || rows.length > tabularExportLimits.rows) throw new TabularExportError('limit');
  const headers = new Map<string, string>();
  let bytes = 2;
  const encoder = new TextEncoder();
  for (const row of rows) {
    const keys = Object.keys(row);
    if (!keys.length) throw new TabularExportError('invalid');
    for (const key of keys) {
      const normalized = key.toLocaleLowerCase('en'),
        previous = headers.get(normalized);
      if (!key.trim() || key.length > 150 || (previous !== undefined && previous !== key))
        throw new TabularExportError('invalid');
      headers.set(normalized, key);
      const value = row[key];
      if (
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'boolean' &&
        typeof value !== 'number'
      )
        throw new TabularExportError('invalid');
      if (
        (typeof value === 'number' && !Number.isFinite(value)) ||
        (typeof value === 'string' && value.length > 32767)
      )
        throw new TabularExportError('invalid');
    }
    if (
      headers.size > tabularExportLimits.columns ||
      headers.size * rows.length > tabularExportLimits.cells
    )
      throw new TabularExportError('limit');
    bytes += encoder.encode(JSON.stringify(row)).byteLength + 1;
    if (bytes > tabularExportLimits.bytes) throw new TabularExportError('limit');
  }
}
export function abortExport(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Export cancelled', 'AbortError');
}
export function exportRead<T>(read: Observable<T>, signal: AbortSignal): Promise<T> {
  abortExport(signal);
  return firstValueFrom(
    read.pipe(
      takeUntil(fromEvent(signal, 'abort')),
      throwIfEmpty(() => new DOMException('Export cancelled', 'AbortError')),
    ),
  );
}
export function projectTabularRows<T>(
  columns: readonly TabularColumn<T>[],
  rows: readonly T[],
): readonly TabularRecord[] {
  const exported = columns.filter(
    (column) =>
      column.exportable !== false &&
      !['actions', 'details', 'selection'].includes(column.key) &&
      !column.key.startsWith('__'),
  );
  if (
    !exported.length ||
    exported.length > tabularExportLimits.columns ||
    rows.length > tabularExportLimits.rows ||
    rows.length * exported.length > tabularExportLimits.cells
  )
    throw new TabularExportError('limit');
  const used = new Set<string>();
  const labels = exported.map((column) => {
    const base = column.header.trim();
    if (!base || base.length > 140) throw new TabularExportError('invalid');
    let label = base,
      suffix = 1;
    while (used.has(label.toLocaleLowerCase('en'))) label = `${base} (${++suffix})`;
    used.add(label.toLocaleLowerCase('en'));
    return label;
  });
  const encoder = new TextEncoder();
  let bytes = 2;
  return rows.map((row) => {
    const record: TabularRecord = Object.fromEntries(
      exported.map((column, index) => {
        const value = column.value(row) ?? null;
        if (
          (typeof value === 'number' && !Number.isFinite(value)) ||
          (typeof value === 'string' && value.length > 32767) ||
          (value !== null && !['string', 'number', 'boolean'].includes(typeof value))
        )
          throw new TabularExportError('invalid');
        const label = labels[index];
        if (label === undefined) throw new TabularExportError('invalid');
        return [label, value];
      }),
    );
    bytes += encoder.encode(JSON.stringify(record)).byteLength + 1;
    if (bytes > tabularExportLimits.bytes) throw new TabularExportError('limit');
    return record;
  });
}
export async function collectExportPages<T>(options: {
  readonly signal: AbortSignal;
  readonly read: (page: number) => Promise<{ readonly rows: readonly T[]; readonly total: number }>;
  readonly rowId: (row: T) => string | number;
  readonly maximumRows?: number;
}): Promise<readonly T[]> {
  const rows: T[] = [],
    identities = new Set<string>();
  const maximum = Math.min(
    options.maximumRows ?? tabularExportLimits.rows,
    tabularExportLimits.rows,
  );
  let expected: number | null = null;
  for (let page = 1; page <= maximum + 1; page++) {
    abortExport(options.signal);
    const result = await options.read(page);
    abortExport(options.signal);
    if (!Number.isSafeInteger(result.total) || result.total < 0)
      throw new TabularExportError('invalid');
    if (result.total > maximum) throw new TabularExportError('limit');
    expected ??= result.total;
    if (result.total !== expected || (!result.rows.length && rows.length < expected))
      throw new TabularExportError('changed');
    appendExportRows(rows, result.rows, identities, options.rowId, maximum);
    if (rows.length > expected) throw new TabularExportError('changed');
    if (rows.length === expected) return rows;
  }
  throw new TabularExportError('limit');
}
export async function collectExportCursor<T>(options: {
  readonly signal: AbortSignal;
  readonly read: (
    cursor: string | null,
  ) => Promise<{ readonly rows: readonly T[]; readonly nextCursor: string | null }>;
  readonly rowId: (row: T) => string | number;
  readonly maximumRows?: number;
}): Promise<readonly T[]> {
  const rows: T[] = [],
    identities = new Set<string>(),
    cursors = new Set<string>();
  const maximum = Math.min(
    options.maximumRows ?? tabularExportLimits.rows,
    tabularExportLimits.rows,
  );
  let cursor: string | null = null;
  for (let page = 0; page <= maximum; page++) {
    abortExport(options.signal);
    const result = await options.read(cursor);
    abortExport(options.signal);
    appendExportRows(rows, result.rows, identities, options.rowId, maximum);
    if (result.nextCursor === null) return rows;
    if (!result.nextCursor || cursors.has(result.nextCursor))
      throw new TabularExportError('changed');
    cursors.add(result.nextCursor);
    cursor = result.nextCursor;
  }
  throw new TabularExportError('limit');
}

function appendExportRows<T>(
  target: T[],
  incoming: readonly T[],
  seen: Set<string>,
  rowId: (row: T) => string | number,
  maximum: number,
): void {
  if (target.length + incoming.length > maximum) throw new TabularExportError('limit');
  for (const row of incoming) {
    const id = rowId(row),
      key = JSON.stringify([typeof id, id]);
    if (
      (typeof id !== 'string' && typeof id !== 'number') ||
      (typeof id === 'number' && !Number.isFinite(id)) ||
      seen.has(key)
    )
      throw new TabularExportError('changed');
    seen.add(key);
    target.push(row);
  }
}
