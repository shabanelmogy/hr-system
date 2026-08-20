import { ENV } from '@/src/core/config/env';
import { apiService } from '@/src/core/api';
import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
  UserProfile,
  UserProfilePhoto,
} from '@/src/features/auth/profile/types';

const accountInfoUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '') + '/AccountInfo';

const endpoints = {
  info: `${accountInfoUrl}/GetInfo`,
  photo: `${accountInfoUrl}/GetUserPhoto`,
  updateInfo: `${accountInfoUrl}/UpdateInfo`,
  updatePhoto: `${accountInfoUrl}/UpdateUserPicture`,
  changePassword: `${accountInfoUrl}/ChangePassword`,
} as const;

export const profileApi = {
  getInfo: () => apiService.get<UserProfile>(endpoints.info),

  getPhoto: () => apiService.get<UserProfilePhoto>(endpoints.photo),

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
