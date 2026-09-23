import { version } from "./constants";
import type { Id } from "./types";

const route = (name: string) => `${version}/${name}`;
const byId = (base: string, id: Id) => `${base}/${id}`;

export const ledgerSetup = {
  settings: { get: route("accounting-settings"), save: route("accounting-settings") },
  accounts: {
    base: route("accounts"), tree: route("accounts/tree"), lookup: route("accounts/lookup"), codeProposal: route("accounts/code-proposal"),
    hierarchyLevels: route("accounts/hierarchy-levels"), getById: (id: Id) => byId(route("accounts"), id),
    update: (id: Id) => byId(route("accounts"), id), restore: (id: Id) => `${byId(route("accounts"), id)}/restore`,
    hierarchyLevelById: (id: Id) => byId(route("accounts/hierarchy-levels"), id),
    hierarchyLevelRestore: (id: Id) => `${byId(route("accounts/hierarchy-levels"), id)}/restore`,
  },
  dimensions: {
    base: route("accounting-dimensions"), values: (definitionId: Id) => `${route("accounting-dimensions")}/${definitionId}/values`,
    policies: (accountId: Id) => `${route("accounting-dimensions")}/accounts/${accountId}/policies`,
    update: (id: Id) => byId(route("accounting-dimensions"), id), restore: (id: Id) => `${byId(route("accounting-dimensions"), id)}/restore`,
    valuesUpdate: (id: Id) => `${route("accounting-dimensions")}/values/${id}`, valuesRestore: (id: Id) => `${route("accounting-dimensions")}/values/${id}/restore`,
  },
  books: { base: route("accounting-books"), byId: (id: Id) => byId(route("accounting-books"), id), restore: (id: Id) => `${byId(route("accounting-books"), id)}/restore` },
  journals: { base: route("accounting-journals"), byId: (id: Id) => byId(route("accounting-journals"), id), restore: (id: Id) => `${byId(route("accounting-journals"), id)}/restore` },
  exchangeRateTypes: { base: route("accounting-exchange-rate-types"), byId: (id: Id) => byId(route("accounting-exchange-rate-types"), id), restore: (id: Id) => `${byId(route("accounting-exchange-rate-types"), id)}/restore` },
  exchangeRates: { base: route("accounting-exchange-rates"), byId: (id: Id) => byId(route("accounting-exchange-rates"), id) },
  mappings: { base: route("account-mappings"), byId: (id: Id) => byId(route("account-mappings"), id) },
  postingProfiles: { base: route("posting-profiles"), byId: (id: Id) => byId(route("posting-profiles"), id), resolvePreview: route("posting-profiles/resolve-preview") },
} as const;
