import type { LedgerSetupEntity, LedgerSetupEntityDefinition, LedgerSetupField, LedgerSetupResource } from './ledger-setup';

const field = (name: string, options: Omit<LedgerSetupField, 'name' | 'labelKey'> = {}): LedgerSetupField => ({
  name,
  labelKey: `ledgerSetup.fields.${name}`,
  ...options,
});

const booleanOptions = [
  { value: 1, labelKey: 'ledgerSetup.enums.yes' },
  { value: 0, labelKey: 'ledgerSetup.enums.no' },
] as const;
const manualPostingOptions = [
  { value: 1, labelKey: 'ledgerSetup.enums.manualPosting.allowed' },
  { value: 2, labelKey: 'ledgerSetup.enums.manualPosting.restricted' },
  { value: 3, labelKey: 'ledgerSetup.enums.manualPosting.blocked' },
] as const;
const currencyPolicyOptions = [
  { value: 1, labelKey: 'ledgerSetup.enums.currencyPolicy.any' },
  { value: 2, labelKey: 'ledgerSetup.enums.currencyPolicy.functionalOnly' },
  { value: 3, labelKey: 'ledgerSetup.enums.currencyPolicy.specificCurrency' },
] as const;
const dimensionRequirementOptions = [
  { value: 1, labelKey: 'ledgerSetup.enums.dimensionRequirement.optional' },
  { value: 2, labelKey: 'ledgerSetup.enums.dimensionRequirement.required' },
  { value: 3, labelKey: 'ledgerSetup.enums.dimensionRequirement.forbidden' },
] as const;
const resetPolicyOptions = [
  { value: 1, labelKey: 'ledgerSetup.enums.resetPolicy.never' },
  { value: 2, labelKey: 'ledgerSetup.enums.resetPolicy.fiscalYear' },
] as const;
const companyOnly = [{ value: 1, labelKey: 'ledgerSetup.enums.company' }] as const;

export const ledgerSetupDefinitions: Record<LedgerSetupEntity, LedgerSetupEntityDefinition> = {
  settings: { entity: 'settings', titleKey: 'ledgerSetup.companySettings.title', icon: 'settings-outline', fields: [field('functionalCurrencyId', { type: 'select', optionSource: 'currencies', required: true }), field('primaryBookId', { type: 'select', optionSource: 'books', required: true })] },
  accounts: { entity: 'accounts', titleKey: 'ledgerSetup.accounts.title', icon: 'git-branch-outline', supportsArchive: true, fields: [field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true }), field('accountHierarchyLevelId', { type: 'select', optionSource: 'hierarchyLevels', required: true }), field('parentAccountId', { type: 'select', optionSource: 'accounts' }), field('allowPosting', { type: 'boolean', options: booleanOptions, required: true }), field('manualPostingPolicy', { type: 'select', options: manualPostingOptions, required: true }), field('currencyPolicy', { type: 'select', options: currencyPolicyOptions, required: true }), field('specificCurrencyId', { type: 'select', optionSource: 'currencies' })] },
  hierarchyLevels: { entity: 'hierarchyLevels', titleKey: 'ledgerSetup.hierarchyLevels.title', icon: 'layers-outline', supportsArchive: true, fields: [field('levelNumber', { type: 'number', required: true }), field('nameAr', { required: true }), field('nameEn', { required: true }), field('canPost', { type: 'boolean', options: booleanOptions, required: true })] },
  dimensionDefinitions: { entity: 'dimensionDefinitions', titleKey: 'ledgerSetup.dimensions.definitions', icon: 'options-outline', supportsArchive: true, fields: [field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true }), field('valueSource', { type: 'select', options: [{ value: 1, labelKey: 'ledgerSetup.enums.accountingOwned' }], required: true })] },
  dimensionValues: { entity: 'dimensionValues', titleKey: 'ledgerSetup.dimensions.values', icon: 'list-outline', supportsArchive: true, scope: 'dimension', fields: [field('dimensionDefinitionId', { type: 'select', optionSource: 'dimensions', required: true }), field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true })] },
  dimensionPolicies: { entity: 'dimensionPolicies', titleKey: 'ledgerSetup.dimensions.policies', icon: 'shield-checkmark-outline', scope: 'account', fields: [field('accountId', { type: 'select', optionSource: 'accounts', required: true }), field('dimensionDefinitionId', { type: 'select', optionSource: 'dimensions', required: true }), field('requirement', { type: 'select', options: dimensionRequirementOptions, required: true })] },
  books: { entity: 'books', titleKey: 'ledgerSetup.books.title', icon: 'book-outline', supportsArchive: true, fields: [field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true })] },
  journals: { entity: 'journals', titleKey: 'ledgerSetup.journals.title', icon: 'journal-outline', supportsArchive: true, fields: [field('bookId', { type: 'select', optionSource: 'books', required: true }), field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true }), field('categoryCode', { required: true }), field('numberPrefix', { required: true }), field('numberPadding', { type: 'number', required: true }), field('resetPolicy', { type: 'select', options: resetPolicyOptions, required: true }), field('nextNumber', { type: 'number', required: true })] },
  exchangeRateTypes: { entity: 'exchangeRateTypes', titleKey: 'ledgerSetup.exchangeRates.types', icon: 'swap-horizontal-outline', supportsArchive: true, fields: [field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true })] },
  exchangeRates: { entity: 'exchangeRates', titleKey: 'ledgerSetup.exchangeRates.rates', icon: 'trending-up-outline', fields: [field('exchangeRateTypeId', { type: 'select', optionSource: 'exchangeRateTypes', required: true }), field('fromCurrencyId', { type: 'select', optionSource: 'currencies', required: true }), field('toCurrencyId', { type: 'select', optionSource: 'currencies', required: true }), field('effectiveFrom', { type: 'date', required: true }), field('effectiveTo', { type: 'date' }), field('version', { type: 'number', required: true }), field('rate', { type: 'number', required: true })] },
  accountMappings: { entity: 'accountMappings', titleKey: 'ledgerSetup.accountDetermination.mappings', icon: 'map-outline', fields: [field('bookId', { type: 'select', optionSource: 'books', required: true }), field('purposeCode', { required: true }), field('sourceType', { type: 'select', options: companyOnly, required: true }), field('sourceReferenceId'), field('accountId', { type: 'select', optionSource: 'accounts', required: true }), field('effectiveFrom', { type: 'date', required: true }), field('effectiveTo', { type: 'date' })] },
  postingProfiles: { entity: 'postingProfiles', titleKey: 'ledgerSetup.accountDetermination.profiles', icon: 'funnel-outline', fields: [field('bookId', { type: 'select', optionSource: 'books', required: true }), field('code', { required: true }), field('nameAr', { required: true }), field('nameEn', { required: true }), field('purposeCode', { required: true }), field('contextType', { type: 'select', options: companyOnly, required: true }), field('contextReferenceId'), field('accountId', { type: 'select', optionSource: 'accounts', required: true }), field('priority', { type: 'number', required: true }), field('version', { type: 'number', required: true }), field('effectiveFrom', { type: 'date', required: true }), field('effectiveTo', { type: 'date' })] },
};

export const ledgerSetupResourceEntities: Record<LedgerSetupResource, readonly LedgerSetupEntity[]> = {
  'company-settings': ['settings'],
  accounts: ['accounts'],
  'hierarchy-levels': ['hierarchyLevels'],
  dimensions: ['dimensionDefinitions', 'dimensionValues', 'dimensionPolicies'],
  books: ['books'],
  journals: ['journals'],
  'exchange-rates': ['exchangeRateTypes', 'exchangeRates'],
  'account-determination': ['accountMappings', 'postingProfiles'],
};
