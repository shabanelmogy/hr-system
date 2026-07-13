import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import UserProfileService from "../services/userProfileService";
import AuthService from "../services/authService";

// Query keys
export const USER_PROFILE_KEYS = {
  all: ["userProfile"],
  profile: () => [...USER_PROFILE_KEYS.all, "profile"],
  info: () => [...USER_PROFILE_KEYS.all, "info"],
  photo: () => [...USER_PROFILE_KEYS.all, "photo"],
};

/**
 * Get complete user profile
 */
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: [...USER_PROFILE_KEYS.profile(), (AuthService.getCurrentUser()?.id || "anonymous")],
    queryFn: UserProfileService.getCompleteUserProfile,
    enabled: UserProfileService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
};

/**
 * Get user info only
 */
export const useUserInfo = (options = {}) => {
  return useQuery({
    queryKey: [...USER_PROFILE_KEYS.info(), (AuthService.getCurrentUser()?.id || "anonymous")],
    queryFn: UserProfileService.getUserInfo,
    enabled: UserProfileService.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Get user photo only
 */
export const useUserPhoto = (options = {}) => {
  return useQuery({
    queryKey: [...USER_PROFILE_KEYS.photo(), (AuthService.getCurrentUser()?.id || "anonymous")],
    queryFn: UserProfileService.getUserPhoto,
    enabled: UserProfileService.isAuthenticated(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Update user information
 */
export const useUpdateUserInfo = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserProfileService.updateUserInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.all });
    },
    ...options,
  });
};

/**
 * Update user profile picture
 */
export const useUpdateUserPhoto = (options = {}) => {
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
export const useUserProfileWithHelpers = (options = {}) => {
  const query = useUserProfile(options);

  return {
    ...query,
    getDisplayName: () => UserProfileService.getDisplayName(query.data),
    getUserInitials: () => UserProfileService.getUserInitials(query.data),
    getPrimaryRole: () => UserProfileService.getPrimaryRole(query.data),
    hasProfilePicture: () => !!query.data?.profilePicture,
    isAdmin: () => query.data?.roles?.some(role => 
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