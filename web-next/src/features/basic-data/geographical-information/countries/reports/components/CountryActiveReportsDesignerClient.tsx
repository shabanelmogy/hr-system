"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DownloadOutlined, RestartAlt } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { Designer } from "@mescius/activereportsjs-react";

const STARTER_TEMPLATE_URI = "/reports/countries/countries-directory.rdlx-json";

function reportDefinitionFrom(value: unknown): unknown {
  if (value && typeof value === "object" && "definition" in value) {
    return (value as { definition: unknown }).definition;
  }

  return value;
}

function downloadJsonFile(content: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
}

const CountryActiveReportsDesignerClient = () => {
  const { t } = useTranslation();
  const designerRef = useRef<Designer>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const downloadTemplate = useCallback(async () => {
    try {
      const designer = designerRef.current;
      if (!designer) return;

      const report = await designer.getReport();
      downloadJsonFile(
        reportDefinitionFrom(report),
        "countries-directory.rdlx-json",
      );
      setDownloadError(false);
    } catch {
      setDownloadError(true);
    }
  }, []);

  const restoreStarterTemplate = useCallback(() => {
    void designerRef.current?.setReport({
      id: STARTER_TEMPLATE_URI,
      displayName: t("countries.activeReports.starterTemplateName"),
    });
    setHasUnsavedChanges(false);
    setDownloadError(false);
  }, [t]);

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 1.5,
        minHeight: 0,
        p: { xs: 1, sm: 1.5 },
      }}
    >
      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography component="h2" variant="subtitle1">
            {t("countries.activeReports.designerTitle")}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {t("countries.activeReports.designerDescription")}
          </Typography>
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Button
            onClick={() => void downloadTemplate()}
            startIcon={<DownloadOutlined />}
            variant="outlined"
          >
            {t("countries.activeReports.downloadTemplate")}
          </Button>
          <Button
            color="inherit"
            onClick={restoreStarterTemplate}
            startIcon={<RestartAlt />}
            variant="outlined"
          >
            {t("countries.activeReports.restoreStarterTemplate")}
          </Button>
        </Stack>
      </Stack>

      {hasUnsavedChanges ? (
        <Alert severity="warning">
          {t("countries.activeReports.unsavedChanges")}
        </Alert>
      ) : null}

      {downloadError ? (
        <Alert severity="error">{t("countries.activeReports.downloadError")}</Alert>
      ) : null}

      <Alert severity="info">
        {t("countries.activeReports.dataSourceGuidance")}
      </Alert>

      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 640, md: 720 },
          overflow: "auto",
          "& > div": { minWidth: 960 },
        }}
      >
        <Designer
          ref={designerRef}
          documentChanged={(event) => setHasUnsavedChanges(Boolean(event.isDirty))}
          report={{
            id: STARTER_TEMPLATE_URI,
            displayName: t("countries.activeReports.starterTemplateName"),
          }}
        />
      </Box>
    </Box>
  );
};

export default CountryActiveReportsDesignerClient;
