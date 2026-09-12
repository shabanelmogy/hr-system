import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/src/platform/auth/presentation/context/AuthProvider';
import { profileUseCases } from '../../composition/profile-container';
import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
} from '../../domain/models/profile';

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
    queryFn: () => profileUseCases.getInfo(),
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
    queryFn: () => profileUseCases.getPhoto(),
    enabled: status === 'authenticated' && Boolean(session?.userId),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useUpdateProfileInfo() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();

  return useMutation({
    networkMode: 'always',
    mutationFn: (request: UpdateProfileRequest) => profileUseCases.updateInfo(request),
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
    networkMode: 'always',
    mutationFn: (photo: ProfilePhotoUpload | null) => profileUseCases.updatePhoto(photo),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useChangeProfilePassword() {
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: ChangeProfilePasswordRequest) => profileUseCases.changePassword(request),
  });
}

