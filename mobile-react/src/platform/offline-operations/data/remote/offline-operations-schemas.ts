import { z } from 'zod';

export const offlineOperationModeSchema = z.enum([
  'online-only',
  'offline-read',
  'offline-draft',
  'offline-command',
]);

export const offlineOperationsPolicyResponseSchema = z.object({
  version: z.number().int().positive(),
  tenantId: z.string().min(1),
  companyId: z.number().int().positive(),
  modes: z.record(z.string(), offlineOperationModeSchema),
  capabilities: z.array(z.object({
    id: z.string().min(1),
    supportedModes: z.array(offlineOperationModeSchema),
  })),
  rowVersion: z.string().min(1).nullable(),
  updatedOn: z.string().nullable(),
  updatedByUserId: z.string().nullable(),
});
