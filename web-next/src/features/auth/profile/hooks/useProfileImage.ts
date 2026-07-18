import { apiRoutes } from "@/config";
import { useNotifications } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { createImageFileValidationSchema } from "@/shared/validation/fileValidation";
import { USER_PROFILE_KEYS, useUserPhoto } from "./useUserProfile";
import { getUserPhotoDataUrl } from "../services/userProfileService";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";

type BooleanSetter = Dispatch<SetStateAction<boolean>>;

function describeProfileError(error: unknown) {
  if (error && typeof error === "object") {
    const value = error as {
      status?: number;
      title?: string;
      message?: string;
      detail?: string;
    };
    return {
      status: value.status,
      title: value.title,
      message: value.message,
      detail: value.detail,
    };
  }

  return error instanceof Error ? error.message : String(error);
}

const useProfileImage = () => {
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: userPhoto,
    error: userPhotoError,
    isFetching: isUserPhotoFetching,
    isLoading: isUserPhotoLoading,
  } = useUserPhoto({
    retry: (failureCount: number, error: unknown) =>
      getErrorStatus(error) !== 429 && failureCount < 1,
  });

  // Keep the editable preview in sync with the shared profile-photo cache.
  useEffect(() => {
    if (selectedFile) return;

    const syncId = window.setTimeout(() => {
      if (userPhoto?.profilePicture) {
        setImageUrl(getUserPhotoDataUrl(userPhoto) || null);
      } else if (!isUserPhotoLoading && !isUserPhotoFetching) {
        setImageUrl(null);
      }
      setIsImageLoading(isUserPhotoLoading || isUserPhotoFetching);
    }, 0);

    return () => window.clearTimeout(syncId);
  }, [isUserPhotoFetching, isUserPhotoLoading, selectedFile, userPhoto]);

  useEffect(() => {
    if (!userPhotoError) return;
    const details = describeProfileError(userPhotoError);
    if (getErrorStatus(userPhotoError) === 429) {
      console.warn("Profile photo request was rate-limited; using the avatar fallback.", details);
      return;
    }
    console.error("Failed to fetch user photo:", details);
  }, [userPhotoError]);

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
        const validatedFile = validation.data.file;
        setIsImageLoading(true);
        // Set preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(typeof reader.result === "string" ? reader.result : null);
          // Short delay to ensure the loading animation is visible
          setTimeout(() => {
            setIsImageLoading(false);
          }, 800);
        };
        reader.readAsDataURL(validatedFile);

        // Store the file for upload
        setSelectedFile(validatedFile);
      } catch {
        setIsImageLoading(false);
        showError(t("auth.failedLoadImage"), t("messages.error"));
      }
    } else {
      showError(t("auth.selectValidImage"), t("messages.error"));
    }
  };

  // Save profile picture
  const handleSaveProfilePicture = async (
    setUploadProgress: BooleanSetter,
    setIsEditing: BooleanSetter,
  ) => {
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
      HandleApiError(error, (updatedState) => {
        showError(updatedState.messages.join("\n"), updatedState.title);
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
    handleFileSelect,
    handleImageLoad,
    handleSaveProfilePicture,
    SnackbarComponent,
  };
};

export default useProfileImage;

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}
