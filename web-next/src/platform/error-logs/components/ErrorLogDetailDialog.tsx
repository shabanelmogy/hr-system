"use client";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CopyButton, FormSection, MyForm } from "@/shared/components/forms";
import { EmptyState } from "@/shared/components/feedback";
import { DetailFields } from "@/shared/components/data-display";
import { useErrorLogDetail } from "../hooks/useErrorLogs";
import type { ErrorLogRow, ErrorLogScope } from "../types/errorLogs";
import { formatErrorLogDetails, getErrorLogDetailGroups } from "../utils/errorLogDetails";

export function ErrorLogDetailDialog({ row, scope, onClose }: {
  row: ErrorLogRow; scope: ErrorLogScope; onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const detail = useErrorLogDetail(scope, row.id, true);
  const entry = !detail.isError ? detail.data?.entry : undefined;
  const occurred = entry ? new Date(entry.occurredOnUtc).toLocaleString(i18n.language) : "";
  const report = entry && detail.data ? formatErrorLogDetails(detail.data, scope, occurred, key => t(key)) : "";
  return <MyForm open onClose={onClose} title={t("errorLogs.detailTitle")} subtitle={row.id}
    icon={<ErrorOutlineIcon />} isViewMode maxWidth="lg"
    footerLeft={entry ? <CopyButton key={entry.id} text={report} label={t("errorLogs.copyMessage")} /> : null}>
    {detail.isPending ? <CircularProgress aria-label={t("errorLogs.loading")} /> : null}
    {detail.isError ? <Alert severity="error" action={<Button onClick={() => void detail.refetch()}>{t("errorLogs.retry")}</Button>}>{t("errorLogs.loadFailed")}</Alert> : null}
    {entry ? <Stack spacing={2.5} sx={{ minWidth: 0 }}>
      <FormSection variant="outlined" title={t("errorLogs.message")} icon={<ErrorOutlineIcon />}
        action={<Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip size="small" variant="outlined" label={t(`errorLogs.sources.${entry.source}`)} />
          <Chip size="small" color={entry.severity === "warning" ? "warning" : "error"} label={t(`errorLogs.severities.${entry.severity}`)} />
        </Stack>}>
        <Typography component="p" dir="auto" sx={{ m: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.8 }}>{entry.summary}</Typography>
      </FormSection>
      {getErrorLogDetailGroups(entry, scope, occurred).map(group => <FormSection key={group.id} variant="outlined"
        title={t(group.titleKey)} icon={group.id === "user" ? <PersonOutlineIcon /> : <SettingsOutlinedIcon />}>
        <DetailFields emptyValue={t("errorLogs.notAvailable")} items={group.fields.map(field => ({ ...field, label: t(field.labelKey) }))} />
      </FormSection>)}
      {scope === "system" ? <FormSection variant="outlined" title={t("errorLogs.diagnostics")} icon={<CodeOutlinedIcon />}>
        {detail.data?.diagnostics.length ? <Box component="pre" dir="ltr" tabIndex={0} aria-label={t("errorLogs.diagnostics")}
          sx={{ m: 0, p: 2, minWidth: 0, maxWidth: "100%", maxHeight: "45vh", overflow: "auto", bgcolor: "action.hover",
            borderRadius: 1, fontFamily: "monospace", fontSize: "0.875rem", lineHeight: 1.8, whiteSpace: "pre-wrap", overflowWrap: "anywhere", textAlign: "start" }}>
          {detail.data.diagnostics.join("\n")}
        </Box> : <EmptyState title={t("errorLogs.diagnosticsEmpty")} subtitle={t("errorLogs.diagnosticsEmptyHint")} />}
      </FormSection> : null}
    </Stack> : null}
    {!entry && !detail.isPending && !detail.isError ? <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><ErrorOutlineIcon />{t("errorLogs.notFound")}</Box> : null}
  </MyForm>;
}
