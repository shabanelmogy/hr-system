import type { TFunction } from "i18next";
import type { AuditAction } from "../types/auditTrail";

/** "JobDescription" -> "Job Description", "NameEn" -> "Name En". */
export function humanizeIdentifier(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();
}

export function formatAuditDate(value: string, language: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language.startsWith("ar") ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function moduleLabel(t: TFunction, moduleCode: string): string {
  return t(`auditLog.modules.${moduleCode}`, { defaultValue: humanizeIdentifier(moduleCode) });
}

export function entityLabel(t: TFunction, entityName: string): string {
  return t(`auditLog.entities.${entityName}`, { defaultValue: humanizeIdentifier(entityName) });
}

export function fieldLabel(t: TFunction, field: string): string {
  return t(`auditLog.fields.${field}`, { defaultValue: humanizeIdentifier(field) });
}

export function actionLabel(t: TFunction, action: AuditAction): string {
  return t(`auditLog.actions.${action}`, { defaultValue: action });
}

export const actionColors: Record<AuditAction, "success" | "info" | "error" | "warning"> = {
  Created: "success",
  Modified: "info",
  Deleted: "error",
  Restored: "warning",
};
