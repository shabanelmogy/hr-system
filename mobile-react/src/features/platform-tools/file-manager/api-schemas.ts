import { z } from 'zod';

export const storedFileSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1),
  storedFileName: z.string().min(1),
  contentType: z.string().min(1),
  fileExtension: z.string(),
  createdOn: z.string().min(1),
  createdByPc: z.string(),
  createdById: z.string().min(1),
  isDeleted: z.boolean(),
});
