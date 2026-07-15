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
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  roles: string[];
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
