import React from "react";
import { LinearProgress, Stack, Typography, alpha, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import { getQualityInfo } from "@/shared/utils/quality";

// QualityMeter: label + progress with dynamic color and level text
export const QualityMeter: React.FC<{
  score: number; // 0-100
  title?: string;
}> = ({ score }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const qualityInfo = getQualityInfo(score, theme);

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: "bold"
          }}>
          {t("general.dataQuality")}
        </Typography>
        <Typography variant="caption" color={qualityInfo.color} sx={{ fontWeight: "bold" }}>
          {t(`general.${qualityInfo.key}`)?.toUpperCase()}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, score))}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.grey[300], 0.3),
          "& .MuiLinearProgress-bar": { borderRadius: 3, backgroundColor: qualityInfo.color },
        }}
      />
    </Box>
  );
};
