import { Add, Edit, Save } from "@mui/icons-material";
import React from "react";
import { DialogContent, Box, useTheme, alpha } from "@mui/material";
import { MyOverlayLoader } from "@/shared/components/loaders";
import { useFormContext } from "./FormContext";

const getFormOverlayIcon = (actionType?: string | null) => {
  switch (actionType) {
    case "create":
      return <Add sx={{ fontSize: 48, color: "#2196f3", mb: 1 }} />;
    case "update":
      return <Edit sx={{ fontSize: 48, color: "#ff9800", mb: 1 }} />;
    default:
      return <Save sx={{ fontSize: 48, color: "#4caf50", mb: 1 }} />;
  }
};

export const FormContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const { 
    hideFooter, 
    variant, 
    isSubmitting, 
    overlayActionType, 
    overlayMessage,
    dialogContentRef 
  } = useFormContext();

  return (
    <DialogContent
      ref={dialogContentRef}
      aria-busy={isSubmitting}
      sx={{
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        pt: 3,
        pb: hideFooter ? 3 : 3,
        px: 3,
        position: "relative",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(
                theme.palette.background.default,
                0.8
              )} 0%, ${alpha(
                theme.palette.background.paper,
                0.9
              )} 50%, ${alpha(theme.palette.background.default, 0.8)} 100%)`
            : theme.palette.background.paper,
        borderRadius: hideFooter
          ? variant === "glassmorphic"
            ? "0 0 20px 20px"
            : "0 0 12px 12px"
          : "0",
        "&::-webkit-scrollbar": { width: "10px" },
        "&::-webkit-scrollbar-track": {
          background: alpha(
            theme.palette.divider,
            theme.palette.mode === "dark" ? 0.2 : 0.1
          ),
          borderRadius: "5px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: alpha(
            theme.palette.primary.main,
            theme.palette.mode === "dark" ? 0.5 : 0.3
          ),
          borderRadius: "5px",
          "&:hover": {
            background: alpha(
              theme.palette.primary.main,
              theme.palette.mode === "dark" ? 0.7 : 0.5
            ),
          },
        },
        scrollbarWidth: "thin",
        scrollbarColor: `${alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.5 : 0.3
        )} ${alpha(
          theme.palette.divider,
          theme.palette.mode === "dark" ? 0.2 : 0.1
        )}`,
        "& .MuiTextField-root": {
          mb: 2.5,
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: `0 4px 12px ${alpha(
                theme.palette.primary.main,
                0.1
              )}`,
            },
            "&.Mui-focused": {
              boxShadow: `0 4px 16px ${alpha(
                theme.palette.primary.main,
                0.2
              )}`,
            },
          },
        },
      }}
    >
      {isSubmitting && (
        <MyOverlayLoader
          open={true}
          customIcon={getFormOverlayIcon(overlayActionType)}
          message={overlayMessage || "Saving..."}
        />
      )}

      <Box
        sx={{
          opacity: isSubmitting ? 0.5 : 1,
          transition: "opacity 0.3s ease",
          pointerEvents: isSubmitting ? "none" : "auto",
          width: "100%",
        }}
      >
        {children}
      </Box>
    </DialogContent>
  );
};
