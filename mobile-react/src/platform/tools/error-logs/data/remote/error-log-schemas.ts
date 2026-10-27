import { z } from 'zod';

export const errorLogRowSchema = z.object({
  // Persisted capture IDs are .NET GUIDs and need not carry RFC UUID version bits.
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
  occurredOnUtc: z.string().datetime({ offset: true }),
  source: z.enum(['api', 'job', 'web', 'mobile']), severity: z.enum(['warning', 'error']),
  userName: z.string().nullable(), service: z.string().nullable(), action: z.string().nullable(),
  statusCode: z.number().int().nullable(), durationMs: z.number().int().nullable(),
  correlationId: z.string().nullable(), summary: z.string(), client: z.string().nullable(),
  browser: z.string().nullable(), ipAddress: z.string().nullable(),
});
export const errorLogPageSchema = z.object({
  items: z.array(errorLogRowSchema), totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(), pageSize: z.number().int().positive(),
});
export const errorLogDetailSchema = z.object({ entry: errorLogRowSchema, diagnostics: z.array(z.string()) });
export const errorLogSettingsSchema = z.object({
  retentionDays: z.number().int().min(1).max(3650), revision: z.number().int().nonnegative(),
  queueDepth: z.number().int().nonnegative(), droppedCount: z.number().int().nonnegative(),
  failedWrites: z.number().int().nonnegative(),
});
