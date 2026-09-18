import { z } from "zod";

export const managementPageMetadataSchema = z.object({
  currentPage: z.number().int(),
  totalPages: z.number().int(),
  pageSize: z.number().int(),
  pageNumber: z.number().int(),
  totalCount: z.number().int(),
  hasPrev: z.boolean(),
  hasNext: z.boolean(),
});

export function createManagementPageResponseSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    metaData: managementPageMetadataSchema,
  });
}
