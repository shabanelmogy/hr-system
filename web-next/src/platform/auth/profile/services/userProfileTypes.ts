export interface UserInfo {
  id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  profilePicture?: string | null;
}

export interface CompleteUserProfile extends UserInfo {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

export interface UserPhoto {
  profilePicture?: string;
  contentType?: string;
}
