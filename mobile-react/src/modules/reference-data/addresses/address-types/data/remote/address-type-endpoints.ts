export const addressTypeEndpoints = {
  base: 'addresstypes',
  byId: (id: number) => `addresstypes/${id}`,
  restore: (id: number) => `addresstypes/${id}/restore`,
  bulkArchive: 'addresstypes/bulk-archive',
  bulkCreate: 'addresstypes/bulk',
} as const;
