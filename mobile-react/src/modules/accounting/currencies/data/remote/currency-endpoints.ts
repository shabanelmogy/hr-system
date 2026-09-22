export const currencyEndpoints = {
  base: 'currencies',
  lookup: 'currencies/lookup',
  byId: (id: number) => `currencies/${id}`,
  restore: (id: number) => `currencies/${id}/restore`,
} as const;
