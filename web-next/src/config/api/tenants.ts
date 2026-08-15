import { version } from "./constants";

export const tenants = {
  getAll: `${version}/tenants/getAll`,
  getPage: `${version}/tenants/getPage`,
  getById: (id: string) => `${version}/tenants/get/${id}`,
  create: `${version}/tenants/create`,
  update: (id: string) => `${version}/tenants/update/${id}`,
  archive: (id: string) => `${version}/tenants/archive/${id}`,
  restore: (id: string) => `${version}/tenants/restore/${id}`,
} as const;
