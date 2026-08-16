import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type {
  CreateRoleRequest,
  Role,
  RoleWithClaims,
  UpdateRoleRequest,
} from "../../types";
import {
  parseRoleResponse,
  parseRolesResponse,
  parseRoleWithClaimsResponse,
} from "../../utils/apiResponse";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface RoleStore {
  roles: Role[];
  hasLoaded: boolean;
  fetchRoles: () => Promise<Role[]>;
  getRoleById: (id: string) => Promise<Role>;
  getRoleWithClaims: (id: string) => Promise<RoleWithClaims>;
  addRole: (request: CreateRoleRequest) => Promise<Role>;
  updateRole: (request: UpdateRoleRequest) => Promise<Role>;
  updateRoleClaims: (request: UpdateRoleRequest) => Promise<RoleWithClaims>;
  toggleRole: (id: string) => Promise<Role>;
  resetRoleData: () => void;
}

const useRoleStore = create<RoleStore>()(
  devtools(
      (set, get) => ({
        roles: [],
        hasLoaded: false,

        fetchRoles: async () => {
          const response = await apiService.get<unknown>(apiRoutes.roles.getAll);
          const roles = parseRolesResponse(response);
          set({ roles, hasLoaded: true });
          return roles;
        },

        getRoleById: async (id) => {
          const cachedRole = get().roles.find((role) => role.id === id);
          if (cachedRole) return cachedRole;

          const response = await apiService.get<unknown>(apiRoutes.roles.getById(id));
          const role = parseRoleResponse(response);
          set((state) => ({ roles: [...state.roles, role] }));
          return role;
        },

        getRoleWithClaims: async (id) => {
          const response = await apiService.get<unknown>(
            apiRoutes.roles.getRoleClaims(id),
          );
          const role = parseRoleWithClaimsResponse(response);
          set((state) => ({
            roles: [
              ...state.roles.filter((current) => current.id !== role.id),
              role,
            ],
          }));
          return role;
        },

        addRole: async (request) => {
          const response = await apiService.post<unknown>(apiRoutes.roles.add, request);
          const role = parseRoleResponse(response);
          set((state) => ({ roles: [...state.roles, role] }));
          return role;
        },

        updateRole: async (request) => {
          const current = get().roles.find((role) => role.id === request.id);
          if (!current) throw new Error("Updated role was not found in the local store.");
          if (current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.update, request);

          const updatedRole: Role = {
            ...current,
            name: request.name,
            roleClaims: request.roleClaims ?? current.roleClaims,
          };
          set((state) => ({
            roles: state.roles.map((role) =>
              role.id === request.id ? updatedRole : role,
            ),
          }));
          return updatedRole;
        },

        updateRoleClaims: async (request) => {
          const current = get().roles.find((role) => role.id === request.id);
          if (!current || current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.updateRoleClaims, request);
          return {
            id: request.id,
            name: request.name,
            // No parsed API role may default to mutable; fail closed if cache is absent.
            isSystem: current.isSystem,
            isDeleted: current.isDeleted,
            roleClaims: request.roleClaims ?? [],
          };
        },

        toggleRole: async (id) => {
          const current = get().roles.find((role) => role.id === id);
          if (!current) throw new Error("Toggled role was not found in the local store.");
          if (current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.toggle(id));

          const updatedRole = { ...current, isDeleted: !current.isDeleted };
          set((state) => ({
            roles: state.roles.map((role) => role.id === id ? updatedRole : role),
          }));
          return updatedRole;
        },

        resetRoleData: () => set({ roles: [], hasLoaded: false }),
      }),
  ),
);

declare global {
  interface Window {
    __roleStoreLogoutListenerRegistered__?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__roleStoreLogoutListenerRegistered__) {
  window.__roleStoreLogoutListenerRegistered__ = true;
  window.addEventListener("auth:logout", () => useRoleStore.getState().resetRoleData());
}

export default useRoleStore;
