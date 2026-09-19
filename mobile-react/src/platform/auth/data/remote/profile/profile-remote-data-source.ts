import { apiService } from '@/src/core/api';
import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
  UserProfile,
  UserProfilePhoto,
} from '../../../domain/models/profile';
import type { ProfileRepository } from '../../../domain/repositories/profile-repository';
import { profileEndpoints } from './profile-endpoints';
import { userProfilePhotoSchema, userProfileSchema } from './profile-schemas';

export const profileRemoteDataSource: ProfileRepository = {
  async getInfo(): Promise<UserProfile> {
    return userProfileSchema.parse(await apiService.get<unknown>(profileEndpoints.info));
  },

  async getPhoto(): Promise<UserProfilePhoto> {
    return userProfilePhotoSchema.parse(await apiService.get<unknown>(profileEndpoints.photo));
  },

  updateInfo: (request: UpdateProfileRequest) =>
    apiService.put<void, UpdateProfileRequest>(profileEndpoints.updateInfo, request),

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

    return apiService.put<void, FormData>(profileEndpoints.updatePhoto, formData);
  },

  changePassword: (request: ChangeProfilePasswordRequest) =>
    apiService.put<void, ChangeProfilePasswordRequest>(profileEndpoints.changePassword, request, {
      allowWhenReadOnly: true,
    }),
};

