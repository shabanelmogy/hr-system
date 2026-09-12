import type { RoleClaim } from '../../domain/models/administration';

export interface RoleFormValues {
  name: string;
}

export interface RolePermissionsFormValues {
  id: string;
  name: string;
  roleClaims: RoleClaim[];
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
