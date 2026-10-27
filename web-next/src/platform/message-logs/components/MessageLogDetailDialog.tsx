"use client";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import { MyForm, FormSection, CopyButton } from "@/shared/components/forms";
import { DetailFields } from "@/shared/components/data-display";
import { EmptyState } from "@/shared/components/feedback";
import { SafeHtmlPreview } from "@/shared/components/preview";
import { useMessageLogDetail } from "../hooks/useMessageLogs";
import type { MessageLogRow } from "../types/messageLogs";
import { messageSnapshotText } from "../utils/messageLogReport";

export function MessageLogDetailDialog({ row, onClose }: { row: MessageLogRow; onClose: () => void }) {
  const { t, i18n } = useTranslation(); const query = useMessageLogDetail(row.id); const detail = !query.isError ? query.data : undefined;
  const entry = detail?.entry;
  const fields = entry ? [
    { id: "subject", label: t("messageLogs.subject"), value: entry.subject, fullWidth: true },
    { id: "recipient", label: t("messageLogs.recipient"), value: entry.recipient, direction: "ltr" as const },
    { id: "type", label: t("messageLogs.type"), value: t("messageLogs.email") },
    { id: "template", label: t("messageLogs.template"), value: t(`messageLogs.templates.${entry.templateId}`) },
    { id: "language", label: t("messageLogs.language"), value: t(`messageLogs.languages.${entry.language}`) },
    { id: "started", label: t("messageLogs.started"), value: new Date(entry.startedOnUtc).toLocaleString(i18n.language) },
    { id: "utc", label: t("messageLogs.startedUtc"), value: entry.startedOnUtc, direction: "ltr" as const },
    { id: "completed", label: t("messageLogs.completed"), value: entry.completedOnUtc ? new Date(entry.completedOnUtc).toLocaleString(i18n.language) : null },
    { id: "duration", label: t("messageLogs.duration"), value: entry.durationMs },
    { id: "status", label: t("messageLogs.status"), value: t(`messageLogs.statuses.${entry.status}`) },
    { id: "phase", label: t("messageLogs.phase"), value: t(`messageLogs.phases.${entry.phase}`) },
    { id: "cause", label: t("messageLogs.cause"), value: entry.cause ? t(`messageLogs.causes.${entry.cause}`) : null },
    { id: "smtp", label: t("messageLogs.smtpCode"), value: entry.smtpStatusCode },
    { id: "correlation", label: t("messageLogs.correlation"), value: entry.correlationId, direction: "ltr" as const, fullWidth: true },
  ] : [];
  const report = fields.map(field => `${field.label}: ${field.value ?? t("messageLogs.notAvailable")}`).join("\n") +
    `\n\n${t("messageLogs.snapshot")}:\n${messageSnapshotText(detail?.snapshotHtml ?? null) || t("messageLogs.noSnapshot")}`;
  return <MyForm open isViewMode onClose={onClose} title={t("messageLogs.detailTitle")} subtitle={row.id} icon={<EmailOutlined />} maxWidth="lg"
    footerLeft={entry ? <CopyButton text={report} label={t("messageLogs.copyDetails")} /> : null}>
    {query.isPending ? <CircularProgress aria-label={t("general.loading")} /> : null}
    {query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>{t("messageLogs.retry")}</Button>}>{t("messageLogs.loadFailed")}</Alert> : null}
    {entry && detail ? <Stack spacing={2}>
      <Alert severity="info">{t("messageLogs.acceptanceHint")}</Alert>
      <FormSection title={t("messageLogs.detailTitle")} variant="outlined"><DetailFields items={fields} emptyValue={t("messageLogs.notAvailable")} /></FormSection>
      <FormSection title={t("messageLogs.snapshot")} variant="outlined">
        <Alert severity="info">{t("messageLogs.snapshotHint")}</Alert>
        {entry.snapshotTruncated ? <Alert severity="warning">{t("messageLogs.truncated")}</Alert> : null}
        {detail.snapshotHtml ? <SafeHtmlPreview html={detail.snapshotHtml} title={t("messageLogs.snapshot")} scrollable /> : <EmptyState title={t("messageLogs.noSnapshot")} />}
      </FormSection>
    </Stack> : null}
  </MyForm>;
}
