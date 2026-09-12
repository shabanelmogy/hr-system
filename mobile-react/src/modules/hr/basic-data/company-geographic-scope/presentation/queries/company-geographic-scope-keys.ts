export const companyGeographicScopeKeys = {
  all: ['company-geographic-scope'] as const,
  current: () => [...companyGeographicScopeKeys.all, 'current'] as const,
};
