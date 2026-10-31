import * as z from 'zod/mini';
const hash = z.string().check(z.regex(/^[0-9a-f]{64}$/));
const nullableText = z.nullable(z.string());
const reportSchema = z.object({
  id: hash,
  entityKey: z.literal('countries'),
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
});
export type GlobalReport = z.infer<typeof reportSchema>;
export function parseGlobalReports(input: unknown): readonly GlobalReport[] {
  const values = z.array(reportSchema).check(z.maxLength(1000)).parse(input);
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
  return { entityKey: 'countries', expectedSha256: report.rowVersion, language, filters: wire };
}
export function globalReportAllowed(
  user: { readonly roles: readonly string[]; readonly permissions: readonly string[] } | null,
): boolean {
  return (
    !!user &&
    user.roles.some((role) => role.toLowerCase() === 'super_admin') &&
    user.permissions.includes('GlobalCrystalReports:View')
  );
}
export class GlobalReportFailure extends Error {
  constructor(
    readonly kind: 'forbidden' | 'stale' | 'validation' | 'invalidPdf' | 'error',
    readonly fields: Readonly<Record<string, string>> = {},
  ) {
    super(kind);
  }
}
