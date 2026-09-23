import { z } from 'zod';

import type {
  CrystalReportListItem,
  CrystalReportRenderRequest,
} from '../../domain/models/crystal-report';

const crystalReportListItemShape = {
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
};

export const crystalReportListItemSchema: z.ZodType<CrystalReportListItem> = z.object({
  id: z.string().uuid(),
  ...crystalReportListItemShape,
});

export const globalCrystalReportListItemSchema: z.ZodType<CrystalReportListItem> = z.object({
  id: z.string().min(1),
  ...crystalReportListItemShape,
});

export const publishedCrystalReportsSchema = z.array(crystalReportListItemSchema);
export const globalCrystalReportsSchema = z.array(globalCrystalReportListItemSchema);

export const crystalReportRenderRequestSchema: z.ZodType<CrystalReportRenderRequest> = z.object({
  language: z.enum(['ar', 'en']),
  filters: z.record(z.string(), z.string().nullable()).optional(),
});
