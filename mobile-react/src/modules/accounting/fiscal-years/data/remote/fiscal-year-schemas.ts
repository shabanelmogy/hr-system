import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { FiscalYear, FiscalYearContext, FiscalYearDetail, FiscalYearLookup } from '../../domain/models/fiscal-year';

const period = z.object({ id: z.number().int().nonnegative(), sequence: z.number().int().positive(), code: z.string(), nameAr: z.string(), nameEn: z.string(), startDate: z.string(), endDate: z.string(), status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) });
const fiscalYearObjectSchema = z.object({ id: z.number().int().positive(), code: z.string(), nameAr: z.string(), nameEn: z.string(), startDate: z.string(), endDate: z.string(), periodFrequency: z.union([z.literal(1), z.literal(2)]), status: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]), isCurrent: z.boolean(), periodsCount: z.number().int().nonnegative(), createdOn: z.string(), updatedOn: z.string().nullable(), isDeleted: z.boolean(), rowVersion: z.string().min(1) });
export const fiscalYearSchema: z.ZodType<FiscalYear> = fiscalYearObjectSchema;
export const fiscalYearDetailSchema: z.ZodType<FiscalYearDetail> = fiscalYearObjectSchema.omit({ periodsCount: true }).extend({ periods: z.array(period) });
const fiscalYearLookupItemSchema: z.ZodType<FiscalYearLookup> = fiscalYearObjectSchema.pick({ id: true, code: true, nameAr: true, nameEn: true, startDate: true, endDate: true, status: true, isCurrent: true });
export const fiscalYearLookupSchema: z.ZodType<FiscalYearLookup[]> = z.array(fiscalYearLookupItemSchema);
export const fiscalYearContextSchema: z.ZodType<FiscalYearContext> = z.object({ companyCurrentFiscalYear: fiscalYearLookupItemSchema.nullable(), selectedFiscalYear: fiscalYearLookupItemSchema.nullable(), hasUserOverride: z.boolean(), availableFiscalYears: z.array(fiscalYearLookupItemSchema) });
export const fiscalYearPageSchema = z.object({ items: z.array(fiscalYearSchema), metaData: pageMetadataSchema });
