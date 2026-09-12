export interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  isDisabled: boolean;
  isLocked: boolean;
  profilePicture: string | null;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number | null;
  lifecycleStatus: 'active' | 'archived';
  archivedOn: string | null;
  archiveReason: string | null;
}

export interface UserCompanyOption {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

export interface RoleOption {
  id: string;
  name: string;
  isSystem: boolean;
  isDeleted: boolean;
  roleClaims: RoleClaim[] | null;
}

export interface RoleClaim {
  displayValue: string;
  isSelected: boolean;
}

export interface RoleWithClaims extends Omit<RoleOption, 'roleClaims'> {
  roleClaims: RoleClaim[];
}

export interface CreateRoleRequest {
  name: string;
  roleClaims?: RoleClaim[] | null;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: string;
}

export interface CreateUserInvitationRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
}

export interface CreateManagedUserRequest extends CreateUserInvitationRequest {
  password: string;
}

export interface UserInvitation extends CreateUserInvitationRequest {
  id: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresOn: string;
  createdOn: string;
  acceptedOn: string | null;
  revokedOn: string | null;
}

export type UpdateManagedUserRequest = CreateUserInvitationRequest;

export interface ChangeManagedUserPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface AdministrationPageQuery {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  columnName?: string;
  sortDirection?: 'ASC' | 'DESC';
  includeArchived?: boolean;
}

export interface AdministrationPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface ManagedUserPage {
  items: ManagedUser[];
  metaData: AdministrationPageMetadata;
}
