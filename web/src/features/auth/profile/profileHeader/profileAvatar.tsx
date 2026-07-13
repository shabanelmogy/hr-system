/* eslint-disable react/prop-types */
import { useRef } from "react";
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ProfileAvatarProps {
  imageUrl: string | null;
  userData: { userName?: string };
  isEditing: boolean;
  isDragging: boolean;
  isImageLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  setSelectedFile: (file: File | null) => void;
  setImageUrl: (url: string | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleImageLoad: () => void;
}

const ProfileAvatar = ({
  imageUrl,
  userData,
  isEditing,
  isDragging,
  isImageLoading,
  fileInputRef,
  setSelectedFile,
  setImageUrl,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleImageLoad,
}: ProfileAvatarProps) => {
  const theme = useTheme();
  const avatarRef = useRef(null);

  // Get name initials for avatar fallback
  const getNameInitials = () => {
    const name = userData.userName || "";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to get a random gradient for avatar background
  const getAvatarGradient = () => {
    const gradients = [
      "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
      "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
      "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)",
      "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
    ];

    // Use username to pick a consistent gradient
    const username = userData.userName || "";
    const index =
      username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      gradients.length;

    return gradients[index];
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        position: "relative",
        cursor: isEditing ? "pointer" : "default",
        width: { xs: 120, sm: 140 },
        height: { xs: 120, sm: 140 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Decorative ring animation */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `conic-gradient(from 180deg at 50% 50%, 
            ${theme.palette.primary.main} 0deg, 
            ${alpha(theme.palette.primary.main, 0.6)} 90deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 180deg, 
            ${alpha(theme.palette.primary.main, 0.3)} 270deg, 
            ${theme.palette.primary.main} 360deg)`,
          animation: "spin 8s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          filter: "blur(6px)",
          opacity: 0.8,
        }}
      />

      {/* Inner circular container */}
      <Box
        sx={{
          position: "relative",
          width: "85%",
          height: "85%",
          borderRadius: "50%",
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
          boxShadow: theme.shadows[4],
        }}
      >
        {/* Loading spinner overlay */}
        {isImageLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(4px)",
              zIndex: 2,
            }}
          >
            <CircularProgress size={44} thickness={4} />
          </Box>
        )}

        {/* Actual Avatar */}
        <Fade in={true}>
          <Avatar
            ref={avatarRef}
            src={imageUrl}
            onLoad={handleImageLoad}
            sx={{
              width: "92%",
              height: "92%",
              background: !imageUrl ? getAvatarGradient() : undefined,
              fontSize: !imageUrl ? "2.2rem" : undefined,
              fontWeight: !imageUrl ? "bold" : undefined,
              transition: "all 0.3s ease",
              opacity: isDragging && isEditing ? 0.7 : 1,
              transform: isDragging && isEditing ? "scale(0.95)" : "scale(1)",
              animation: isImageLoading ? "pulse 1.5s infinite" : "none",
              "@keyframes pulse": {
                "0%": {
                  boxShadow: `0 0 0 0 ${alpha(
                    theme.palette.primary.main,
                    0.7
                  )}`,
                },
                "70%": {
                  boxShadow: `0 0 0 10px ${alpha(
                    theme.palette.primary.main,
                    0
                  )}`,
                },
                "100%": {
                  boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
                },
              },
            }}
          >
            {!imageUrl && getNameInitials()}
          </Avatar>
        </Fade>
      </Box>

      {/* Drag Overlay */}
      {isEditing && isDragging && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
            animation: "pulse 1.5s infinite",
            zIndex: 3,
            "@keyframes pulse": {
              "0%": { opacity: 0.6 },
              "50%": { opacity: 0.9 },
              "100%": { opacity: 0.6 },
            },
          }}
        >
          <CloudUploadIcon
            sx={{
              color: "white",
              fontSize: 48,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
            }}
          />
        </Box>
      )}

      {/* Delete button */}
      {isEditing && imageUrl && (
        <IconButton
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bgcolor: theme.palette.error.main,
            color: "white",
            border: `2px solid ${theme.palette.background.paper}`,
            "&:hover": {
              bgcolor: theme.palette.error.dark,
              transform: "rotate(90deg)",
            },
            width: 32,
            height: 32,
            transition: "all 0.3s ease",
            boxShadow: theme.shadows[4],
            zIndex: 4, // Above all other overlays
          }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFile(null);
            setImageUrl(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        >
          <CancelIcon sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default ProfileAvatar;
