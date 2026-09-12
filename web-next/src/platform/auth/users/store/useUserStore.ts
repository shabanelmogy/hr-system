import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type {
  ChangeUserPasswordRequest,
  CreateUserRequest,
  CreateUserInvitationRequest,
  UpdateUserRequest,
  User,
  UserCompanyOption,
  UserInvitation,
} from "../../types";
import {
  parseUserResponse,
  parseUserCompanyOptionsResponse,
  parseUsersResponse,
  parseUsersPageResponse,
  parseUserInvitationResponse,
  parseUserInvitationsResponse,
} from "../../utils/apiResponse";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserStore {
  users: User[];
  companyOptions: UserCompanyOption[];
  invitations: UserInvitation[];
  hasLoaded: boolean;
  fetchUsers: () => Promise<User[]>;
  fetchUsersPage: (query: ManagementPageQuery) => Promise<ManagementPageResponse<User>>;
  fetchCompanyOptions: () => Promise<UserCompanyOption[]>;
  fetchInvitations: () => Promise<UserInvitation[]>;
  inviteUser: (request: CreateUserInvitationRequest) => Promise<UserInvitation>;
  resendInvitation: (id: string) => Promise<UserInvitation>;
  revokeInvitation: (id: string) => Promise<void>;
  addUser: (request: CreateUserRequest) => Promise<User>;
  updateUser: (request: UpdateUserRequest) => Promise<User>;
  changeUserPassword: (request: ChangeUserPasswordRequest) => Promise<void>;
  toggleUser: (id: string) => Promise<User>;
  unLockUser: (id: string) => Promise<User>;
  revokeToken: (userId: string) => Promise<void>;
  resetUserData: () => void;
}

// A reset increments the generation so responses from the previous company
// cannot write into this store after a context transition.
let userStoreGeneration = 0;

const useUserStore = create<UserStore>()(
  devtools(
      (set, get) => ({
        users: [],
        companyOptions: [],
        invitations: [],
        hasLoaded: false,

        fetchUsers: async () => {
          const generation = userStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.users.getAll);
          const users = parseUsersResponse(response);
          if (generation !== userStoreGeneration) return users;
          set({ users, hasLoaded: true });
          return users;
        },

        fetchUsersPage: async (query) => {
          const generation = userStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.users.getPage, { ...query });
          const page = parseUsersPageResponse(response);
          if (generation !== userStoreGeneration) return page;
          set({ users: page.items, hasLoaded: true });
          return page;
        },

        fetchCompanyOptions: async () => {
          const generation = userStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.users.getCompanyOptions);
          const companyOptions = parseUserCompanyOptionsResponse(response);
          if (generation !== userStoreGeneration) return companyOptions;
          set({ companyOptions });
          return companyOptions;
        },

        fetchInvitations: async () => {
          const generation = userStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.userInvitations.getAll);
          const invitations = parseUserInvitationsResponse(response);
          if (generation !== userStoreGeneration) return invitations;
          set({ invitations });
          return invitations;
        },

        inviteUser: async (request) => {
          const generation = userStoreGeneration;
          const response = await apiService.post<unknown>(apiRoutes.userInvitations.create, request);
          const invitation = parseUserInvitationResponse(response);
          if (generation !== userStoreGeneration) return invitation;
          set((state) => ({
            invitations: [
              invitation,
              ...state.invitations.filter((item) => item.id !== invitation.id),
            ],
          }));
          return invitation;
        },

        resendInvitation: async (id) => {
          const generation = userStoreGeneration;
          const response = await apiService.post<unknown>(apiRoutes.userInvitations.resend(id));
          const invitation = parseUserInvitationResponse(response);
          if (generation !== userStoreGeneration) return invitation;
          set((state) => ({
            invitations: state.invitations.map((item) => item.id === id ? invitation : item),
          }));
          return invitation;
        },

        revokeInvitation: async (id) => {
          const generation = userStoreGeneration;
          await apiService.delete(apiRoutes.userInvitations.revoke(id));
          if (generation !== userStoreGeneration) return;
          set((state) => ({
            invitations: state.invitations.map((item) => item.id === id
              ? { ...item, status: "revoked", revokedOn: new Date().toISOString() }
              : item),
          }));
        },

        addUser: async (request) => {
          const generation = userStoreGeneration;
          const response = await apiService.post<unknown>(apiRoutes.users.add, request);
          const user = parseUserResponse(response);
          if (generation !== userStoreGeneration) return user;
          set((state) => ({ users: [...state.users, user] }));
          return user;
        },

        updateUser: async (request) => {
          const generation = userStoreGeneration;
          await apiService.put<void>(apiRoutes.users.update(request.id), {
            firstName: request.firstName,
            lastName: request.lastName,
            userName: request.userName,
            email: request.email,
            roles: request.roles,
            companyIds: request.companyIds,
            defaultCompanyId: request.defaultCompanyId,
          });

          const current = get().users.find((user) => user.id === request.id);
          if (!current) throw new Error("Updated user was not found in the local store.");

          const updatedUser: User = { ...current, ...request };
          if (generation !== userStoreGeneration) return updatedUser;
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
          const generation = userStoreGeneration;
          await apiService.put<void>(apiRoutes.users.toggle(id));
          const current = get().users.find((user) => user.id === id);
          if (!current) throw new Error("Toggled user was not found in the local store.");

          const updatedUser = { ...current, isDisabled: !current.isDisabled };
          if (generation !== userStoreGeneration) return updatedUser;
          set((state) => ({
            users: state.users.map((user) => user.id === id ? updatedUser : user),
          }));
          return updatedUser;
        },

        unLockUser: async (id) => {
          const generation = userStoreGeneration;
          await apiService.put<void>(apiRoutes.users.unlock(id));
          const current = get().users.find((user) => user.id === id);
          if (!current) throw new Error("Unlocked user was not found in the local store.");

          const updatedUser = { ...current, isLocked: false };
          if (generation !== userStoreGeneration) return updatedUser;
          set((state) => ({
            users: state.users.map((user) => user.id === id ? updatedUser : user),
          }));
          return updatedUser;
        },

        revokeToken: async (userId) => {
          await apiService.put<void>(apiRoutes.users.revoke(userId));
        },

        resetUserData: () => {
          userStoreGeneration += 1;
          set({ users: [], companyOptions: [], invitations: [], hasLoaded: false });
        },
      }),
  ),
);

export default useUserStore;
