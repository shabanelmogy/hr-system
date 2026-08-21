import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { State, StateDetail, StateLookup, StateWithDistricts } from '../types/state';

const countrySchema = z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), isDeleted: z.boolean() });
const stateDetailObjectSchema = z.object({
  id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), code: z.string().min(1), countryId: z.number().int().positive(), country: countrySchema,
  createdOn: z.string().min(1), updatedOn: z.string().nullable(), isDeleted: z.boolean(),
});
export const stateSchema: z.ZodType<State> = stateDetailObjectSchema.extend({ districtsCount: z.number().int().nonnegative() });
export const stateDetailSchema: z.ZodType<StateDetail> = stateDetailObjectSchema;
export const stateWithDistrictsSchema: z.ZodType<StateWithDistricts> = stateDetailObjectSchema.extend({ districts: z.array(z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), code: z.string().min(1), isDeleted: z.boolean() })) });
export const stateLookupSchema: z.ZodType<StateLookup[]> = z.array(z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), code: z.string().min(1), countryId: z.number().int().positive() }));
export const statePageSchema = z.object({ items: z.array(stateSchema), metaData: pageMetadataSchema });
export const bulkArchiveStatesResultSchema = z.object({ archivedCount: z.number().int().nonnegative() });
