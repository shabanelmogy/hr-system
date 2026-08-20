export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileRequest {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
}

export interface UserProfilePhoto {
  profilePicture: string | null;
  contentType: string | null;
}

export interface ProfilePhotoUpload {
  uri: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'image/png';
  fileSize: number | null;
}

export interface ChangeProfilePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeProfilePasswordFormValues extends ChangeProfilePasswordRequest {
  confirmPassword: string;
}
