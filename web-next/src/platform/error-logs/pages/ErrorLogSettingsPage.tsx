"use client";

import dynamic from "next/dynamic";
import TuneIcon from "@mui/icons-material/Tune";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HistoryIcon from "@mui/icons-material/History";
import QueueIcon from "@mui/icons-material/Queue";
import ReportProblemIcon from "@mui/icons-material/ReportProblemOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import { Button, CircularProgress, Grid } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { FeedbackState } from "@/shared/components/feedback/states";
import { MetricCard } from "@/shared/components/cards";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { permissions } from "@/lib/auth/permissions";
import { useErrorLogSettings } from "../hooks/useErrorLogs";

const ErrorLogSettingsDialog = dynamic(() => import("../components/ErrorLogSettingsDialog").then((module) => module.ErrorLogSettingsDialog));

export default function ErrorLogSettingsPage() {
  const { t } = useTranslation();
  const { hasPermission, isReadOnly } = usePermissions();
  const { query, mutation, allowed } = useErrorLogSettings();
  const [editing, setEditing] = useState(false);
  const canEdit = allowed && !isReadOnly && hasPermission(permissions.EditErrorLogSettings);
  if (!allowed) return <FeedbackState icon={<TuneIcon />} title={t("errorLogSettings.forbidden")} />;
  const settings = query.data;
  return <ContentWrapper>
    <PageHeader title={t("errorLogSettings.title")} subTitle={t("errorLogSettings.subtitle")} />
    {query.isPending ? <FeedbackState icon={<CircularProgress />} title={t("errorLogSettings.loading")} /> : null}
    {query.isError ? <FeedbackState icon={<TuneIcon />} title={t("errorLogSettings.loadFailed")} role="alert"
      actions={<Button onClick={() => void query.refetch()}>{t("errorLogSettings.reload")}</Button>} /> : null}
    {settings ? <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <MetricCard title={t("errorLogSettings.retentionDays")} value={settings.retentionDays} icon={ScheduleIcon}
          showTrend={false} gradient={false} size="large" variant="outlined" elevation={0}
          description={t("errorLogSettings.helper")} sx={{ height: "100%" }}
          footerContent={canEdit ? <Button variant="contained" startIcon={<TuneIcon />} onClick={() => setEditing(true)}>{t("errorLogSettings.edit")}</Button> : undefined} />
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Grid container spacing={2}>
          {([
            { label: "revision", value: settings.revision, icon: HistoryIcon, color: "info" },
            { label: "queueDepth", value: settings.queueDepth, icon: QueueIcon, color: "primary" },
            { label: "droppedCount", value: settings.droppedCount, icon: ReportProblemIcon, color: settings.droppedCount > 0 ? "warning" : "success" },
            { label: "failedWrites", value: settings.failedWrites, icon: StorageIcon, color: settings.failedWrites > 0 ? "error" : "success" },
          ] as const).map(({ label, value, icon, color }) => <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <MetricCard title={t(`errorLogSettings.${label}`)} value={value} icon={icon} color={color}
              showTrend={false} gradient={false} size="small" variant="outlined" elevation={0} sx={{ height: "100%" }} />
          </Grid>)}
        </Grid>
      </Grid>
    </Grid> : null}
    {editing && canEdit && settings ? <ErrorLogSettingsDialog settings={settings} onClose={() => setEditing(false)}
      onSave={(days, revision) => mutation.mutateAsync({ retentionDays: days, expectedRevision: revision })}
      onReload={async () => (await query.refetch()).data} /> : null}
  </ContentWrapper>;
}
