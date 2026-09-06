import { version } from "./constants";
import type { Id } from "./types";

const base = `${version}/workforce-planning/plans`;

export const workforcePlanning = {
  plans: base,
  plan: (id: Id) => `${base}/${id}`,
  restore: (id: Id) => `${base}/${id}/restore`,
  submit: (id: Id) => `${base}/${id}/submit`,
  beginReview: (id: Id) => `${base}/${id}/begin-review`,
  approve: (id: Id) => `${base}/${id}/approve`,
  reject: (id: Id) => `${base}/${id}/reject`,
  revisions: (id: Id) => `${base}/${id}/revisions`,
} as const;
