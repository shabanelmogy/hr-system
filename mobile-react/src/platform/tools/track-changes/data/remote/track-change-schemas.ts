import { z } from 'zod';

export const trackChangeLogSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  changeLogId: z.union([z.string(), z.number()]),
  entityName: z.string().default(''),
  key: z.string().default(''),
  oldValue: z.string().default(''),
  newValue: z.string().default(''),
  changedBy: z.string().default(''),
  changedAt: z.string().min(1),
  changedByPc: z.string().default(''),
});
