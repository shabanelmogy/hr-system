import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { Account, AccountHierarchyLevel, AccountLookup, ProposedAccountCode } from '../../domain/models/coa-hierarchy';

const enum123 = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const accountSchema: z.ZodType<Account> = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  accountHierarchyLevelId: z.number().int().positive(),
  parentAccountId: z.number().int().positive().nullable(),
  allowPosting: z.boolean(),
  manualPostingPolicy: enum123,
  currencyPolicy: enum123,
  specificCurrencyId: z.number().int().positive().nullable(),
  isDeleted: z.boolean(),
  createdOn: z.string().min(1),
  updatedOn: z.string().min(1).nullable(),
  rowVersion: z.string().min(1),
});

export const accountLookupSchema: z.ZodType<AccountLookup[]> = z.array(z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  allowPosting: z.boolean(),
}));

export interface AccountTreeTransport {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
  children: AccountTreeTransport[];
}

export const accountTreeNodeSchema: z.ZodType<AccountTreeTransport> = z.lazy(() => z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  allowPosting: z.boolean(),
  children: z.array(accountTreeNodeSchema),
}));

export const accountTreeSchema = z.array(accountTreeNodeSchema);
export const proposedAccountCodeSchema: z.ZodType<ProposedAccountCode> = z.object({ code: z.string().min(1) });
export const accountPageSchema = z.object({ items: z.array(accountSchema), metaData: pageMetadataSchema });

export const accountHierarchyLevelSchema: z.ZodType<AccountHierarchyLevel> = z.object({
  id: z.number().int().positive(),
  levelNumber: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  canPost: z.boolean(),
  isDeleted: z.boolean(),
  rowVersion: z.string().min(1),
});

export const accountHierarchyLevelListSchema = z.array(accountHierarchyLevelSchema);
