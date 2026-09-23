export const coaHierarchyEndpoints = {
  accounts: 'accounts',
  account: (id: number) => `accounts/${id}`,
  accountTree: 'accounts/tree',
  accountLookup: 'accounts/lookup',
  accountCodeProposal: 'accounts/code-proposal',
  accountRestore: (id: number) => `accounts/${id}/restore`,
  hierarchyLevels: 'accounts/hierarchy-levels',
  hierarchyLevel: (id: number) => `accounts/hierarchy-levels/${id}`,
  hierarchyLevelRestore: (id: number) => `accounts/hierarchy-levels/${id}/restore`,
} as const;
