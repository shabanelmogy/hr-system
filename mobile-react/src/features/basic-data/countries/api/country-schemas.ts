import { z } from 'zod';

import { pageMetadataSchema } from '@/src/core/api';
import type { Country, CountryDetail, CountryWithStates } from '../types/country';

const nullableCode = z.string().nullable();

export const countrySchema: z.ZodType<Country> = z.object({
  id: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  alpha2Code: nullableCode,
  alpha3Code: nullableCode,
  phoneCode: nullableCode,
  currencyCode: nullableCode,
  statesCount: z.number().int().nonnegative(),
  createdOn: z.string().min(1),
  updatedOn: z.string().nullable(),
  isDeleted: z.boolean(),
});

const countryDetailObjectSchema = z.object({
  id: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  alpha2Code: nullableCode,
  alpha3Code: nullableCode,
  phoneCode: nullableCode,
  currencyCode: nullableCode,
  createdOn: z.string().min(1),
  updatedOn: z.string().nullable(),
  isDeleted: z.boolean(),
});

export const countryDetailSchema: z.ZodType<CountryDetail> = countryDetailObjectSchema;

export const countryWithStatesSchema: z.ZodType<CountryWithStates> = countryDetailObjectSchema.extend({
  states: z.array(z.object({
    id: z.number().int().positive(),
    nameAr: z.string().min(1),
    nameEn: z.string().min(1),
    isDeleted: z.boolean(),
  })),
});

export const countryPageSchema = z.object({
  items: z.array(countrySchema),
  metaData: pageMetadataSchema,
});

export const countryLookupSchema = z.array(z.object({
  id: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  isDeleted: z.boolean(),
}));

export const bulkArchiveResultSchema = z.object({
  archivedCount: z.number().int().nonnegative(),
});
export const bulkCreateResultSchema = z.object({ createdCount: z.number().int().nonnegative() });
