import { dateOnlyToLocal } from '../../../shared/ui/public-api';
import type { AuditAction, AuditCriteria } from './audit-trail';

export interface AuditFilters {
  readonly moduleCode: string;
  readonly entityName: string;
  readonly action: AuditAction | '';
  readonly from: string;
  readonly to: string;
}
export const emptyAuditFilters: AuditFilters = {
  moduleCode: '',
  entityName: '',
  action: '',
  from: '',
  to: '',
};
export type AuditCriteriaResult =
  | { readonly valid: true; readonly criteria: AuditCriteria }
  | { readonly valid: false; readonly issue: 'search' | 'range' };

export function changeAuditModule(filters: AuditFilters, moduleCode: string): AuditFilters {
  return { ...filters, moduleCode, entityName: '' };
}
export function auditCriteria(filters: AuditFilters, search: string): AuditCriteriaResult {
  if (search.length > 200) return { valid: false, issue: 'search' };
  const from = filters.from ? dateOnlyToLocal(filters.from) : null;
  const to = filters.to ? dateOnlyToLocal(filters.to) : null;
  if ((filters.from && !from) || (filters.to && !to) || (from && to && from > to))
    return { valid: false, issue: 'range' };
  // Use the browser's actual calendar day; DST days need not contain24hours.
  from?.setHours(0, 0, 0, 0);
  to?.setHours(23, 59, 59, 999);
  return {
    valid: true,
    criteria: {
      ...(filters.moduleCode ? { moduleCode: filters.moduleCode } : {}),
      ...(filters.entityName ? { entityName: filters.entityName } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(search.trim() ? { entityKey: search.trim() } : {}),
      ...(from ? { fromUtc: from.toISOString() } : {}),
      ...(to ? { toUtc: to.toISOString() } : {}),
    },
  };
}
