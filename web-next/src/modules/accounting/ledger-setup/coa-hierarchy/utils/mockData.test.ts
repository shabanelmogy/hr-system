import { describe, expect, it } from "vitest";
import type { AccountHierarchyLevel, AccountLookup } from "../types/coaHierarchy";
import { createAccountMockDraft, createHierarchyLevelMockDraft } from "./mockData";

const level = (overrides: Partial<AccountHierarchyLevel> = {}): AccountHierarchyLevel => ({
  id: 4,
  levelNumber: 1,
  nameAr: "مجموعة",
  nameEn: "Group",
  canPost: false,
  isDeleted: false,
  rowVersion: "AQ==",
  ...overrides,
});

const parent: AccountLookup = {
  id: 7,
  code: "1000",
  nameAr: "الأصول",
  nameEn: "Assets",
  allowPosting: false,
};

describe("accounting ledger setup mock drafts", () => {
  it("preserves the server proposal and never synthesizes an account code", () => {
    const draft = createAccountMockDraft({
      proposalCode: "1001",
      hierarchyLevels: [level({ id: 4, canPost: true })],
      parentAccounts: [parent],
      currencies: [{ id: 9 }],
      preferredParentAccountId: 7,
      random: () => 0,
    });

    expect(draft).toMatchObject({
      code: "1001",
      accountHierarchyLevelId: 4,
      parentAccountId: 7,
      allowPosting: true,
      currencyPolicy: 3,
      specificCurrencyId: 9,
    });
    expect(createAccountMockDraft({
      proposalCode: null,
      hierarchyLevels: [level()],
      parentAccounts: [],
      currencies: [],
    })).toBeNull();
  });

  it("uses only non-posting parents and real currencies", () => {
    const draft = createAccountMockDraft({
      proposalCode: "2000",
      hierarchyLevels: [level()],
      parentAccounts: [{ ...parent, id: 8, allowPosting: true }, parent],
      currencies: [],
      preferredParentAccountId: 7,
    });

    expect(draft).toMatchObject({ parentAccountId: 7, currencyPolicy: 1, specificCurrencyId: null });
  });

  it("does not invent a parent or select the edited account as its own parent", () => {
    const draft = createAccountMockDraft({
      proposalCode: "2001",
      hierarchyLevels: [level()],
      parentAccounts: [parent],
      currencies: [],
      preferredParentAccountId: 7,
      excludedAccountId: 7,
    });

    expect(draft?.parentAccountId).toBeNull();
  });

  it("makes posting policy follow the selected hierarchy level", () => {
    const draft = createAccountMockDraft({
      proposalCode: "3000",
      hierarchyLevels: [level({ canPost: false })],
      parentAccounts: [],
      currencies: [],
    });

    expect(draft?.allowPosting).toBe(false);
  });

  it("chooses the next unused positive hierarchy level and bilingual values", () => {
    const draft = createHierarchyLevelMockDraft({
      levels: [
        level({ levelNumber: 1 }),
        level({ id: 5, levelNumber: 2, isDeleted: true }),
        level({ id: 6, levelNumber: 4 }),
      ],
      random: () => 0,
    });

    expect(draft).toEqual({
      levelNumber: 3,
      nameEn: "Statement Group",
      nameAr: "مجموعة القوائم",
      canPost: false,
    });
  });

  it("starts with level one when the company has no hierarchy levels", () => {
    expect(createHierarchyLevelMockDraft({ levels: [], random: () => 0 }).levelNumber).toBe(1);
  });
});
