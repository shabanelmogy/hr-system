import { version } from "./constants";

export const tenantAdmins = {
  getAll: `${version}/tenantAdmins/getAll`,
  getPage: `${version}/tenantAdmins/getPage`,
  getById: (id: string) => `${version}/tenantAdmins/get/${id}`,
  create: `${version}/tenantAdmins/create`,
  update: (id: string) => `${version}/tenantAdmins/update/${id}`,
  delete: (id: string) => `${version}/tenantAdmins/delete/${id}`,
  restore: (id: string) => `${version}/tenantAdmins/restore/${id}`,
} as const;
