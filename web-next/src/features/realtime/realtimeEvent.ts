import { z } from "zod";

const realtimeEntityChangedSchema = z.object({
  eventId: z.string().uuid(),
  occurredAtUtc: z.string().datetime(),
  resource: z.string().trim().min(1).max(100),
  action: z.string().trim().min(1).max(50),
  entityId: z.string().nullable(),
});

export type RealtimeEntityChanged = z.infer<typeof realtimeEntityChangedSchema>;

export function parseRealtimeEntityChanged(
  value: unknown,
): RealtimeEntityChanged | null {
  const result = realtimeEntityChangedSchema.safeParse(value);
  return result.success ? result.data : null;
}
