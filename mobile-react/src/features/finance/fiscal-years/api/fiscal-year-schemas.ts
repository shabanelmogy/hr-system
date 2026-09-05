import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';

const period = z.object({ id: z.number().int().nonnegative(), sequence: z.number().int().positive(), code: z.string(), nameAr: z.string(), nameEn: z.string(), startDate: z.string(), endDate: z.string(), status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) });
export const fiscalYearSchema = z.object({ id: z.number().int().positive(), code: z.string(), nameAr: z.string(), nameEn: z.string(), startDate: z.string(), endDate: z.string(), periodFrequency: z.union([z.literal(1), z.literal(2)]), status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]), periodsCount: z.number().int().nonnegative(), createdOn: z.string(), updatedOn: z.string().nullable(), isDeleted: z.boolean(), rowVersion: z.string().min(1) });
export const fiscalYearDetailSchema = fiscalYearSchema.omit({ periodsCount: true }).extend({ periods: z.array(period) });
export const fiscalYearPageSchema = z.object({ items: z.array(fiscalYearSchema), metaData: pageMetadataSchema });
