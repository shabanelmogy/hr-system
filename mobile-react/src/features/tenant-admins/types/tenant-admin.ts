export interface TenantAdminTenant {
  id: string;
  identifier: string;
  name: string;
  isDefault: boolean;
}

export interface TenantAdmin {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  isDisabled: boolean;
  isLocked: boolean;
  defaultTenantId: string;
  tenants: TenantAdminTenant[];
  companyIds: number[];
  lifecycleStatus: 'active' | 'archived';
  archivedOn: string | null;
  archiveReason: string | null;
}

export interface TenantAdminRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password?: string;
  isDisabled: boolean;
  tenantIds: string[];
  defaultTenantId: string;
}

export interface TenantAdminFormValues {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  isDisabled: boolean;
  tenantIds: string[];
  defaultTenantId: string;
}
