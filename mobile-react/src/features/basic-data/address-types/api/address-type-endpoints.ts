export const addressTypeEndpoints = {
  base: 'addresstypes', lookup: 'addresstypes/lookup', byId: (id: number) => `addresstypes/${id}`,
  withAddresses: (id: number) => `addresstypes/${id}/addresses`, restore: (id: number) => `addresstypes/${id}/restore`,
  bulkArchive: 'addresstypes/bulk-archive', bulkCreate: 'addresstypes/bulk',
} as const;
