import { z } from 'zod';

import { auditActions } from '../../domain/models/audit-trail';

const optionalText = z.string().nullish().transform((value) => (value ? value : null));

export const auditTrailItemSchema = z.object({
  moduleCode: z.string(),
  id: z.coerce.number(),
  entityName: z.string().default(''),
  entityKey: z.string().default(''),
  entityDisplay: optionalText,
  action: z.enum(auditActions).catch('Modified'),
  userId: optionalText,
  userName: optionalText,
  occurredOn: z.string().min(1),
  correlationId: optionalText,
  changeCount: z.number().default(0),
});

export const auditTrailPageSchema = z.object({
  items: z.array(auditTrailItemSchema),
  nextCursor: optionalText,
});

export const auditFieldChangeSchema = z.object({
  field: z.string(),
  oldValue: optionalText,
  newValue: optionalText,
});

export const auditTrailDetailsSchema = z.object({
  entry: auditTrailItemSchema,
  changes: z.array(auditFieldChangeSchema).default([]),
});

export const auditTrailFiltersSchema = z.object({
  modules: z.array(z.object({
    moduleCode: z.string(),
    entityNames: z.array(z.string()).default([]),
  })).default([]),
});
