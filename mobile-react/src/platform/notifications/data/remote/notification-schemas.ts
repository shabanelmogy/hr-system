import { z } from 'zod';

import { pageMetadataSchema } from '@/src/core/api';

const notificationSeveritySchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4),
  z.literal('Info'), z.literal('Success'), z.literal('Warning'), z.literal('Critical'),
]);

const notificationSchema = z.object({
  id: z.number().int().positive(),
  category: z.string(),
  eventType: z.string(),
  severity: notificationSeveritySchema,
  titleKey: z.string(),
  messageKey: z.string(),
  parameters: z.record(z.string(), z.string()),
  entityType: z.string().nullable(),
  entityId: z.string().nullable(),
  actionUrl: z.string().nullable(),
  actorUserId: z.string().nullable(),
  correlationId: z.string().uuid(),
  createdOn: z.string().min(1),
  readOn: z.string().nullable(),
  expiresOn: z.string().nullable(),
});

export const notificationPageSchema = z.object({
  items: z.array(notificationSchema),
  metaData: pageMetadataSchema,
});

export const unreadNotificationCountSchema = z.number().int().nonnegative();
