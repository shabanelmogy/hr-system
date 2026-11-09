import { z } from 'zod';

export const globalTemplateEntities = [
  'countries',
  'states',
  'districts',
  'system-error-logs',
] as const;
export type GlobalTemplateEntity = (typeof globalTemplateEntities)[number];
export type GlobalTemplateAction =
  'View' | 'Create' | 'Upload' | 'Publish' | 'Download' | 'Archive' | 'ViewAccess' | 'EditAccess';
export const globalTemplateRights = ['Run', 'Download', 'Upload', 'Publish'] as const;
export type GlobalTemplateRight = (typeof globalTemplateRights)[number];
type Actor = { readonly roles: readonly string[]; readonly permissions: readonly string[] };
const editPermissions: Record<GlobalTemplateEntity, string> = {
  countries: 'Countries:Edit',
  states: 'States:Edit',
  districts: 'Districts:Edit',
  'system-error-logs': 'SystemErrorLogs:View',
};
export function globalTemplateAllowed(
  actor: Actor | null,
  entity: GlobalTemplateEntity,
  action: GlobalTemplateAction = 'View',
): boolean {
  if (entity === 'system-error-logs' && (action === 'ViewAccess' || action === 'EditAccess'))
    return false;
  return (
    !!actor &&
    actor.roles.some((role) => role.trim().toLowerCase() === 'super_admin') &&
    actor.permissions.includes('GlobalCrystalReports:View') &&
    actor.permissions.includes(
      action === 'ViewAccess'
        ? 'GlobalCrystalReportAccess:View'
        : action === 'EditAccess'
          ? 'GlobalCrystalReportAccess:Edit'
          : `GlobalCrystalReports:${action}`,
    ) &&
    actor.permissions.includes(editPermissions[entity])
  );
}
export function globalTemplateManagerAllowed(actor: Actor | null): boolean {
  return globalTemplateEntities.some((entity) => globalTemplateAllowed(actor, entity));
}
export const globalTemplateEntitySchema = z.object({
  entityKey: z.enum(globalTemplateEntities),
  scope: z.literal('global'),
  filters: z.array(z.string()),
  contractSchemaVersion: z.number().int().positive(),
  contractFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});
export const globalTemplateRowSchema = z.object({
  id: z.uuid(),
  entityKey: z.enum(globalTemplateEntities),
  reportKey: z.string().min(1).max(128),
  displayName: z.string().max(200),
  description: z.string().nullable(),
  updatedOn: z.string().nullable(),
  currentVersionNumber: z.number().int().positive().nullable(),
  isPublished: z.boolean(),
  isArchived: z.boolean(),
  rowVersion: z.string().min(1).max(100),
});
export const globalTemplateVersionSchema = z.object({
  id: z.uuid(),
  versionNumber: z.number().int().positive(),
  originalFileName: z.string().max(255),
  size: z.number().int().positive().max(10485760),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  summaryTitle: z.string().nullable(),
  summarySubject: z.string().nullable(),
  validationStatus: z.enum(['Pending', 'Valid', 'Invalid', 'NeedsRevalidation']),
  validationReason: z.string().nullable(),
  validationContractSchemaVersion: z.number().nullable(),
  validationContractFingerprint: z.string().nullable(),
  isContractCurrent: z.boolean().nullish(),
  isPublished: z.boolean(),
  createdOn: z.string(),
});
export const globalTemplateDetailSchema = globalTemplateRowSchema.extend({
  versions: z.array(globalTemplateVersionSchema),
  viewName: z.string().max(257).nullable().optional(),
  viewFingerprint: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .nullable()
    .optional(),
});
export const globalTemplateUploadTargetSchema = z.object({
  report: globalTemplateDetailSchema.nullable(),
  canReplace: z.boolean(),
});
export type GlobalTemplateUploadTarget = z.infer<typeof globalTemplateUploadTargetSchema>;
/** Consumer SourceId and version token; these are distinct from the raw RPT SHA-256. */
export type GlobalTemplateViewerSource = Pick<
  GlobalTemplateRow,
  'entityKey' | 'reportKey' | 'rowVersion'
> & { readonly id: string };
export const globalTemplatePageSchema = z.object({
  items: z.array(globalTemplateRowSchema),
  totalCount: z.number().int().nonnegative(),
});
export const globalTemplateInspectionSchema = z.object({
  isValid: z.boolean(),
  validationReason: z.string().nullable(),
  contractFingerprint: z.string().nullable(),
  contractSchemaVersion: z.number().nullable(),
  failure: z.union([z.number(), z.string()]),
});
export const globalTemplateCandidateSchema = z.object({
  sourceId: z.string().regex(/^[a-f0-9]{64}$/),
  entityKey: z.enum(globalTemplateEntities),
  fileName: z.string().max(255),
  sha256: z.string().regex(/^(?:[a-f0-9]{64})?$/),
  reportKey: z.string().max(128),
  displayName: z.string().max(200),
  subject: z.string().nullable(),
  size: z.number().int().nonnegative(),
  isImportable: z.boolean(),
  isImported: z.boolean().nullable(),
  validationReason: z.string().nullable(),
});
export const globalTemplateCandidatePageSchema = z.object({
  items: z.array(globalTemplateCandidateSchema),
  totalCount: z.number().int().nonnegative(),
});
const legacyCandidateSchema = globalTemplateCandidateSchema.extend({
  isImported: z
    .boolean()
    .optional()
    .transform((value) => value ?? null),
});

/** Compatibility for the already published, unpaged discovery response. */
export function parseGlobalTemplateCandidates(
  body: unknown,
  search: string,
  pageIndex: number,
  pageSize: number,
): z.infer<typeof globalTemplateCandidatePageSchema> {
  if (!Array.isArray(body)) return globalTemplateCandidatePageSchema.parse(body);
  const entries = z.array(legacyCandidateSchema).max(10000).parse(body);
  const term = search.trim().toLocaleLowerCase();
  const matching = entries.filter(
    (entry) =>
      !term ||
      [entry.displayName, entry.fileName, entry.subject, entry.reportKey].some((value) =>
        value?.toLocaleLowerCase().includes(term),
      ),
  );
  return {
    items: matching.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    totalCount: matching.length,
  };
}
export type GlobalTemplateRow = z.infer<typeof globalTemplateRowSchema>;
export type GlobalTemplateDetail = z.infer<typeof globalTemplateDetailSchema>;
export type GlobalTemplateVersion = z.infer<typeof globalTemplateVersionSchema>;
export function isGlobalTemplateVersionCurrent(
  version: GlobalTemplateVersion,
  fingerprint: string | undefined,
): boolean {
  return (
    !!fingerprint &&
    version.validationStatus === 'Valid' &&
    (version.isContractCurrent ?? version.validationContractFingerprint === fingerprint)
  );
}
export type GlobalTemplateContract = z.infer<typeof globalTemplateEntitySchema>;
export const globalTemplateDesignSourceSchema = z.object({
  bindingKind: z
    .optional(z.enum(['database-view', 'provider']))
    .transform((value) => value ?? 'database-view'),
  sourceKey: z.enum(globalTemplateEntities),
  moduleKey: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(64),
  scope: z.literal('global'),
  tableName: z.string().min(1).max(128),
  maxRows: z.number().int().positive(),
  columns: z
    .array(z.object({ name: z.string().min(1), type: z.string().min(1), nullable: z.boolean() }))
    .min(1)
    .max(256),
  filters: z.array(z.string()),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        required: z.boolean(),
        allowMultipleValues: z.boolean(),
        discreteOnly: z.boolean(),
        allowedValues: z.array(z.string()),
      }),
    )
    .max(100),
  contractSchemaVersion: z.number().int().positive(),
  contractFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
});
export type GlobalTemplateDesignSource = z.infer<typeof globalTemplateDesignSourceSchema>;
export const globalTemplateDatabaseViewSchema = z.object({
  viewName: z.string().min(1).max(257),
  isCompatible: z.boolean(),
  rejectionCode: z.enum(['SchemaBindingRequired', 'ContractMismatch']).nullable(),
});
export const globalTemplateDatabaseViewPageSchema = z.object({
  items: z.array(globalTemplateDatabaseViewSchema).max(50),
  totalCount: z.number().int().nonnegative(),
});
export type GlobalTemplateDatabaseView = z.infer<typeof globalTemplateDatabaseViewSchema>;
export interface GlobalTemplateDraftRequest {
  readonly viewName: string;
  readonly moduleKey: string;
  readonly sourceKey: GlobalTemplateEntity;
  readonly reportKey: string;
  readonly displayName: string;
  readonly description: string;
  readonly contractFingerprint: string;
}
export type GlobalTemplateCandidate = z.infer<typeof globalTemplateCandidateSchema>;
export const globalTemplateGrantSchema = z.object({
  roleId: z.string().min(1).max(450),
  roleName: z.string(),
  rights: z.array(z.enum(globalTemplateRights)),
});
export const globalTemplateAccessSchema = z.object({
  access: z.array(globalTemplateGrantSchema).max(100),
  allowedRights: z.array(z.enum(globalTemplateRights)),
  canView: z.boolean(),
  canEdit: z.boolean(),
  rowVersion: z.string().min(1).max(100),
});
export const globalTemplateRolePageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      tenantId: z.string().nullable(),
      tenantName: z.string().nullable(),
    }),
  ),
  totalCount: z.number().int().nonnegative(),
});
export type GlobalTemplateGrant = z.infer<typeof globalTemplateGrantSchema>;
export type GlobalTemplateRole = z.infer<typeof globalTemplateRolePageSchema>['items'][number];

export function globalTemplateFileError(value: unknown): 'required' | 'invalidFile' | null {
  if (!(value instanceof File)) return 'required';
  return value.size > 0 && value.size <= 10485760 && /^.+\.rpt$/i.test(value.name)
    ? null
    : 'invalidFile';
}
