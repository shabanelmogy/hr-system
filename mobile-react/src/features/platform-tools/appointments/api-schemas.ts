import { z } from 'zod';

export const appointmentSchema = z.object({
  id: z.number().int().positive(),
  start: z.string().min(1),
  end: z.string().min(1),
  text: z.string(),
  isAllDay: z.boolean(),
});
