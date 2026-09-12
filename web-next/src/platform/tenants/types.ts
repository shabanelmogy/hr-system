export const subscriptionStatuses = [
  "free",
  "trial",
  "active",
  "pastDue",
  "suspended",
  "expired",
  "cancelled",
] as const;

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export type TenantSortColumn = "name" | "identifier" | "createdOn";

export interface TenantListFilters {
  includeArchived: boolean;
}

export interface TenantManagementResponse {
  id: string;
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string | null;
  planName: string | null;
  maxAdmins: number;
  maxUsers: number;
  adminCount: number;
  userCount: number;
  totalUserCount: number;
  companyCount: number;
  billingEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  createdOn: string;
  updatedOn: string | null;
  lifecycleStatus: "active" | "archived" | "purgeScheduled";
  archivedOn: string | null;
  archiveReason: string | null;
  purgeScheduledOn: string | null;
  rowVersion: string;
  entitlements?: TenantModuleEntitlementResponse[] | null;
}

export interface TenantModuleEntitlementRequest {
  moduleCode: string;
  submoduleCodes: string[];
}

export interface TenantModuleEntitlementResponse {
  moduleCode: string;
  submoduleCodes: string[];
}

export interface TenantManagementRequest {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string;
  planName: string | null;
  maxAdmins: number;
  maxUsers: number;
  billingEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
  rowVersion?: string | null;
  entitlements?: TenantModuleEntitlementRequest[] | null;
}
