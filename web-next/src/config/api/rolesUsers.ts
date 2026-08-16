import type { RolesRoutes, UsersRoutes, UserInvitationsRoutes, Id } from './types';
import { version } from "./constants";

export const roles: RolesRoutes = {
  getAll: `${version}/roles/getAll`,
  getById: (id: Id) => `${version}/roles/${id}`,
  add: `${version}/roles/add`,
  update: `${version}/roles/update`,
  toggle: (id: Id) => `${version}/roles/toggle/${id}`,
  getRoleClaims: (id: Id) => `${version}/roles/getRoleClaims?roleId=${id}`,
  updateRoleClaims: `${version}/roles/updateRoleClaims`,
};

export const users: UsersRoutes = {
  getAll: `${version}/users/getAll`,
  getPage: `${version}/users/getPage`,
  getCompanyOptions: `${version}/users/getCompanyOptions`,
  add: `${version}/users/add`,
  update: (id: Id) => `${version}/users/update/${id}`,
  changePassword: (id: Id) => `${version}/users/changePassword/${id}`,
  toggle: (id: Id) => `${version}/users/toggle/${id}`,
  unlock: (id: Id) => `${version}/users/unlock/${id}`,
  revoke: (userId: Id) => `${version}/auth/revokeRefreshTokenByUserId?userId=${userId}`,
  archive: (id: Id) => `${version}/users/archive/${id}`,
  restore: (id: Id) => `${version}/users/restore/${id}`,
};

export const userInvitations: UserInvitationsRoutes = {
  getAll: `${version}/userinvitations/getAll`,
  create: `${version}/userinvitations/create`,
  resend: (id) => `${version}/userinvitations/resend/${id}`,
  revoke: (id) => `${version}/userinvitations/revoke/${id}`,
  accept: `${version}/account-invitations/accept`,
};
