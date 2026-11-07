import * as z from 'zod/mini';
import { auditColumnFilterJson } from './audit-column-filters';

export const auditActions = ['Created', 'Modified', 'Deleted', 'Restored'] as const;
const action = z.enum(auditActions);
const identifier = z.string().check(
  z.minLength(1),
  z.maxLength(100),
  z.refine((value) => value.trim() === value),
);
const id = z.int().check(z.minimum(1), z.maximum(Number.MAX_SAFE_INTEGER));
const timestamp = z.iso.datetime({ offset: true });
const cursor = z.string().check(z.minLength(1), z.maxLength(400));
const item = z.object({
  moduleCode: identifier,
  id,
  entityName: z.string().check(z.minLength(1), z.maxLength(200)),
  entityKey: z.string(),
  entityDisplay: z.nullable(z.string()),
  action,
  userId: z.nullable(z.string()),
  userName: z.nullable(z.string()),
  occurredOn: timestamp,
  correlationId: z.nullable(z.string()),
  changeCount: z.int().check(z.minimum(0)),
});
const page = z.object({ items: z.array(item), nextCursor: z.nullable(cursor) });
const detail = z.object({
  entry: item,
  changes: z.array(
    z.object({
      field: z.string(),
      oldValue: z.nullable(z.string()),
      newValue: z.nullable(z.string()),
    }),
  ),
});
const filters = z.object({
  modules: z.array(
    z.object({ moduleCode: identifier, entityNames: z.array(z.string().check(z.minLength(1))) }),
  ),
});
const criteria = z.strictObject({
  columnFilters: z.optional(z.string().check(z.maxLength(16384))),
  moduleCode: z.optional(identifier),
  entityName: z.optional(z.string().check(z.minLength(1), z.maxLength(200))),
  entityKey: z.optional(z.string().check(z.minLength(1), z.maxLength(200))),
  action: z.optional(action),
  fromUtc: z.optional(timestamp),
  toUtc: z.optional(timestamp),
});

export type AuditAction = z.infer<typeof action>;
export type AuditItem = z.infer<typeof item>;
export type AuditPage = z.infer<typeof page>;
export type AuditDetails = z.infer<typeof detail>;
export type AuditModuleFilter = z.infer<typeof filters>['modules'][number];
export type AuditCriteria = z.infer<typeof criteria>;
export interface AuditIdentity {
  readonly moduleCode: string;
  readonly id: number;
}

export function auditKey(entry: AuditIdentity): string {
  return `${entry.moduleCode}:${entry.id}`;
}
export function parseAuditPage(value: unknown): AuditPage {
  const result = page.parse(value);
  if (result.items.length > 50 || new Set(result.items.map(auditKey)).size !== result.items.length)
    throw Error('Invalid audit collection identities or page size');
  return result;
}
export function parseAuditIdentity(value: AuditIdentity): AuditIdentity {
  return { moduleCode: identifier.parse(value.moduleCode), id: id.parse(value.id) };
}
export function parseAuditDetails(value: unknown, identity: AuditIdentity): AuditDetails {
  const result = detail.parse(value);
  if (auditKey(result.entry) !== auditKey(parseAuditIdentity(identity)))
    throw Error('Invalid audit detail identity');
  return result;
}
export function parseAuditFilters(value: unknown): readonly AuditModuleFilter[] {
  const result = filters.parse(value).modules;
  if (new Set(result.map((module) => module.moduleCode)).size !== result.length)
    throw Error('Invalid audit filter identities');
  return result;
}
export function auditParameters(input: AuditCriteria, next: string | null): Record<string, string> {
  const query = criteria.parse(input);
  auditColumnFilterJson(query.columnFilters);
  if (query.fromUtc && query.toUtc && Date.parse(query.fromUtc) > Date.parse(query.toUtc))
    throw Error('Invalid audit date range');
  const params: Record<string, string> = { pageSize: '50' };
  for (const [key, value] of Object.entries(query)) if (value !== undefined) params[key] = value;
  if (next !== null) params['cursor'] = cursor.parse(next);
  return params;
}
