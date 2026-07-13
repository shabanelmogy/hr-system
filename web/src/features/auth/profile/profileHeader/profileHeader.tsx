/* eslint-disable react/prop-types */
import { DragDropUploader } from "@/shared/components";
import { alpha, Card, CardContent, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import useProfileImage from "../hooks/useProfileImage";
import EditControls from "./editControls";
import ProfileAvatar from "./profileAvatar";
import UserInfoDisplay from "./userInfoDisplay";

interface ProfileHeaderProps {
  userData: { userName?: string; [key: string]: any };
}

const ProfileHeader = ({ userData }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const theme = useTheme();

  const {
    imageUrl,
    setImageUrl,
    originalImageUrl,
    setOriginalImageUrl,
    setSelectedFile,
    isImageLoading,
    fileInputRef,
    handleFileSelect,
    handleImageLoad,
    handleSaveProfilePicture,
    SnackbarComponent,
  } = useProfileImage();

  // Handler for the edit/save button click - toggles between edit and save modes
  const handleButtonClick = () => {
    if (isEditing) {
      // If currently editing, save the profile picture
      handleSaveProfilePicture(setUploadProgress, setIsEditing);
    } else {
      // If not editing, switch to edit mode and store original image URL for undo
      setOriginalImageUrl(imageUrl);
      setIsEditing(true);
      setUploadProgress(false);
    }
  };

  // Handler for the undo button
  const handleUndoChanges = () => {
    // Restore the original image
    setImageUrl(originalImageUrl);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Exit edit mode without showing a message
    setIsEditing(false);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing) {
      e.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isEditing) {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 4,
          background:
            theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.9)" : "#ffffff",
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
              : `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          overflow: "visible",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? `0 12px 40px ${alpha(theme.palette.common.black, 0.3)}`
                : `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={4}>
            {/* Top Section with Avatar and Info */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{ alignItems: "center" }}
            >
              {/* Profile Avatar Component */}
              <ProfileAvatar
                imageUrl={imageUrl}
                userData={userData}
                isEditing={isEditing}
                isDragging={isDragging}
                isImageLoading={isImageLoading}
                fileInputRef={fileInputRef}
                setSelectedFile={setSelectedFile}
                setImageUrl={setImageUrl}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleImageLoad={handleImageLoad}
              />

              {/* User Info Display Component */}
              <UserInfoDisplay
                userData={userData}
                uploadProgress={uploadProgress}
              />

              {/* Edit/Save Controls Component */}
              <EditControls
                isEditing={isEditing}
                uploadProgress={uploadProgress}
                handleButtonClick={handleButtonClick}
                handleUndoChanges={handleUndoChanges}
              />
            </Stack>

            {/* Drag & Drop Uploader - only show when editing */}
            {isEditing && (
              <DragDropUploader
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleClick={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                handleFileInputChange={handleFileInputChange}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
      {SnackbarComponent}
    </>
  );
};

export default ProfileHeader;
