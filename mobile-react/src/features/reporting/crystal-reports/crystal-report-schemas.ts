import { z } from 'zod';

export const crystalReportListItemSchema = z.object({
  id: z.string().uuid(),
  entityKey: z.string().min(1),
  reportKey: z.string().min(1),
  displayName: z.string().min(1),
  summaryTitle: z.string().nullable(),
  summarySubject: z.string().nullable(),
  description: z.string().nullable(),
  currentVersionNumber: z.number().int().nullable(),
  isPublished: z.boolean(),
  isArchived: z.boolean(),
  rowVersion: z.string().min(1),
  updatedOn: z.string().nullable(),
});

export type CrystalReportListItem = z.infer<typeof crystalReportListItemSchema>;

export const publishedCrystalReportsSchema = z.array(crystalReportListItemSchema);

export const crystalReportRenderRequestSchema = z.object({
  language: z.enum(['ar', 'en']),
  filters: z.record(z.string(), z.string().nullable()).optional(),
});

export type CrystalReportRenderRequest = z.infer<typeof crystalReportRenderRequestSchema>;
