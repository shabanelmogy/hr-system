export type LedgerSetupResource =
  | 'company-settings'
  | 'accounts'
  | 'hierarchy-levels'
  | 'dimensions'
  | 'books'
  | 'journals'
  | 'exchange-rates'
  | 'account-determination';

export type LedgerSetupEntity =
  | 'settings'
  | 'accounts'
  | 'hierarchyLevels'
  | 'dimensionDefinitions'
  | 'dimensionValues'
  | 'dimensionPolicies'
  | 'books'
  | 'journals'
  | 'exchangeRateTypes'
  | 'exchangeRates'
  | 'accountMappings'
  | 'postingProfiles';

export type LedgerSetupValue = string | number | boolean | null | undefined;

export interface LedgerSetupRecord {
  id?: number;
  rowVersion?: string;
  isDeleted?: boolean;
  [key: string]: unknown;
}

export interface LedgerSetupOption {
  value: string | number;
  labelKey: string;
}

export type LedgerSetupOptionSource =
  | 'accounts'
  | 'books'
  | 'currencies'
  | 'dimensions'
  | 'exchangeRateTypes'
  | 'hierarchyLevels';

export type LedgerSetupLookupSource = LedgerSetupOptionSource;

export interface LedgerSetupField {
  name: string;
  labelKey: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required?: boolean;
  optionSource?: LedgerSetupOptionSource;
  options?: readonly LedgerSetupOption[];
}

export interface LedgerSetupEntityDefinition {
  entity: LedgerSetupEntity;
  titleKey: string;
  /** Icon key is resolved by the presentation layer to keep domain independent of React Native. */
  icon: string;
  fields: readonly LedgerSetupField[];
  supportsArchive?: boolean;
  scope?: 'account' | 'dimension';
}

export type LedgerSetupFormValues = Record<string, LedgerSetupValue>;

export interface ResolveAccountPreviewRequest {
  bookId: number;
  purposeCode: string;
  onDate: string;
  contextReferenceId?: string | null;
}

export interface ResolveAccountPreviewResponse {
  status: number;
  accountId: number | null;
  candidates: { ruleId: number; ruleType: string; accountId: number; specificity: number; priority: number }[];
}
