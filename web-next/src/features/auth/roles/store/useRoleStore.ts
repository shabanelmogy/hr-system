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
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface RoleStore {
  roles: Role[];
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
    persist(
      (set, get) => ({
        roles: [],

        fetchRoles: async () => {
          const response = await apiService.get<unknown>(apiRoutes.roles.getAll);
          const roles = parseRolesResponse(response);
          set({ roles });
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
          return parseRoleWithClaimsResponse(response);
        },

        addRole: async (request) => {
          const response = await apiService.post<unknown>(apiRoutes.roles.add, request);
          const role = parseRoleResponse(response);
          set((state) => ({ roles: [...state.roles, role] }));
          return role;
        },

        updateRole: async (request) => {
          await apiService.put<void>(apiRoutes.roles.update, request);
          const current = get().roles.find((role) => role.id === request.id);
          if (!current) throw new Error("Updated role was not found in the local store.");

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
          await apiService.put<void>(apiRoutes.roles.updateRoleClaims, request);
          const current = get().roles.find((role) => role.id === request.id);
          return {
            id: request.id,
            name: request.name,
            isDeleted: current?.isDeleted ?? false,
            roleClaims: request.roleClaims ?? [],
          };
        },

        toggleRole: async (id) => {
          await apiService.put<void>(apiRoutes.roles.toggle(id));
          const current = get().roles.find((role) => role.id === id);
          if (!current) throw new Error("Toggled role was not found in the local store.");

          const updatedRole = { ...current, isDeleted: !current.isDeleted };
          set((state) => ({
            roles: state.roles.map((role) => role.id === id ? updatedRole : role),
          }));
          return updatedRole;
        },

        resetRoleData: () => set({ roles: [] }),
      }),
      {
        name: "role-storage",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);

export default useRoleStore;
