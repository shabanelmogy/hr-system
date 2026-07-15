import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type {
  ChangeUserPasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from "../../types";
import {
  parseUserResponse,
  parseUsersResponse,
} from "../../utils/apiResponse";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export interface UserStore {
  users: User[];
  fetchUsers: () => Promise<User[]>;
  addUser: (request: CreateUserRequest) => Promise<User>;
  updateUser: (request: UpdateUserRequest) => Promise<User>;
  changeUserPassword: (request: ChangeUserPasswordRequest) => Promise<void>;
  toggleUser: (id: string) => Promise<User>;
  unLockUser: (id: string) => Promise<User>;
  revokeToken: (userId: string) => Promise<void>;
  resetUserData: () => void;
}

const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set, get) => ({
        users: [],

        fetchUsers: async () => {
          const response = await apiService.get<unknown>(apiRoutes.users.getAll);
          const users = parseUsersResponse(response);
          set({ users });
          return users;
        },

        addUser: async (request) => {
          const response = await apiService.post<unknown>(apiRoutes.users.add, request);
          const user = parseUserResponse(response);
          set((state) => ({ users: [...state.users, user] }));
          return user;
        },

        updateUser: async (request) => {
          await apiService.put<void>(apiRoutes.users.update(request.id), {
            firstName: request.firstName,
            lastName: request.lastName,
            userName: request.userName,
            email: request.email,
            roles: request.roles,
          });

          const current = get().users.find((user) => user.id === request.id);
          if (!current) throw new Error("Updated user was not found in the local store.");

          const updatedUser: User = { ...current, ...request };
          set((state) => ({
            users: state.users.map((user) =>
              user.id === request.id ? updatedUser : user,
            ),
          }));
          return updatedUser;
        },

        changeUserPassword: async ({ id, newPassword, confirmPassword }) => {
          await apiService.put<void>(apiRoutes.users.changePassword(id), {
            newPassword,
            confirmPassword,
          });
        },

        toggleUser: async (id) => {
          await apiService.put<void>(apiRoutes.users.toggle(id));
          const current = get().users.find((user) => user.id === id);
          if (!current) throw new Error("Toggled user was not found in the local store.");

          const updatedUser = { ...current, isDisabled: !current.isDisabled };
          set((state) => ({
            users: state.users.map((user) => user.id === id ? updatedUser : user),
          }));
          return updatedUser;
        },

        unLockUser: async (id) => {
          await apiService.put<void>(apiRoutes.users.unlock(id));
          const current = get().users.find((user) => user.id === id);
          if (!current) throw new Error("Unlocked user was not found in the local store.");

          const updatedUser = { ...current, isLocked: false };
          set((state) => ({
            users: state.users.map((user) => user.id === id ? updatedUser : user),
          }));
          return updatedUser;
        },

        revokeToken: async (userId) => {
          await apiService.put<void>(apiRoutes.users.revoke(userId));
        },

        resetUserData: () => set({ users: [] }),
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);

export default useUserStore;
