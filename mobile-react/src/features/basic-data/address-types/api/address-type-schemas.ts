import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { AddressType, AddressTypeDetail } from '../types/address-type';

export const addressTypeSchema: z.ZodType<AddressType> = z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), addressesCount: z.number().int().nonnegative(), createdOn: z.string().min(1), updatedOn: z.string().nullable(), isDeleted: z.boolean() });
export const addressTypeDetailSchema: z.ZodType<AddressTypeDetail> = z.object({ id: z.number().int().positive(), nameAr: z.string().min(1), nameEn: z.string().min(1), createdOn: z.string().min(1), updatedOn: z.string().nullable(), isDeleted: z.boolean() });
export const addressTypePageSchema = z.object({ items: z.array(addressTypeSchema), metaData: pageMetadataSchema });
export const bulkCreateAddressTypesSchema = z.object({ createdCount: z.number().int().nonnegative() });
export const bulkArchiveAddressTypesSchema = z.object({ archivedCount: z.number().int().nonnegative() });
