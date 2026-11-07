import * as z from 'zod/mini';
const hash = z.string().check(z.regex(/^[0-9a-f]{64}$/));
const nullableText = z.nullable(z.string());
export const globalReportEntities = [
  'countries',
  'states',
  'districts',
  'system-error-logs',
] as const;
export type GlobalReportEntity = (typeof globalReportEntities)[number];
const reportSchema = z.object({
  id: hash,
  entityKey: z.enum(globalReportEntities),
  reportKey: z.string().check(z.minLength(1)),
  displayName: z.string().check(z.minLength(1)),
  summaryTitle: nullableText,
  summarySubject: nullableText,
  description: nullableText,
  currentVersionNumber: z.nullable(z.int().check(z.minimum(1))),
  isPublished: z.literal(true),
  isArchived: z.literal(false),
  rowVersion: hash,
  updatedOn: nullableText,
  canDownloadSource: z.optional(z.boolean()),
});
export type GlobalReport = z.infer<typeof reportSchema>;
export function parseGlobalReports(
  input: unknown,
  entity: GlobalReportEntity = 'countries',
): readonly GlobalReport[] {
  const values = z.array(reportSchema).check(z.maxLength(1000)).parse(input);
  if (values.some((report) => report.entityKey !== entity))
    throw new Error('Unexpected report entity');
  if (new Set(values.map((item) => item.id)).size !== values.length)
    throw new Error('Duplicate report identity');
  return values;
}
export const reportFilterLimit = 200;
export const reportFilterText = z.string().check(z.maxLength(reportFilterLimit));
const systemErrorLogReportCriteriaSchema = z.strictObject({
  fromUtc: z.optional(z.iso.datetime()),
  toUtc: z.optional(z.iso.datetime()),
  userName: z.optional(z.string().check(z.maxLength(100))),
  source: z.optional(z.enum(['api', 'job', 'web', 'mobile'])),
  statusCode: z.optional(z.int().check(z.minimum(400), z.maximum(599))),
  search: z.optional(z.string().check(z.maxLength(120))),
  columnFilters: z.optional(z.string().check(z.maxLength(16384))),
});
export type SystemErrorLogReportCriteria = z.infer<typeof systemErrorLogReportCriteriaSchema>;
export const reportFiltersSchema = z.strictObject({
  systemErrorLogs: z.optional(systemErrorLogReportCriteriaSchema),
  nameAr: reportFilterText,
  nameEn: reportFilterText,
  stateAr: z.optional(reportFilterText),
  stateEn: z.optional(reportFilterText),
});
export interface ReportFilters {
  readonly systemErrorLogs?: SystemErrorLogReportCriteria;
  readonly nameAr: string;
  readonly nameEn: string;
  readonly stateAr?: string;
  readonly stateEn?: string;
}
export interface ReportFilterForm {
  readonly nameAr: string;
  readonly nameEn: string;
  readonly stateAr: string;
  readonly stateEn: string;
}
export const emptyReportFilters: ReportFilters = Object.freeze({ nameAr: '', nameEn: '' });
export const emptyReportFilterForm: ReportFilterForm = Object.freeze({
  nameAr: '',
  nameEn: '',
  stateAr: '',
  stateEn: '',
});
export function emptyReportFiltersForEntity(_entity: GlobalReportEntity): ReportFilters {
  return _entity === 'districts' ? { ...emptyReportFilterForm } : { ...emptyReportFilters };
}
export function parseReportFilters(entity: GlobalReportEntity, input: unknown): ReportFilters {
  const values = reportFiltersSchema.parse(input);
  if (entity === 'system-error-logs') {
    const criteria = values.systemErrorLogs ?? {};
    if (criteria.fromUtc && criteria.toUtc && criteria.fromUtc > criteria.toUtc)
      throw new Error('Invalid report date range');
    return { nameAr: '', nameEn: '', systemErrorLogs: criteria };
  }
  return entity === 'districts'
    ? {
        nameAr: values.nameAr,
        nameEn: values.nameEn,
        stateAr: values.stateAr ?? '',
        stateEn: values.stateEn ?? '',
      }
    : { nameAr: values.nameAr, nameEn: values.nameEn };
}
export function renderBody(report: GlobalReport, filters: unknown, language: 'en' | 'ar') {
  reportSchema.parse(report);
  z.enum(['en', 'ar']).parse(language);
  const values = parseReportFilters(report.entityKey, filters),
    wire: Record<string, string> = {};
  if (report.entityKey === 'system-error-logs') {
    const keys = {
      fromUtc: 'FromUtc',
      toUtc: 'ToUtc',
      userName: 'UserName',
      source: 'Source',
      statusCode: 'StatusCode',
      search: 'Search',
      columnFilters: 'ColumnFilters',
    } as const;
    for (const [key, value] of Object.entries(values.systemErrorLogs ?? {})) {
      if (value !== undefined && value !== '') wire[keys[key as keyof typeof keys]] = String(value);
    }
  }
  if (values.nameAr !== '') wire['NameAr'] = values.nameAr;
  if (values.nameEn !== '') wire['NameEn'] = values.nameEn;
  if (report.entityKey === 'districts') {
    const stateAr = values.stateAr ?? '',
      stateEn = values.stateEn ?? '';
    if (stateAr !== '') wire['StateAr'] = stateAr;
    if (stateEn !== '') wire['StateEn'] = stateEn;
  }
  return {
    entityKey: report.entityKey,
    expectedSha256: report.rowVersion,
    language,
    filters: wire,
  };
}
export function globalReportAllowed(
  user: {
    readonly roles: readonly string[];
    readonly permissions: readonly string[];
    readonly tenantId?: string | null;
    readonly companyId?: number | null;
  } | null,
  entity: GlobalReportEntity = 'countries',
): boolean {
  if (entity === 'system-error-logs')
    return (
      !!user &&
      user.roles.some((role) => role.toLowerCase() === 'super_admin') &&
      user.permissions.includes('GlobalCrystalReports:View') &&
      user.permissions.includes('SystemErrorLogs:View')
    );
  return (
    !!user &&
    ((user.roles.some((role) => role.toLowerCase() === 'super_admin') &&
      user.permissions.includes('GlobalCrystalReports:View')) ||
      (!user.roles.some((role) => role.toLowerCase() === 'super_admin') &&
        !!user.tenantId &&
        (user.companyId ?? 0) > 0 &&
        user.permissions.includes('CrystalReports:View') &&
        user.permissions.includes(
          { countries: 'Countries:View', states: 'States:View', districts: 'Districts:View' }[
            entity
          ],
        )))
  );
}
export class GlobalReportFailure extends Error {
  constructor(
    readonly kind: 'forbidden' | 'stale' | 'validation' | 'template' | 'invalidPdf' | 'error',
    readonly fields: Readonly<Record<string, string>> = {},
    readonly publicMessage = '',
  ) {
    super(kind);
  }
}
