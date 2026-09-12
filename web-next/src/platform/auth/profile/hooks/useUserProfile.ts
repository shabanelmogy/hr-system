"use client";

import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import UserProfileService from "../services/userProfileService";
import { useSession } from "@/lib/auth/SessionContext";
import type { UserInfo, UserPhoto } from "../services/userProfileService";

// Query keys
export const USER_PROFILE_KEYS = {
  all: ["userProfile"],
  profile: () => [...USER_PROFILE_KEYS.all, "profile"],
  info: () => [...USER_PROFILE_KEYS.all, "info"],
  photo: () => [...USER_PROFILE_KEYS.all, "photo"],
};

type UserQueryOptions<TData> = Omit<UseQueryOptions<TData, Error, TData>, "queryKey" | "queryFn">;
type UserInfoMutationOptions = Omit<UseMutationOptions<unknown, unknown, UserInfo>, "mutationFn">;
type UserPhotoMutationOptions = Omit<UseMutationOptions<unknown, unknown, File | null>, "mutationFn">;

/**
 * Get complete user profile
 */
export const useUserProfile = (options: UserQueryOptions<UserInfo> = {}) => {
  const { user } = useSession();
  return useQuery<UserInfo>({
    queryKey: [...USER_PROFILE_KEYS.profile(), user?.userId ?? "anonymous"],
    queryFn: UserProfileService.getCompleteUserProfile,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
};

/**
 * Get user info only
 */
export const useUserInfo = (options: UserQueryOptions<UserInfo> = {}) => {
  const { user } = useSession();
  return useQuery<UserInfo>({
    queryKey: [...USER_PROFILE_KEYS.info(), user?.userId ?? "anonymous"],
    queryFn: UserProfileService.getUserInfo,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Get user photo only
 */
export const useUserPhoto = (options: UserQueryOptions<UserPhoto> = {}) => {
  const { user } = useSession();
  return useQuery<UserPhoto>({
    queryKey: [...USER_PROFILE_KEYS.photo(), user?.userId ?? "anonymous"],
    queryFn: UserProfileService.getUserPhoto,
    enabled: Boolean(user),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Update user information
 */
export const useUpdateUserInfo = (options: UserInfoMutationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, UserInfo>({
    mutationFn: (userData) => UserProfileService.updateUserInfo(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.all });
    },
    ...options,
  });
};

/**
 * Update user profile picture
 */
export const useUpdateUserPhoto = (options: UserPhotoMutationOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfileService.updateUserPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.all });
    },
    ...options,
  });
};

/**
 * User profile with helper functions
 */
export const useUserProfileWithHelpers = (options: UserQueryOptions<UserInfo> = {}) => {
  const query = useUserProfile(options);

  return {
    ...query,
    getDisplayName: () => UserProfileService.getDisplayName(query.data),
    getUserInitials: () => UserProfileService.getUserInitials(query.data),
    getPrimaryRole: () => UserProfileService.getPrimaryRole(query.data),
    getProfilePicture: () => query.data?.profilePicture,
    isAdmin: () => query.data?.roles?.some((role: string) =>
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrator'
    ),
  };
};

/**
 * Clear user profile cache
 */
export const useClearUserProfile = () => {
  const queryClient = useQueryClient();

  return {
    clearUserProfile: () => {
      queryClient.removeQueries({ queryKey: USER_PROFILE_KEYS.all });
    },
  };
};

/**
 * Prefetch user profile
 */
export const usePrefetchUserProfile = () => {
  const queryClient = useQueryClient();

  return {
    prefetchProfile: () => {
      queryClient.prefetchQuery({
        queryKey: USER_PROFILE_KEYS.profile(),
        queryFn: UserProfileService.getCompleteUserProfile,
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};
