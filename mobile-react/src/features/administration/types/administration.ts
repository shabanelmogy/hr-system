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

export interface RoleFormValues {
  name: string;
}

export interface RolePermissionsFormValues {
  id: string;
  name: string;
  roleClaims: RoleClaim[];
}

export interface CreateManagedUserRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
}

export type UpdateManagedUserRequest = Omit<CreateManagedUserRequest, 'password'>;

export interface ChangeManagedUserPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface ManagedUserFormValues {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
}
