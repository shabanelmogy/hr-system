export const tenantAdminEndpoints = {
  getAll: 'tenantAdmins/getAll',
  getPage: 'tenantAdmins/getPage',
  create: 'tenantAdmins/create',
  update: (id: string) => `tenantAdmins/update/${id}`,
  archive: (id: string) => `tenantAdmins/delete/${id}`,
  restore: (id: string) => `tenantAdmins/restore/${id}`,
} as const;
