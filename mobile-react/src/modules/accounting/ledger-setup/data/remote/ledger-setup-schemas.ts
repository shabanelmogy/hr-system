import { z } from 'zod';

export const ledgerSetupRecordSchema = z.object({
  id: z.number().int().positive().optional(),
  rowVersion: z.string().optional(),
  isDeleted: z.boolean().optional(),
}).passthrough();

export const ledgerSetupRecordListSchema = z.array(ledgerSetupRecordSchema);

export const resolveAccountPreviewSchema = z.object({
  status: z.number().int(),
  accountId: z.number().int().nullable(),
  candidates: z.array(z.object({
    ruleId: z.number().int(),
    ruleType: z.string(),
    accountId: z.number().int(),
    specificity: z.number().int(),
    priority: z.number().int(),
  })),
});
