import { getNextMockSample } from "@/shared/utils/mockData";
import type {
  AccountHierarchyLevel,
  AccountLookup,
  AccountMutationRequest,
  AccountHierarchyLevelMutationRequest,
} from "../types/coaHierarchy";

const accountSamples = [
  { nameEn: "Cash and Cash Equivalents", nameAr: "النقدية وما في حكمها" },
  { nameEn: "Trade Receivables", nameAr: "الذمم التجارية المدينة" },
  { nameEn: "Operating Revenue", nameAr: "الإيرادات التشغيلية" },
] as const;

const hierarchyLevelSamples = [
  { nameEn: "Statement Group", nameAr: "مجموعة القوائم", canPost: false },
  { nameEn: "Account Group", nameAr: "مجموعة الحسابات", canPost: false },
  { nameEn: "Posting Account", nameAr: "حساب الترحيل", canPost: true },
] as const;

export interface AccountMockContext {
  proposalCode?: string | null;
  hierarchyLevels: readonly AccountHierarchyLevel[];
  parentAccounts: readonly AccountLookup[];
  currencies: readonly { id: number }[];
  preferredParentAccountId?: number | null;
  excludedAccountId?: number | null;
  currentAllowPosting?: boolean;
  usedSampleIndexes?: Set<number>;
  random?: () => number;
}

/**
 * Creates a valid local account draft. It deliberately requires the server's
 * proposed code and never invents identity, scope or concurrency metadata.
 */
export function createAccountMockDraft({
  proposalCode,
  hierarchyLevels,
  parentAccounts,
  currencies,
  preferredParentAccountId = null,
  excludedAccountId = null,
  currentAllowPosting,
  usedSampleIndexes = new Set<number>(),
  random,
}: AccountMockContext): AccountMutationRequest | null {
  const code = proposalCode?.trim();
  const level = hierarchyLevels.find((candidate) => !candidate.isDeleted);
  if (!code || !level) return null;

  const sample = getNextMockSample(accountSamples, usedSampleIndexes, random);
  const parent = preferredParentAccountId
    ? parentAccounts.find(
        (candidate) =>
          candidate.id === preferredParentAccountId &&
          candidate.id !== excludedAccountId &&
          !candidate.allowPosting,
      )
    : undefined;
  const currency = currencies.find((candidate) => candidate.id > 0);
  const allowPosting = level.canPost && (currentAllowPosting ?? true);

  return {
    code,
    nameAr: sample.nameAr,
    nameEn: sample.nameEn,
    accountHierarchyLevelId: level.id,
    parentAccountId: parent?.id ?? null,
    allowPosting,
    manualPostingPolicy: allowPosting ? 1 : 2,
    currencyPolicy: currency ? 3 : 1,
    specificCurrencyId: currency?.id ?? null,
  };
}

export interface HierarchyLevelMockContext {
  levels: readonly AccountHierarchyLevel[];
  usedSampleIndexes?: Set<number>;
  random?: () => number;
}

/** Creates the next unused positive hierarchy-level draft from all loaded states. */
export function createHierarchyLevelMockDraft({
  levels,
  usedSampleIndexes = new Set<number>(),
  random,
}: HierarchyLevelMockContext): AccountHierarchyLevelMutationRequest {
  const usedNumbers = new Set(
    levels
      .map((level) => level.levelNumber)
      .filter((number) => Number.isInteger(number) && number > 0),
  );
  let levelNumber = 1;
  while (usedNumbers.has(levelNumber)) levelNumber += 1;

  const sample = getNextMockSample(
    hierarchyLevelSamples,
    usedSampleIndexes,
    random,
  );
  return { levelNumber, ...sample };
}
