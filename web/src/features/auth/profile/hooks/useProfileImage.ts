import { apiRoutes } from "@/routes";
import { useNotifications, USER_PROFILE_KEYS } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import AuthService from "@/shared/services/authService";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const useProfileImage = () => {
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch user photo from API
  const fetchUserPhoto = async () => {
    try {
      setIsImageLoading(true);
      const userPhoto = await apiService.get(apiRoutes.auth.getUserPhoto);

      if (userPhoto?.profilePicture) {
        // Add cache-busting query parameter to force refresh
        setImageUrl(`data:image/*;base64,${userPhoto.profilePicture}`);
      }
    } catch (error) {
      console.error("Failed to fetch user photo:", error);
    } finally {
      // Give a slight delay to ensure animation is visible
      setTimeout(() => {
        setIsImageLoading(false);
      }, 800);
    }
  };

  // Initial load of user photo
  useEffect(() => {
    fetchUserPhoto();
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Convert file to base64
  const fileToBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract base64 content without the data URL prefix
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelect = async (file: any) => {
    if (file && file.type.startsWith("image/")) {
      try {
        setIsImageLoading(true);
        // Set preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
          // Short delay to ensure the loading animation is visible
          setTimeout(() => {
            setIsImageLoading(false);
          }, 800);
        };
        reader.readAsDataURL(file);

        // Store the file for upload
        setSelectedFile(file);
      } catch {
        setIsImageLoading(false);
        showError(t("auth.failedLoadImage"), t("messages.error"));
      }
    } else {
      showError(t("auth.selectValidImage"), t("messages.error"));
    }
  };

  // Save profile picture
  const handleSaveProfilePicture = async (setUploadProgress: any, setIsEditing: any) => {
    setUploadProgress(true);
    try {
      // Check if we have a selected file or if we're clearing the image
      // If selectedFile is null and imageUrl is null, it means we want to clear the profile picture
      const isClearingImage = selectedFile === null && imageUrl === null;

      if (selectedFile instanceof File || isClearingImage) {
        let base64String = null;

        // Only convert to base64 if we have a file
        if (selectedFile instanceof File) {
          base64String = await fileToBase64(selectedFile);
        } else {
          console.log("Clearing profile picture");
        }

        // IMPORTANT: Using the correct API endpoint
        let success = false;

        // Approach 1: Directly send profile picture in request (or empty value to clear)

        await apiService.put(apiRoutes.auth.updateUserPhoto, {
          profilePicture: base64String, // This will be null for clearing the image
        });
        success = true;

        if (success) {
          showSuccess(
            t(
              isClearingImage
                ? t("auth.profilePictureRemoved")
                : t("auth.profilePictureUpdated")
            ),
            t("messages.success")
          );
          setSelectedFile(null);

          // Optimistically update React Query caches so UI (e.g., sidebar) updates immediately
          const userId = AuthService.getCurrentUser()?.id || "anonymous";
          // Update the photo-only cache
          queryClient.setQueryData([...USER_PROFILE_KEYS.photo(), userId], {
            profilePicture: base64String,
          });
          // Update the full profile cache (uses data URL format in profile)
          queryClient.setQueryData(
            [...USER_PROFILE_KEYS.profile(), userId],
            (prev: any) =>
              prev && typeof prev === 'object'
                ? {
                    ...prev,
                    profilePicture: base64String
                      ? `data:image/*;base64,${base64String}`
                      : null,
                  }
                : prev
          );
          // Invalidate to refetch and ensure consistency across the app
          queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.all });
        } else {
          showError(
            isClearingImage
              ? t("auth.failedRemoveImage")
              : t("auth.failedUpdateImage"),
            t("messages.error")
          );
        }
      }
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        showError(updatedState.messages, (error as any)?.title || "Error");
      });
    } finally {
      setUploadProgress(false);
      setIsEditing(false);
      setOriginalImageUrl(null); // Reset original image after saving
    }
  };

  return {
    imageUrl,
    setImageUrl,
    originalImageUrl,
    setOriginalImageUrl,
    selectedFile,
    setSelectedFile,
    isImageLoading,
    fileInputRef,
    fetchUserPhoto,
    handleFileSelect,
    handleImageLoad,
    handleSaveProfilePicture,
    SnackbarComponent,
  };
};

export default useProfileImage;
