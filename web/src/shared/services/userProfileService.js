import apiService from "./apiService";
import { apiRoutes } from "../../routes";
import AuthService from "./authService";

/**
 * Simplified User Profile Service
 */
class UserProfileService {
  /**
   * Get current user from JWT token
   */
  static getCurrentUserFromToken() {
    return AuthService.getCurrentUser();
  }

  /**
   * Get user info from API
   */
  static async getUserInfo() {
    return await apiService.get(apiRoutes.auth.getUserInfo);
  }

  /**
   * Get user photo from API
   */
  static async getUserPhoto() {
    return await apiService.get(apiRoutes.auth.getUserPhoto);
  }

  /**
   * Update user information
   */
  static async updateUserInfo(userData) {
    const response = await apiService.put(apiRoutes.auth.updateUserInfo, {
      ...userData,
      request: userData,
    });
    
    // Update localStorage
    if (userData.userName) localStorage.setItem("userName", userData.userName);
    if (userData.firstName) localStorage.setItem("firstName", userData.firstName);
    if (userData.lastName) localStorage.setItem("lastName", userData.lastName);
    
    return response;
  }

  /**
   * Update user profile picture
   */
  static async updateUserPhoto(profilePicture) {
    return await apiService.put(apiRoutes.auth.updateUserPhoto, {
      profilePicture,
    });
  }

  /**
   * Get complete user profile
   */
  static async getCompleteUserProfile() {
    // Debug: Check what's in the token
    const rawToken = sessionStorage.getItem("token");
    console.log("Raw Token exists:", !!rawToken);
    
    if (rawToken) {
      try {
        const decodedToken = AuthService.getDecodedToken();
        console.log("Decoded Token:", decodedToken);
        console.log("Token Claims:", Object.keys(decodedToken || {}));
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }

    // Get token data first
    const tokenUser = this.getCurrentUserFromToken();
    console.log("Token User:", tokenUser);
    
    if (!tokenUser) {
      throw new Error("User not authenticated");
    }

    // Base profile from token
    const profile = {
      id: tokenUser.id || "",
      userName: tokenUser.userName || "",
      email: tokenUser.email || "",
      roles: Array.isArray(tokenUser.roles) ? tokenUser.roles : [tokenUser.roles].filter(Boolean),
      permissions: tokenUser.permissions || [],
      firstName: "",
      lastName: "",
      profilePicture: null,
    };

    console.log("Base Profile from Token:", profile);

    // Try to enhance with API data
    try {
      const [userInfo, userPhoto] = await Promise.allSettled([
        this.getUserInfo(),
        this.getUserPhoto()
      ]);

      console.log("API Results:", { userInfo: userInfo.status, userPhoto: userPhoto.status });

      // Add user info if successful
      if (userInfo.status === 'fulfilled' && userInfo.value) {
        console.log("User Info from API:", userInfo.value);
        profile.firstName = userInfo.value.firstName || "";
        profile.lastName = userInfo.value.lastName || "";
        profile.userName = userInfo.value.userName || profile.userName;
      }

      // Add photo if successful
      if (userPhoto.status === 'fulfilled' && userPhoto.value?.profilePicture) {
        console.log("User Photo from API: Found");
        profile.profilePicture = `data:image/*;base64,${userPhoto.value.profilePicture}`;
      }
    } catch (error) {
      console.log("API Error:", error);
    }

    console.log("Final Profile:", profile);
    return profile;
  }

  /**
   * Helper: Get display name
   */
  static getDisplayName(userData) {
    if (!userData) return "User";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    return userData.userName || userData.email || "User";
  }

  /**
   * Helper: Get user initials
   */
  static getUserInitials(userData) {
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

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return AuthService.isAuthenticated();
  }
}

export default UserProfileService;