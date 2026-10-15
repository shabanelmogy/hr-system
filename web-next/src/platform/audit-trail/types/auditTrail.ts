export const auditActions = ["Created", "Modified", "Deleted", "Restored"] as const;

export type AuditAction = (typeof auditActions)[number];

export interface AuditTrailItem {
  moduleCode: string;
  id: number;
  entityName: string;
  entityKey: string;
  entityDisplay: string | null;
  action: AuditAction;
  userId: string | null;
  userName: string | null;
  occurredOn: string;
  correlationId: string | null;
  changeCount: number;
}

export interface AuditTrailPage {
  items: AuditTrailItem[];
  nextCursor: string | null;
}

export interface AuditFieldChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface AuditTrailDetails {
  entry: AuditTrailItem;
  changes: AuditFieldChange[];
}

export interface AuditTrailModuleFilter {
  moduleCode: string;
  entityNames: string[];
}

export interface AuditTrailQuery {
  moduleCode?: string;
  entityName?: string;
  entityKey?: string;
  action?: AuditAction;
  userId?: string;
  fromUtc?: string;
  toUtc?: string;
  pageSize?: number;
}

/** Stable React key: ids are unique per module only. */
export const auditTrailItemKey = (item: Pick<AuditTrailItem, "moduleCode" | "id">) =>
  `${item.moduleCode}:${item.id}`;
