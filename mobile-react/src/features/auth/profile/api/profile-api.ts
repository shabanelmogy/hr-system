import { ENV } from '@/src/core/config/env';
import { apiService } from '@/src/core/api';
import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
  UserProfile,
  UserProfilePhoto,
} from '@/src/features/auth/profile/types';
import { userProfilePhotoSchema, userProfileSchema } from '@/src/features/auth/profile/api/profile-schemas';

const accountInfoUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '') + '/AccountInfo';

const endpoints = {
  info: `${accountInfoUrl}/GetInfo`,
  photo: `${accountInfoUrl}/GetUserPhoto`,
  updateInfo: `${accountInfoUrl}/UpdateInfo`,
  updatePhoto: `${accountInfoUrl}/UpdateUserPicture`,
  changePassword: `${accountInfoUrl}/ChangePassword`,
} as const;

export const profileApi = {
  async getInfo(): Promise<UserProfile> {
    return userProfileSchema.parse(await apiService.get<unknown>(endpoints.info));
  },

  async getPhoto(): Promise<UserProfilePhoto> {
    return userProfilePhotoSchema.parse(await apiService.get<unknown>(endpoints.photo));
  },

  updateInfo: (request: UpdateProfileRequest) =>
    apiService.put<void, UpdateProfileRequest>(endpoints.updateInfo, request),

  updatePhoto: (photo: ProfilePhotoUpload | null) => {
    const formData = new FormData();
    if (photo) {
      formData.append('ProfilePicture', {
        uri: photo.uri,
        name: photo.fileName,
        type: photo.mimeType,
      } as unknown as Blob);
    } else {
      formData.append('Remove', 'true');
    }

    return apiService.put<void, FormData>(endpoints.updatePhoto, formData);
  },

  changePassword: (request: ChangeProfilePasswordRequest) =>
    apiService.put<void, ChangeProfilePasswordRequest>(endpoints.changePassword, request, {
      allowWhenReadOnly: true,
    }),
};
