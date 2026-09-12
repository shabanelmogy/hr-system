export interface User {
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
  lifecycleStatus: "active" | "archived";
  archivedOn: string | null;
  archiveReason: string | null;
}

export interface UserCompanyOption {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
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

export interface UserInvitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresOn: string;
  createdOn: string;
  acceptedOn: string | null;
  revokedOn: string | null;
}

export interface AcceptUserInvitationRequest {
  invitationId: string;
  token: string;
  password: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roles: string[];
  companyIds: number[];
  defaultCompanyId: number;
}

export interface ChangeUserPasswordRequest {
  id: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RoleClaim {
  displayValue: string;
  isSelected: boolean;
}

export interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  isDeleted: boolean;
  roleClaims: RoleClaim[] | null;
}

export interface CreateRoleRequest {
  name: string;
  roleClaims?: RoleClaim[] | null;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  id: string;
}

export interface RoleWithClaims extends Role {
  roleClaims: RoleClaim[];
}

export type AuthDialogType = "add" | "edit" | "view" | "delete" | null;

export type Translator = (
  key: string,
  options?: Record<string, unknown>,
) => string;
