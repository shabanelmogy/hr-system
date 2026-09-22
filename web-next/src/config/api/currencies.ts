import { version } from "./constants";
import type { Id } from "./types";

const base = `${version}/currencies`;

export const currencies = {
  page: base,
  lookup: `${base}/lookup`,
  getById: (id: Id) => `${base}/${id}`,
  create: base,
  update: (id: Id) => `${base}/${id}`,
  archive: (id: Id) => `${base}/${id}`,
  restore: (id: Id) => `${base}/${id}/restore`,
} as const;
