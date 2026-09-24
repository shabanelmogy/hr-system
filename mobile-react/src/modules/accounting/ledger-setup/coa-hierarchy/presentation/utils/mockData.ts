import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { CurrencyLookup } from '@/src/modules/accounting/currencies';
import type { AccountHierarchyLevel, AccountLookup, AccountRequest, AccountHierarchyLevelRequest } from '../../domain/models/coa-hierarchy';

const accountSamples = [
  { nameEn: 'Cash and Cash Equivalents', nameAr: 'النقدية وما في حكمها' },
  { nameEn: 'Trade Receivables', nameAr: 'الذمم التجارية المدينة' },
  { nameEn: 'Operating Revenue', nameAr: 'الإيرادات التشغيلية' },
] as const;

const hierarchyLevelSamples = [
  { nameEn: 'Statement Group', nameAr: 'مجموعة القوائم', canPost: false },
  { nameEn: 'Account Group', nameAr: 'مجموعة الحسابات', canPost: false },
  { nameEn: 'Posting Account', nameAr: 'حساب الترحيل', canPost: true },
] as const;

export interface AccountMockContext {
  proposal?: string | null;
  hierarchyLevels: readonly AccountHierarchyLevel[];
  accounts: readonly AccountLookup[];
  currencies: readonly CurrencyLookup[];
  preferredParentAccountId?: number | null;
  excludedAccountId?: number | null;
  currentAllowPosting?: boolean;
  usedSampleIndexes?: Set<number>;
  random?: () => number;
}

/** Builds a valid local draft from authoritative lookup values only. */
export function createAccountMockDraft({ proposal, hierarchyLevels, accounts, currencies, preferredParentAccountId = null, excludedAccountId = null, currentAllowPosting, usedSampleIndexes = new Set<number>(), random }: AccountMockContext): AccountRequest | null {
  const code = proposal?.trim();
  const level = hierarchyLevels.find(candidate => !candidate.isDeleted);
  if (!code || !level) return null;

  const sample = getNextMockSample(accountSamples, usedSampleIndexes, random);
  const parent = preferredParentAccountId
    ? accounts.find(candidate => candidate.id === preferredParentAccountId && candidate.id !== excludedAccountId && !candidate.allowPosting)
    : undefined;
  const currency = currencies.find(candidate => candidate.id > 0);
  const allowPosting = level.canPost && (currentAllowPosting ?? true);
  return {
    code,
    nameAr: sample.nameAr,
    nameEn: sample.nameEn,
    accountHierarchyLevelId: level.id,
    parentAccountId: parent?.id ?? 0,
    allowPosting,
    manualPostingPolicy: allowPosting ? 1 : 2,
    currencyPolicy: currency ? 3 : 1,
    specificCurrencyId: currency?.id ?? 0,
  };
}

export interface HierarchyLevelMockContext {
  levels: readonly AccountHierarchyLevel[];
  usedSampleIndexes?: Set<number>;
  random?: () => number;
}

/** Builds the next unused positive level number from all loaded states. */
export function createHierarchyLevelMockDraft({ levels, usedSampleIndexes = new Set<number>(), random }: HierarchyLevelMockContext): AccountHierarchyLevelRequest {
  const usedNumbers = new Set(levels.map(level => level.levelNumber).filter(number => Number.isInteger(number) && number > 0));
  let levelNumber = 1;
  while (usedNumbers.has(levelNumber)) levelNumber += 1;
  const sample = getNextMockSample(hierarchyLevelSamples, usedSampleIndexes, random);
  return { levelNumber, ...sample };
}
