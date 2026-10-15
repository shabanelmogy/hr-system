import type { TFunction } from 'i18next';

import type { AuditAction } from '../../domain/models/audit-trail';

/** "JobDescription" -> "Job Description", "NameEn" -> "Name En". */
export function humanizeIdentifier(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();
}

export const moduleLabel = (t: TFunction, moduleCode: string) =>
  t(`auditLog.modules.${moduleCode}`, { defaultValue: humanizeIdentifier(moduleCode) });

export const entityLabel = (t: TFunction, entityName: string) =>
  t(`auditLog.entities.${entityName}`, { defaultValue: humanizeIdentifier(entityName) });

export const fieldLabel = (t: TFunction, field: string) =>
  t(`auditLog.fields.${field}`, { defaultValue: humanizeIdentifier(field) });

export const actionLabel = (t: TFunction, action: AuditAction) =>
  t(`auditLog.actions.${action}`, { defaultValue: action });
