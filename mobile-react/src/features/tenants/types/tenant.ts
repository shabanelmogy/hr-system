export const subscriptionStatuses = [
  'free',
  'trial',
  'active',
  'pastDue',
  'suspended',
  'expired',
  'cancelled',
] as const;

export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

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
}

export interface TenantManagementRequest {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string | null;
  planName: string | null;
  maxAdmins: number;
  maxUsers: number;
  billingEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export interface TenantFormState {
  identifier: string;
  name: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartedOn: string;
  subscriptionEndsOn: string;
  planName: string;
  maxAdmins: string;
  maxUsers: string;
  billingEmail: string;
  contactName: string;
  contactPhone: string;
  notes: string;
}
