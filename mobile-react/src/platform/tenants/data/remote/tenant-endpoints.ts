export const tenantEndpoints = {
  getAll: 'tenants/getAll',
  getPage: 'tenants/getPage',
  create: 'tenants/create',
  update: (id: string) => `tenants/update/${id}`,
  archive: (id: string) => `tenants/archive/${id}`,
  restore: (id: string) => `tenants/restore/${id}`,
} as const;
