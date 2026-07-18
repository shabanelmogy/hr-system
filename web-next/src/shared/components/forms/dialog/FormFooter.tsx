import React from "react";
import { Box, DialogActions, Button, CircularProgress, useTheme, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "./FormContext";
import { getFormModeIcon } from "./formModeIcon";

export const FormFooter: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { 
    hideFooter, 
    variant, 
    footerLeft, 
    onClose, 
    isSubmitting,
    icon, 
    isViewMode,
    submitButtonText,
  } = useFormContext();

  if (hideFooter) return null;

  return (
    <Box
      sx={{
        background: theme.palette.background.paper,
        borderTop: `1px solid ${alpha(
          theme.palette.divider,
          theme.palette.mode === "dark" ? 0.3 : 0.2
        )}`,
        borderRadius:
          variant === "glassmorphic" ? "0 0 20px 20px" : "0 0 12px 12px",
      }}
    >
      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5, margin: 0, justifyContent: "space-between" }}>
        {/* Left side — optional slot (e.g. mock data button) */}
        <Box>{footerLeft}</Box>

        {/* Right side — Cancel + Save */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            variant="outlined"
            type="button"
            sx={{
              minWidth: 100,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 500,
              borderColor: alpha(theme.palette.divider, 0.5),
              color: theme.palette.text.secondary,
              "&:hover": {
                borderColor: theme.palette.divider,
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              },
            }}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                getFormModeIcon(icon, Boolean(isViewMode))
              )
            }
            sx={{
              minWidth: 120,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 12px ${alpha(
                theme.palette.primary.main,
                0.3
              )}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(
                  theme.palette.primary.main,
                  0.4
                )}`,
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "translateY(0px)" },
              "&.Mui-disabled": {
                background: alpha(theme.palette.action.disabled, 0.1),
                color: alpha(theme.palette.action.disabled, 0.6),
              },
              transition: "all 0.3s ease",
            }}
          >
            {isSubmitting ? t("actions.submitting") : submitButtonText}
          </Button>
        </Box>
      </DialogActions>
    </Box>
  );
};
