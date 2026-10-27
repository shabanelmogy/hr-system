import { z } from 'zod';

export const retentionSchema = (required: string, range: string) => z.object({
  retentionDays: z.string().trim().min(1, required).refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 3650,
    range,
  ),
});
export type RetentionValues = z.infer<ReturnType<typeof retentionSchema>>;
