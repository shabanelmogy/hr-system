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
  parseUserInvitationResponse,
  parseUserInvitationsResponse,
} from "../../utils/apiResponse";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface UserStore {
  companyOptions: UserCompanyOption[];
  invitations: UserInvitation[];
  hasCompanyOptionsLoaded: boolean;
  fetchCompanyOptions: () => Promise<UserCompanyOption[]>;
  fetchInvitations: () => Promise<UserInvitation[]>;
  inviteUser: (request: CreateUserInvitationRequest) => Promise<UserInvitation>;
  resendInvitation: (id: string) => Promise<UserInvitation>;
  revokeInvitation: (id: string) => Promise<void>;
  addUser: (request: CreateUserRequest) => Promise<User>;
  updateUser: (request: UpdateUserRequest) => Promise<void>;
  changeUserPassword: (request: ChangeUserPasswordRequest) => Promise<void>;
  toggleUser: (id: string) => Promise<void>;
  unLockUser: (id: string) => Promise<void>;
  archiveUser: (id: string, reason: string) => Promise<void>;
  restoreUser: (id: string) => Promise<void>;
  revokeToken: (userId: string) => Promise<void>;
  resetUserData: () => void;
}

// A reset increments the generation so responses from the previous company
// cannot write into this store after a context transition.
let userStoreGeneration = 0;

const useUserStore = create<UserStore>()(
  devtools(
      (set, get) => ({
        companyOptions: [],
        invitations: [],
        hasCompanyOptionsLoaded: false,

        fetchCompanyOptions: async () => {
          const generation = userStoreGeneration;
          const response = await apiService.get<unknown>(apiRoutes.users.getCompanyOptions);
          const companyOptions = parseUserCompanyOptionsResponse(response);
          if (generation !== userStoreGeneration) return companyOptions;
          set({ companyOptions, hasCompanyOptionsLoaded: true });
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
          await get().fetchInvitations();
        },

        addUser: async (request) => {
          const response = await apiService.post<unknown>(apiRoutes.users.add, request);
          return parseUserResponse(response);
        },

        updateUser: async (request) => {
          await apiService.put<void>(apiRoutes.users.update(request.id), {
            firstName: request.firstName,
            lastName: request.lastName,
            userName: request.userName,
            email: request.email,
            roles: request.roles,
            companyIds: request.companyIds,
            defaultCompanyId: request.defaultCompanyId,
          });
        },

        changeUserPassword: async ({ id, newPassword, confirmPassword }) => {
          await apiService.put<void>(apiRoutes.users.changePassword(id), {
            newPassword,
            confirmPassword,
          });
        },

        toggleUser: async (id) => {
          await apiService.put<void>(apiRoutes.users.toggle(id));
        },

        unLockUser: async (id) => {
          await apiService.put<void>(apiRoutes.users.unlock(id));
        },

        archiveUser: async (id, reason) => {
          await apiService.post<void>(apiRoutes.users.archive(id), { reason });
        },

        restoreUser: async (id) => {
          await apiService.post<void>(apiRoutes.users.restore(id));
        },

        revokeToken: async (userId) => {
          await apiService.put<void>(apiRoutes.users.revoke(userId));
        },

        resetUserData: () => {
          userStoreGeneration += 1;
          set({ companyOptions: [], invitations: [], hasCompanyOptionsLoaded: false });
        },
      }),
  ),
);

export default useUserStore;
