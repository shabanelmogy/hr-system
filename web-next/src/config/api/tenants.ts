import { version } from "./constants";

export const tenants = {
  getAll: `${version}/tenants/getAll`,
  getById: (id: string) => `${version}/tenants/get/${id}`,
  create: `${version}/tenants/create`,
  update: (id: string) => `${version}/tenants/update/${id}`,
} as const;
