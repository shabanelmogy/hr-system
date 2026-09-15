"use client";

import { publicApiUrl } from "@/config/publicEnv";
import { Alert, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ExternalToolFrameProps {
  path: string;
  title: string;
  height?: string;
}

export default function ExternalToolFrame({
  path,
  title,
  height = "calc(100vh - 150px)",
}: ExternalToolFrameProps) {
  const { t } = useTranslation();
  if (!publicApiUrl) {
    return <Alert severity="error">{t("externalTools.apiUrlRequired")}</Alert>;
  }

  return (
    <Box sx={{ flex: 1, height, m: 0, p: 0 }}>
      <iframe
        width="100%"
        height="100%"
        src={`${publicApiUrl}${path}`}
        style={{ border: "none" }}
        title={title}
      />
    </Box>
  );
}
