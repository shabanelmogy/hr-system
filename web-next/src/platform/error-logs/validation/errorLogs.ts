import { z } from "zod";

export const errorLogRowSchema = z.object({
  // The API returns .NET GUIDs, including stable hash-derived capture IDs.
  id: z.guid(),
  occurredOnUtc: z.iso.datetime({ offset: true }),
  source: z.enum(["api", "job", "web", "mobile"]),
  severity: z.enum(["warning", "error"]),
  userName: z.string().nullable(),
  service: z.string().nullable(),
  action: z.string().nullable(),
  statusCode: z.number().int().nullable(),
  durationMs: z.number().int().nullable(),
  correlationId: z.string().nullable(),
  summary: z.string(),
  client: z.string().nullable(),
  browser: z.string().nullable(),
  ipAddress: z.string().nullable(),
});
export const errorLogPageSchema = z.object({
  items: z.array(errorLogRowSchema),
  totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});
export const errorLogDetailSchema = z.object({
  entry: errorLogRowSchema,
  diagnostics: z.array(z.string()),
});
export const errorLogSettingsSchema = z.object({
  retentionDays: z.number().int().min(1).max(3650),
  revision: z.number().int().nonnegative(),
  queueDepth: z.number().int().nonnegative(),
  droppedCount: z.number().int().nonnegative(),
  failedWrites: z.number().int().nonnegative(),
});
export const retentionFormSchema = (required: string, range: string) => z.object({
  retentionDays: z.string().trim().min(1, required).refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 3650,
    range,
  ),
});
export type RetentionFormValues = z.infer<ReturnType<typeof retentionFormSchema>>;
