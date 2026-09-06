import React, { useState } from "react";
import { DialogTitle, Box, Typography, IconButton, ButtonBase, Popover, useTheme, alpha } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useFormContext } from "./FormContext";
import { getFormModeIcon } from "./formModeIcon";
import { getFormErrorSummary } from "./formErrorSummary";

export const FormHeader: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { title, subtitle, variant, icon, recordId, errors, errorLabels, onClose, isSubmitting, isViewMode } = useFormContext();
  const [errorAnchor, setErrorAnchor] = useState<HTMLElement | null>(null);
  const errorSummary = getFormErrorSummary(errors || {}, errorLabels);
  const errorCount = errorSummary.length;

  return (
    <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        pb: 2,
        pt: 2.5,
        px: 3,
        background: theme.palette.background.paper,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        borderRadius:
          variant === "glassmorphic" ? "20px 20px 0 0" : "12px 12px 0 0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 4px 12px ${alpha(
              theme.palette.primary.main,
              0.3
            )}`,
          }}
        >
          {getFormModeIcon(icon, Boolean(isViewMode))}
        </Box>
        <Box>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
                opacity: 0.8
              }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5
        }}>
        {recordId != null && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: "20px",
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.secondary.main,
                0.1
              )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: theme.palette.secondary.contrastText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                boxShadow: `0 2px 8px ${alpha(
                  theme.palette.secondary.main,
                  0.3
                )}`,
              }}
            >
              #
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                fontFamily: "monospace",
                letterSpacing: 0.5,
              }}
            >
              {recordId}
            </Typography>
          </Box>
        )}

        {errorCount > 0 && (
          <ButtonBase
            type="button"
            aria-label={t("common.reviewValidationErrors", { count: errorCount })}
            aria-haspopup="dialog"
            aria-expanded={Boolean(errorAnchor)}
            onClick={(event) => setErrorAnchor(event.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 2,
              py: 0.5,
              borderRadius: "16px",
              background: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              animation: "pulse 2s infinite",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.error.main,
                fontWeight: 600,
              }}
            >
              {t("common.validationErrorCount", { count: errorCount })}
            </Typography>
          </ButtonBase>
        )}

        <Popover
          open={Boolean(errorAnchor)}
          anchorEl={errorAnchor}
          onClose={() => setErrorAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2, width: 320, maxWidth: "calc(100vw - 32px)" }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              {t("common.validationErrors")}
            </Typography>
            {errorSummary.map((error) => (
              <Box key={error.field} sx={{ mb: 1, "&:last-child": { mb: 0 } }}>
                <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
                  {error.label}
                </Typography>
                <Typography variant="body2" color="error.main">
                  {error.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Popover>

        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          type="button"
          aria-label="Close"
          title="Close"
          sx={{
            color: theme.palette.grey[500],
            "&:hover": {
              color: theme.palette.grey[700],
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
  );
};
