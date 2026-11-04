import * as z from 'zod/mini';
const hash = z.string().check(z.regex(/^[0-9a-f]{64}$/));
const nullableText = z.nullable(z.string());
export const globalReportEntities = ['countries', 'states', 'districts'] as const;
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
export const reportFiltersSchema = z.strictObject({
  nameAr: reportFilterText,
  nameEn: reportFilterText,
});
export type ReportFilters = z.infer<typeof reportFiltersSchema>;
export const emptyReportFilters: ReportFilters = Object.freeze({ nameAr: '', nameEn: '' });
export function renderBody(report: GlobalReport, filters: unknown, language: 'en' | 'ar') {
  reportSchema.parse(report);
  z.enum(['en', 'ar']).parse(language);
  const values = reportFiltersSchema.parse(filters),
    wire: Record<string, string> = {};
  if (values.nameAr !== '') wire['NameAr'] = values.nameAr;
  if (values.nameEn !== '') wire['NameEn'] = values.nameEn;
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
