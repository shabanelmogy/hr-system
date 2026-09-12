"use client";

import { Box, CircularProgress, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { useQueryErrorNotification } from "@/shared/hooks";
import LocalizationDataGrid from "../components/LocalizationDataGrid";
import { useLocalizationQuery } from "../hooks/useLocalizationQueries";

export default function LocalizationPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentCulture = theme.direction === "rtl" ? "ar-EG" : "en-US";
  const { data: rows = [], isLoading, error } =
    useLocalizationQuery(currentCulture);

  useQueryErrorNotification(error, { enabled: !isLoading });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ContentWrapper>
      <PageHeader
        title={t("localizationApi.title")}
        subTitle={t("localizationApi.subTitle")}
      />
      <LocalizationDataGrid culture={currentCulture} rows={rows} />
    </ContentWrapper>
  );
}
