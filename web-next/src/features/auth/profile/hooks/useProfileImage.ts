import { apiRoutes } from "@/config";
import { useNotifications, USER_PROFILE_KEYS } from "@/shared/hooks";
import { apiService, getUserPhotoDataUrl, HandleApiError } from "@/shared/services";
import { createImageFileValidationSchema } from "@/shared/validation/fileValidation";
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
        setImageUrl(getUserPhotoDataUrl(userPhoto) || null);
      } else {
        setImageUrl(null);
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

  // Handle file selection
  const handleFileSelect = async (file: File | null) => {
    const validation = createImageFileValidationSchema({
      required: t("validation.required"),
      tooLarge: t("validation.fileTooLarge") || "File too large (max 10MB)",
      invalidType: t("validation.invalidFileType") || "Invalid image file",
    }).safeParse({ file });

    if (validation.success) {
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
        const formData = new FormData();

        if (selectedFile instanceof File) {
          formData.append("ProfilePicture", selectedFile, selectedFile.name);
        } else {
          formData.append("Remove", "true");
        }

        await apiService.put(apiRoutes.auth.updateUserPhoto, formData);

        {
          showSuccess(
            isClearingImage
              ? t("auth.profilePictureRemoved")
              : t("auth.profilePictureUpdated"),
            t("messages.success")
          );
          setSelectedFile(null);

          // The API returns the stored image as base64 from the read endpoint.
          // Refetch all profile consumers so every avatar receives the same value.
          queryClient.invalidateQueries({ queryKey: USER_PROFILE_KEYS.all });
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
