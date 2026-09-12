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

/** Minimal tenant contract consumed by the tenant-admin form boundary. */
export interface TenantAdminTenantOption {
  id: string;
  identifier: string;
  name: string;
  isActive: boolean;
}

export interface TenantAdminPageQuery {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  columnName?: string;
  sortDirection?: 'ASC' | 'DESC';
  includeArchived?: boolean;
}

export interface TenantAdminPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface TenantAdminPage {
  items: TenantAdmin[];
  metaData: TenantAdminPageMetadata;
}
