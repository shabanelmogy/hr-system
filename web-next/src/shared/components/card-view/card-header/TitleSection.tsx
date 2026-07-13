import React from "react";
import { Avatar, Box, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import { ViewModule } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export interface TitleSectionProps {
  title: string;
  subtitle?: string;
  mainChipLabel: string;
  page: number; // zero-based
}

export const TitleSection: React.FC<TitleSectionProps> = ({ title, subtitle, mainChipLabel, page }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
      <Avatar
        sx={{
          bgcolor: theme.palette.primary.main,
          width: 48,
          height: 48,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <ViewModule sx={{ fontSize: 24 }} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h4"
          sx={{
            color: "primary.main",
            fontWeight: "bold"
          }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" sx={{
            color: "text.secondary"
          }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1}>
        <Chip label={mainChipLabel} color="primary" variant="outlined" />
        <Chip label={`${t("general.page")}: ${page + 1}`} color="warning" variant="outlined" size="small" />
      </Stack>
    </Stack>
  );
};
