import apiService from "./apiService";
import { apiRoutes } from "@/config";

/**
 * Simplified User Profile Service
 */
export interface UserInfo {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
}

export interface UserPhoto {
  profilePicture?: string;
  contentType?: string;
}

export const getUserPhotoDataUrl = (photo?: UserPhoto | null) => {
  if (!photo?.profilePicture) return undefined;
  if (photo.profilePicture.startsWith("data:")) return photo.profilePicture;

  return `data:${photo.contentType || "image/jpeg"};base64,${photo.profilePicture}`;
};

class UserProfileService {
  /**
   * Get user info from API
   */
  static async getUserInfo(): Promise<UserInfo> {
    return await apiService.get(apiRoutes.auth.getUserInfo);
  }

  /**
   * Get user photo from API
   */
  static async getUserPhoto(): Promise<UserPhoto> {
    return await apiService.get(apiRoutes.auth.getUserPhoto);
  }

  /**
   * Update user information
   */
  static async updateUserInfo(userData: any) {
    return apiService.put(apiRoutes.auth.updateUserInfo, {
      ...userData,
      request: userData,
    });
  }

  /**
   * Update user profile picture
   */
  static async updateUserPhoto(profilePicture: File | null) {
    const formData = new FormData();
    if (profilePicture) {
      formData.append("ProfilePicture", profilePicture, profilePicture.name);
    } else {
      formData.append("Remove", "true");
    }

    return await apiService.put(apiRoutes.auth.updateUserPhoto, formData);
  }

  /**
   * Get complete user profile
   */
  static async getCompleteUserProfile() {
    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
    if (!sessionResponse.ok) {
      throw new Error("User not authenticated");
    }
    const { user } = await sessionResponse.json();
    const profile = {
      id: user.userId || "",
      userName: user.userName || "",
      email: user.email || "",
      roles: user.roles || [],
      permissions: user.permissions || [],
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profilePicture: null,
    };

    const [userInfo, userPhoto] = await Promise.allSettled([
      this.getUserInfo(),
      this.getUserPhoto()
    ]);
    if (userInfo.status === "fulfilled" && userInfo.value) {
      profile.firstName = userInfo.value.firstName || profile.firstName;
      profile.lastName = userInfo.value.lastName || profile.lastName;
      profile.userName = userInfo.value.userName || profile.userName;
    }
    if (userPhoto.status === "fulfilled" && userPhoto.value?.profilePicture) {
      profile.profilePicture = getUserPhotoDataUrl(userPhoto.value) || null;
    }
    return profile;
  }

  /**
   * Helper: Get display name
   */
  static getDisplayName(userData: any) {
    if (!userData) return "User";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.userName || userData.email || "User";
  }

  /**
   * Helper: Get user initials
   */
  static getUserInitials(userData: any) {
    if (!userData) return "U";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
    }
    if (userData.userName) {
      return userData.userName.charAt(0).toUpperCase();
    }
    return "U";
  }

  /**
   * Helper: Get primary role
   */
  static getPrimaryRole(userData) {
    if (!userData?.roles?.length) return "User";
    const role = userData.roles[0];
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

}

export default UserProfileService;
