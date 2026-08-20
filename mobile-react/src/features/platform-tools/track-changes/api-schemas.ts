import { z } from 'zod';

export const trackChangeLogSchema = z.object({
  changeLogId: z.string().min(1),
  entityName: z.string().min(1),
  key: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
  changedBy: z.string(),
  changedAt: z.string().min(1),
  changedByPc: z.string(),
});
