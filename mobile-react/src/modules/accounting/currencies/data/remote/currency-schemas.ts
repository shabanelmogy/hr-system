import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { Currency, CurrencyLookup } from '../../domain/models/currency';

const currencyObjectSchema = z.object({
  id: z.number().int().positive(),
  currencyCode: z.string().length(3),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  symbol: z.string().min(1),
  createdOn: z.string().min(1),
  updatedOn: z.string().nullable(),
  isDeleted: z.boolean(),
  rowVersion: z.string().min(1),
});

export const currencySchema: z.ZodType<Currency> = currencyObjectSchema;
export const currencyLookupSchema: z.ZodType<CurrencyLookup[]> = z.array(
  currencyObjectSchema.pick({ id: true, currencyCode: true, nameEn: true, nameAr: true, symbol: true }),
);
export const currencyPageSchema = z.object({ items: z.array(currencySchema), metaData: pageMetadataSchema });
