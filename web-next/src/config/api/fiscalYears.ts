import { version } from "./constants";
import type { Id } from "./types";

const base = `${version}/fiscal-years`;

export const fiscalYears = {
  page: base,
  lookup: `${base}/lookup`,
  getById: (id: Id) => `${base}/${id}`,
  create: base,
  update: (id: Id) => `${base}/${id}`,
  archive: (id: Id) => `${base}/${id}`,
  restore: (id: Id) => `${base}/${id}/restore`,
  open: (id: Id) => `${base}/${id}/open`,
  beginClosing: (id: Id) => `${base}/${id}/begin-closing`,
  close: (id: Id) => `${base}/${id}/close`,
  lock: (id: Id) => `${base}/${id}/lock`,
} as const;
