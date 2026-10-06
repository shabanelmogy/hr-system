import { Download, Publish, Refresh } from "@mui/icons-material";
import { Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatCrystalReportBytes } from "./files";
import { canPublishCrystalReportVersion, canRevalidateCrystalReportVersion } from "./lifecycle";
import type { CrystalReportVersion } from "./types";

interface Props {
  versions: CrystalReportVersion[];
  reportArchived: boolean;
  canDownloadVersion: boolean;
  canUpload: boolean;
  canPublish: boolean;
  locked: boolean;
  onDownload: (versionId: string) => void;
  onRevalidate: (versionId: string) => void;
  onPublish: (versionId: string) => void;
}

export function CrystalReportVersionList({
  versions,
  reportArchived,
  canDownloadVersion,
  canUpload,
  canPublish,
  locked,
  onDownload,
  onRevalidate,
  onPublish,
}: Props) {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.25}>
      {versions.map((item) => (
        <Box key={item.id} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <Typography sx={{ minWidth: 58 }}>v{item.versionNumber}</Typography>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography>{item.summaryTitle || item.originalFileName}</Typography>
            {item.summarySubject && <Typography variant="caption" color="text.secondary">{item.summarySubject}</Typography>}
            {item.validationReason && <Typography variant="caption" color="error" sx={{ display: "block" }}>{item.validationReason}</Typography>}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {t("crystalReports.sourceIdentity", { fileName: item.originalFileName, size: formatCrystalReportBytes(item.size) })}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
              {t("crystalReports.sourceHash", { hash: item.sha256 })}
            </Typography>
            {item.validationContractSchemaVersion !== null && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>
                {t("crystalReports.validationEvidence", {
                  schemaVersion: item.validationContractSchemaVersion,
                  fingerprint: item.validationContractFingerprint ?? "—",
                })}
              </Typography>
            )}
            {item.validationStatus !== "Valid" && (
              <Typography variant="caption" color="warning.main" sx={{ display: "block" }}>
                {t("crystalReports.publishRequiresValid")}
              </Typography>
            )}
          </Box>
          <Chip
            size="small"
            label={t(`crystalReports.validationStates.${item.validationStatus}`)}
            color={item.validationStatus === "Invalid"
              ? "error"
              : item.validationStatus === "NeedsRevalidation"
                ? "warning"
                : item.validationStatus === "Valid"
                  ? "success"
                  : "default"}
          />
          {item.isPublished && <Chip size="small" color="primary" label={t("crystalReports.published")} />}
          {canDownloadVersion && !reportArchived && (
            <IconButton aria-label={t("crystalReports.download")} disabled={locked} onClick={() => onDownload(item.id)}>
              <Download />
            </IconButton>
          )}
          {canRevalidateCrystalReportVersion(canUpload, reportArchived) && (
            <Button size="small" startIcon={<Refresh />} disabled={locked} onClick={() => onRevalidate(item.id)}>
              {t("crystalReports.revalidate")}
            </Button>
          )}
          {canPublish && !reportArchived && (
            <Button
              size="small"
              startIcon={<Publish />}
              disabled={locked || !canPublishCrystalReportVersion(item.validationStatus, canPublish, reportArchived)}
              onClick={() => onPublish(item.id)}
            >
              {t("crystalReports.publish")}
            </Button>
          )}
        </Box>
      ))}
    </Stack>
  );
}
