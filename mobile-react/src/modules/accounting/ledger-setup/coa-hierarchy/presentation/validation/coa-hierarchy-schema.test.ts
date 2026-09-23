import { createAccountFormSchema, createHierarchyLevelFormSchema } from './coa-hierarchy-schema';

const t = ((key: string) => key) as never;

describe('COA hierarchy form validation', () => {
  it('requires a specific currency only for the SpecificCurrency policy', () => {
    const schema = createAccountFormSchema(t);
    const base = { code: 'ACC-0001', nameAr: 'أصول', nameEn: 'Assets', accountHierarchyLevelId: 1, parentAccountId: 0, allowPosting: false, manualPostingPolicy: 1 as const, currencyPolicy: 1 as const, specificCurrencyId: 0 };
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, currencyPolicy: 3 }).success).toBe(false);
    expect(schema.safeParse({ ...base, currencyPolicy: 3, specificCurrencyId: 2 }).success).toBe(true);
  });

  it('requires positive hierarchy level numbers and bounded names', () => {
    const schema = createHierarchyLevelFormSchema(t);
    expect(schema.safeParse({ levelNumber: 1, nameAr: 'رئيسي', nameEn: 'Root', canPost: false }).success).toBe(true);
    expect(schema.safeParse({ levelNumber: 0, nameAr: 'رئيسي', nameEn: 'Root', canPost: false }).success).toBe(false);
  });
});
