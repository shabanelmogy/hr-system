export type LedgerSetupResource =
  | "company-settings"
  | "accounts"
  | "hierarchy-levels"
  | "dimensions"
  | "books"
  | "journals"
  | "exchange-rates"
  | "account-determination";

export type LedgerSetupEntity =
  | "settings"
  | "accounts"
  | "hierarchyLevels"
  | "dimensionDefinitions"
  | "dimensionValues"
  | "dimensionPolicies"
  | "books"
  | "journals"
  | "exchangeRateTypes"
  | "exchangeRates"
  | "accountMappings"
  | "postingProfiles";

export interface LedgerSetupRecord {
  id?: number;
  rowVersion?: string;
  isDeleted?: boolean;
  [key: string]: unknown;
}

export interface LedgerSetupOption {
  id: string | number | boolean;
  label: string;
}

export type LedgerSetupOptionSource =
  | "accounts"
  | "books"
  | "currencies"
  | "dimensions"
  | "exchangeRateTypes"
  | "hierarchyLevels";

export type LedgerSetupLookupSource = LedgerSetupOptionSource;

export interface LedgerSetupField {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  required?: boolean;
  options?: readonly LedgerSetupOption[];
  optionSource?: LedgerSetupOptionSource;
}

export interface LedgerSetupEntityDefinition {
  entity: LedgerSetupEntity;
  titleKey: string;
  fields: readonly LedgerSetupField[];
  supportsArchive?: boolean;
  tree?: boolean;
  scope?: "account" | "dimension";
}

export interface ResolveAccountPreviewRequest {
  bookId: number;
  purposeCode: string;
  onDate: string;
  contextReferenceId?: string | null;
}

export interface ResolveAccountPreviewResponse extends LedgerSetupRecord {
  status: number;
  accountId: number | null;
  candidates: Array<{
    ruleId: number;
    ruleType: string;
    accountId: number;
    specificity: number;
    priority: number;
  }>;
}
