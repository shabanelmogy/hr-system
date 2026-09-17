import { z } from "zod";
import type { RealtimeNotification } from "./types";

const notificationSchema = z.object({
  id: z.number().int().positive(),
  category: z.string(),
  eventType: z.string(),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  titleKey: z.string(),
  messageKey: z.string(),
  parameters: z.record(z.string(), z.string()),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  actionUrl: z.string().nullable(),
  correlationId: z.string(),
  createdOn: z.string(),
  actorUserId: z.string().nullable(),
});

export function parseRealtimeNotification(value: unknown): RealtimeNotification | null {
  const result = notificationSchema.safeParse(value);
  return result.success ? (result.data as RealtimeNotification) : null;
}
