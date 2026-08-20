import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/src/features/auth/context/AuthProvider';
import { profileApi } from '@/src/features/auth/profile/api/profile-api';
import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
} from '@/src/features/auth/profile/types';

export const profileKeys = {
  all: ['current-user-profile'] as const,
  info: (userId: string) => [...profileKeys.all, 'info', userId] as const,
  photo: (userId: string) => [...profileKeys.all, 'photo', userId] as const,
};

export function useProfileInfo() {
  const { session, status } = useAuth();
  const userId = session?.userId ?? 'anonymous';

  return useQuery({
    queryKey: profileKeys.info(userId),
    queryFn: profileApi.getInfo,
    enabled: status === 'authenticated' && Boolean(session?.userId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useProfilePhoto() {
  const { session, status } = useAuth();
  const userId = session?.userId ?? 'anonymous';

  return useQuery({
    queryKey: profileKeys.photo(userId),
    queryFn: profileApi.getPhoto,
    enabled: status === 'authenticated' && Boolean(session?.userId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateProfileInfo() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) => profileApi.updateInfo(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        refreshSession(),
      ]);
    },
  });
}

export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photo: ProfilePhotoUpload | null) => profileApi.updatePhoto(photo),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: profileKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['auth', 'current-user-photo'] }),
      ]);
    },
  });
}

export function useChangeProfilePassword() {
  return useMutation({
    mutationFn: (request: ChangeProfilePasswordRequest) => profileApi.changePassword(request),
  });
}
