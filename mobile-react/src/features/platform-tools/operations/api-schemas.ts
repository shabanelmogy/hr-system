import { z } from 'zod';

const healthStatusSchema = z.enum(['Healthy', 'Degraded', 'Unhealthy']);

export const healthCheckSchema = z.object({
  status: healthStatusSchema,
  totalDuration: z.string(),
  entries: z.record(z.string(), z.object({
    status: healthStatusSchema,
    duration: z.string(),
    description: z.string().nullable(),
  })),
});

export const backgroundJobDashboardSchema = z.object({
  servers: z.number().int().nonnegative(),
  queues: z.number().int().nonnegative(),
  enqueued: z.number().int().nonnegative(),
  scheduled: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  succeeded: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  generatedAt: z.string().min(1),
});
