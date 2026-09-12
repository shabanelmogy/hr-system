import type {
  ChangeProfilePasswordRequest,
  ProfilePhotoUpload,
  UpdateProfileRequest,
  UserProfile,
  UserProfilePhoto,
} from '../models/profile';

export interface ProfileRepository {
  getInfo(): Promise<UserProfile>;
  getPhoto(): Promise<UserProfilePhoto>;
  updateInfo(request: UpdateProfileRequest): Promise<void>;
  updatePhoto(photo: ProfilePhotoUpload | null): Promise<void>;
  changePassword(request: ChangeProfilePasswordRequest): Promise<void>;
}
