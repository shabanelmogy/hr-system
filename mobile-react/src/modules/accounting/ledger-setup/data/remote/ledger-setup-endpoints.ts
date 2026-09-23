const byId = (base: string, id: number) => `${base}/${id}`;

export const ledgerSetupEndpoints = {
  settings: 'accounting-settings',
  accounts: {
    base: 'accounts',
    lookup: 'accounts/lookup',
    tree: 'accounts/tree',
    hierarchyLevels: 'accounts/hierarchy-levels',
  },
  dimensions: {
    base: 'accounting-dimensions',
    values: (definitionId: number) => `accounting-dimensions/${definitionId}/values`,
    valuesBase: 'accounting-dimensions/values',
    policies: (accountId: number) => `accounting-dimensions/accounts/${accountId}/policies`,
    policiesBase: 'accounting-dimensions/policies',
  },
  books: 'accounting-books',
  journals: 'accounting-journals',
  exchangeRateTypes: 'accounting-exchange-rate-types',
  exchangeRates: 'accounting-exchange-rates',
  accountMappings: 'account-mappings',
  postingProfiles: 'posting-profiles',
  currenciesLookup: 'currencies/lookup',
  byId,
  restore: (base: string, id: number) => `${byId(base, id)}/restore`,
  resolvePreview: 'posting-profiles/resolve-preview',
} as const;
