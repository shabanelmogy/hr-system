export const districtEndpoints = {
  base: 'districts',
  lookup: (stateId?: number) => stateId == null ? 'districts/lookup' : `districts/lookup?stateId=${stateId}`,
  byState: (stateId: number) => `districts/by-state/${stateId}`,
  byId: (id: number) => `districts/${id}`,
  withAddresses: (id: number) => `districts/${id}/addresses`,
  restore: (id: number) => `districts/${id}/restore`,
  bulkArchive: 'districts/bulk-archive',
  bulkCreate: 'districts/bulk',
} as const;
