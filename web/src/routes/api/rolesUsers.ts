import type { RolesRoutes, UsersRoutes, Id } from './types';

const version = "/api/v1";

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
  add: `${version}/users/add`,
  update: (id: Id) => `${version}/users/update/${id}`,
  toggle: (id: Id) => `${version}/users/toggle/${id}`,
  unlock: (id: Id) => `${version}/users/unlock/${id}`,
  revoke: (userId: Id) => `${version}/auth/revokeRefreshTokenByUserId?userId=${userId}`,
  delete: (id: Id) => `${version}/users/delete/${id}`,
};
