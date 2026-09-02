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
        // Keep a clear separation between the dialog header and the first field.
        // The extra top inset also leaves room for the first field's validation
        // helper text without making the controls themselves overly spaced.
        pt: 4,
        pb: 2.5,
        px: 3,
        // MUI applies a more-specific adjacent-title rule that resets the
        // first content padding to 0. Repeat the generated class so this
        // shared inset wins for every dialog variant.
        "&&&": {
          paddingTop: 4,
        },
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
        "& .MuiTextField-root": {
          // MyTextField defaults to MUI's `normal` margin (16px top). Reset it
          // here so the shared form controls own one predictable vertical gap.
          mt: 0,
          mb: 2,
          "& .MuiFormHelperText-root": {
            mt: 0.5,
            mb: 0.5,
            lineHeight: 1.35,
          },
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
        // MySelect renders an Autocomplete TextField inside a FormControl. Keep
        // its spacing aligned with MyTextField without doubling the margin.
        "& .MuiFormControl-root": {
          mb: 2,
          "& .MuiTextField-root": { mt: 0, mb: 0 },
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
