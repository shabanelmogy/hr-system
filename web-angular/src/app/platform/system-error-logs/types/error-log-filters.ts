import type { ErrorLogCriteria, ErrorLogSource } from './error-log';
import { isDateOnly } from '../../../shared/ui/public-api';

export interface ErrorLogFilters {
  readonly from: string;
  readonly to: string;
  readonly userName: string;
  readonly source: '' | ErrorLogSource;
  readonly statusCode: '' | number;
}
export const emptyErrorLogFilters: ErrorLogFilters = {
  from: '',
  to: '',
  userName: '',
  source: '',
  statusCode: '',
};
export type ErrorLogCriteriaResolution =
  | { readonly valid: true; readonly criteria: ErrorLogCriteria }
  | { readonly valid: false; readonly issue: 'range' | 'criteria' };

const pageSizes = new Set([10, 25, 50, 100]);
export function resolveErrorLogCriteria(
  filters: ErrorLogFilters,
  search: string,
  page = 1,
  pageSize = 25,
): ErrorLogCriteriaResolution {
  if (!Number.isSafeInteger(page) || page < 1 || page > 100000 || !pageSizes.has(pageSize))
    return { valid: false, issue: 'criteria' };
  if (filters.userName.length > 100 || search.trim().length > 120)
    return { valid: false, issue: 'criteria' };
  if (filters.source !== '' && !['api', 'job', 'web', 'mobile'].includes(filters.source))
    return { valid: false, issue: 'criteria' };
  if (
    filters.statusCode !== '' &&
    (!Number.isSafeInteger(filters.statusCode) ||
      filters.statusCode < 400 ||
      filters.statusCode > 599)
  )
    return { valid: false, issue: 'criteria' };
  const fromUtc = filters.from === '' ? undefined : utcDay(filters.from, false);
  const toUtc = filters.to === '' ? undefined : utcDay(filters.to, true);
  if ((filters.from !== '' && !fromUtc) || (filters.to !== '' && !toUtc))
    return { valid: false, issue: 'range' };
  if (fromUtc && toUtc && fromUtc > toUtc) return { valid: false, issue: 'range' };
  return {
    valid: true,
    criteria: {
      page,
      pageSize,
      ...(fromUtc ? { fromUtc } : {}),
      ...(toUtc ? { toUtc } : {}),
      ...(filters.userName ? { userName: filters.userName } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(filters.statusCode === '' ? {} : { statusCode: filters.statusCode }),
      ...(search.trim() ? { search: search.trim() } : {}),
    },
  };
}
function utcDay(value: string, end: boolean): string | null {
  if (!isDateOnly(value)) return null;
  return `${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`;
}
