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
  getRoleWithClaims: (id: string) => Promise<RoleWithClaims>;
  addRole: (request: CreateRoleRequest) => Promise<Role>;
  updateRole: (request: UpdateRoleRequest) => Promise<Role>;
  updateRoleClaims: (request: UpdateRoleRequest) => Promise<RoleWithClaims>;
  toggleRole: (id: string) => Promise<Role>;
  resetRoleData: () => void;
}

// Store responses can finish after a company switch. The generation makes a
// reset a write barrier so old responses cannot repopulate the new context.
let roleStoreGeneration = 0;

const useRoleStore = create<RoleStore>()(
  devtools(
      (set, get) => ({
        roles: [],
        hasLoaded: false,

        fetchRoles: async () => {
          const generation = roleStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.roles.getAll);
          const roles = parseRolesResponse(response);
          if (generation !== roleStoreGeneration) return roles;
          set({ roles, hasLoaded: true });
          return roles;
        },

        getRoleWithClaims: async (id) => {
          const generation = roleStoreGeneration;
          const response = await apiService.get<unknown>(
            apiRoutes.roles.getRoleClaims(id),
          );
          const role = parseRoleWithClaimsResponse(response);
          if (generation !== roleStoreGeneration) return role;
          set((state) => ({
            roles: [
              ...state.roles.filter((current) => current.id !== role.id),
              role,
            ],
          }));
          return role;
        },

        addRole: async (request) => {
          const generation = roleStoreGeneration;
          const response = await apiService.post<unknown>(apiRoutes.roles.add, request);
          const role = parseRoleResponse(response);
          if (generation !== roleStoreGeneration) return role;
          set((state) => ({ roles: [...state.roles, role] }));
          return role;
        },

        updateRole: async (request) => {
          const current = get().roles.find((role) => role.id === request.id);
          if (!current) throw new Error("Updated role was not found in the local store.");
          if (current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.update, request);
          const roles = await get().fetchRoles();
          const updatedRole = roles.find((role) => role.id === request.id);
          if (!updatedRole) throw new Error("Updated role was not returned by the server.");
          return updatedRole;
        },

        updateRoleClaims: async (request) => {
          const current = get().roles.find((role) => role.id === request.id);
          if (!current || current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.updateRoleClaims, request);
          return get().getRoleWithClaims(request.id);
        },

        toggleRole: async (id) => {
          const current = get().roles.find((role) => role.id === id);
          if (!current) throw new Error("Toggled role was not found in the local store.");
          if (current.isSystem) throw new Error("System roles are read-only.");
          await apiService.put<void>(apiRoutes.roles.toggle(id));
          const roles = await get().fetchRoles();
          const updatedRole = roles.find((role) => role.id === id);
          if (!updatedRole) throw new Error("Toggled role was not returned by the server.");
          return updatedRole;
        },

        resetRoleData: () => {
          roleStoreGeneration += 1;
          set({ roles: [], hasLoaded: false });
        },
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
