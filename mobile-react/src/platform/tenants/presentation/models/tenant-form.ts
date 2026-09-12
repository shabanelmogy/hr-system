import type {
  SubscriptionStatus,
  TenantModuleEntitlementRequest,
} from '../../domain/models/tenant';

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
  entitlements: TenantModuleEntitlementRequest[];
}
