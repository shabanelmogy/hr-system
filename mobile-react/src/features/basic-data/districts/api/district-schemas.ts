import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { District, DistrictDetail, DistrictLookup, DistrictWithAddresses } from '../types/district';

const stateSchema = z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), isDeleted: z.boolean() });
const districtDetailObjectSchema = z.object({
  id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), code: z.string().min(1), stateId: z.number().int().positive(), state: stateSchema,
  createdOn: z.string().min(1), updatedOn: z.string().nullable(), isDeleted: z.boolean(),
});
export const districtSchema: z.ZodType<District> = districtDetailObjectSchema.extend({ addressesCount: z.number().int().nonnegative() });
export const districtDetailSchema: z.ZodType<DistrictDetail> = districtDetailObjectSchema;
export const districtWithAddressesSchema: z.ZodType<DistrictWithAddresses> = districtDetailObjectSchema.extend({ addresses: z.array(z.object({ id: z.number().int().positive(), buildingNumber: z.string(), floor: z.string(), apartmentNumber: z.string(), postalCode: z.string(), isDefault: z.boolean(), isDeleted: z.boolean() })) });
export const districtLookupSchema: z.ZodType<DistrictLookup[]> = z.array(z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), code: z.string().min(1), stateId: z.number().int().positive() }));
export const districtPageSchema = z.object({ items: z.array(districtSchema), metaData: pageMetadataSchema });
export const bulkArchiveDistrictsResultSchema = z.object({ archivedCount: z.number().int().nonnegative() });
export const bulkCreateDistrictsResultSchema = z.object({ createdCount: z.number().int().nonnegative() });
