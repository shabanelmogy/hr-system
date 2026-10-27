export interface UserPermissionChoice {
  permission: string;
  moduleCode: string;
  submoduleCode: string;
  isDirect: boolean;
  inheritedFrom: string[];
  isEffective: boolean;
  canGrant: boolean;
}
export interface UserCompanyPermissions {
  userId: string;
  userName: string;
  companyId: number;
  companyName: string;
  revision: number;
  permissions: UserPermissionChoice[];
}
export interface ReplaceUserPermissions {
  permissions: string[];
  expectedRevision: number;
}