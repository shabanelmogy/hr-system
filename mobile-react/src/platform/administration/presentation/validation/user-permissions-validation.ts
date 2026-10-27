import { z } from 'zod';

export const userPermissionsSchema = z.object({
  permissions: z.array(z.string().trim().min(3).max(200)).max(2000),
});
