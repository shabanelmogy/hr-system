import { z } from 'zod';

import type {
  RealtimeEntityChanged,
  RealtimeNotification,
} from '../../domain/models/realtime-event';

const realtimeEntityChangedSchema: z.ZodType<RealtimeEntityChanged> = z.object({
  eventId: z.string().uuid(),
  occurredAtUtc: z.string().datetime(),
  resource: z.string().trim().min(1).max(100),
  action: z.string().trim().min(1).max(50),
  entityId: z.string().nullable(),
});

const realtimeNotificationSchema: z.ZodType<RealtimeNotification> = z.object({
  id: z.number().int().positive(),
  actorUserId: z.string().nullable().optional(),
});

export function parseRealtimeEntityChanged(value: unknown): RealtimeEntityChanged | null {
  const result = realtimeEntityChangedSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseRealtimeNotification(value: unknown): RealtimeNotification | null {
  const result = realtimeNotificationSchema.safeParse(value);
  return result.success ? result.data : null;
}
