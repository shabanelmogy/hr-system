import { Download, FileUpload, Lock, Save } from "@mui/icons-material";
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import { showToast } from "@/shared/components/feedback/transient";
import { canUseCrystalReportFile, downloadCrystalReportBlob } from "./files";
import { getCrystalReportEntityLabel } from "./entityLabels";
import { crystalReportService } from "./services";
import { CrystalReportVersionList } from "./CrystalReportVersionList";
import type { CrystalReportAccessGrant, CrystalReportCapabilities, CrystalReportDetail, CrystalReportRight, CrystalReportRoleOption } from "./types";

const RIGHTS: CrystalReportRight[] = ["Run", "Download", "Upload", "Publish"];

interface Props {
  report: CrystalReportDetail;
  roles: CrystalReportRoleOption[];
  can: CrystalReportCapabilities;
  busy: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void>;
  onChanged: () => Promise<void>;
  guard: (allowed: boolean) => boolean;
}

export function CrystalReportDetailDialog({ report, roles, can, busy, onClose, onRefresh, onChanged, guard }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [grants, setGrants] = useState<CrystalReportAccessGrant[]>(report.access);
  const [file, setFile] = useState<File | null>(null);
  const [mutationBusy, setMutationBusy] = useState(false);
  const locked = busy || mutationBusy;

  const roleOptions = can.access
    ? roles
    : report.access
      .map((grant) => ({ roleId: grant.roleId, roleName: grant.roleName }))
      .filter((role): role is { roleId: string; roleName: string } => Boolean(role.roleName))
      .map((role) => ({ id: role.roleId, name: role.roleName }));

  const updateGrant = (roleId: string, right: CrystalReportRight, checked: boolean) => {
    if (locked) return;
    setGrants((current) => {
      const existing = current.find((grant) => grant.roleId === roleId);
      const prior = existing?.rights ?? [];
      const rights = checked ? [...new Set([...prior, right])] : prior.filter((item) => item !== right);
      const roleName = existing?.roleName ?? roles.find((role) => role.id === roleId)?.name;
      return [
        ...current.filter((grant) => grant.roleId !== roleId),
        ...(rights.length && roleName ? [{ roleId, roleName, rights }] : []),
      ];
    });
  };

  const refreshAfterConflict = async (cause: unknown, fallbackKey: string) => {
    if (cause instanceof ApiClientError && cause.status === 409) {
      await Promise.all([onRefresh(), onChanged()]);
      showToast.warning(t("crystalReports.conflictReloaded"));
      return;
    }
    showToast.error(cause, t(fallbackKey));
  };

  const runMutation = async (operation: () => Promise<void>, fallbackKey: string) => {
    if (mutationBusy) return;
    setMutationBusy(true);
    try {
      await operation();
    } catch (cause) {
      await refreshAfterConflict(cause, fallbackKey);
    } finally {
      setMutationBusy(false);
    }
  };

  const upload = () => {
    if (report.isArchived || !guard(can.upload) || !canUseCrystalReportFile(file)) return;
    void runMutation(async () => {
      await crystalReportService.uploadVersion(report.id, file);
      setFile(null);
      showToast.success(t("crystalReports.versionUploaded"));
      await Promise.all([onRefresh(), onChanged()]);
    }, "crystalReports.uploadError");
  };

  const publish = (versionId: string) => {
    if (report.isArchived || !guard(can.publish)) return;
    void runMutation(async () => {
      await crystalReportService.publishVersion(report.id, versionId, report.rowVersion);
      showToast.success(t("crystalReports.published"));
      await Promise.all([onRefresh(), onChanged()]);
    }, "crystalReports.publishError");
  };

  const revalidate = (versionId: string) => {
    if (report.isArchived || !guard(can.upload)) return;
    void runMutation(async () => {
      const result = await crystalReportService.revalidateVersion(report.id, versionId);
      showToast.success(t("crystalReports.revalidationCompleted", {
        status: t(`crystalReports.validationStates.${result.validationStatus}`),
      }));
      await Promise.all([onRefresh(), onChanged()]);
    }, "crystalReports.revalidationError");
  };

  const saveAccess = () => {
    if (!guard(can.access)) return;
    void runMutation(async () => {
      await crystalReportService.saveAccess(report.id, grants, report.rowVersion);
      showToast.success(t("crystalReports.accessSaved"));
      await onRefresh();
    }, "crystalReports.accessError");
  };

  return (
    <Dialog open onClose={locked ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{report.displayName}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable">
          <Tab label={t("crystalReports.overview")} />
          <Tab label={t("crystalReports.versions")} />
          <Tab label={t("crystalReports.permissions")} />
        </Tabs>
        <Divider sx={{ mb: 2 }} />

        {tab === 0 && (
          <Stack spacing={1}>
            <Typography><b>{t("crystalReports.entity")}:</b> {getCrystalReportEntityLabel(t, report.entityKey)}</Typography>
            <Typography><b>{t("crystalReports.reportKey")}:</b> {report.reportKey}</Typography>
            <Typography>{report.description || "—"}</Typography>
            <Stack direction="row" spacing={1}>
              {can.download && report.isPublished && !report.isArchived && (
                <Button
                  startIcon={<Download />}
                  disabled={locked}
                  onClick={() => {
                    if (!guard(can.download)) return;
                    void crystalReportService.download(report.id)
                      .then(({ blob, fileName }) => downloadCrystalReportBlob(blob, fileName))
                      .catch((cause) => showToast.error(cause, t("crystalReports.downloadError")));
                  }}
                >
                  {t("crystalReports.download")}
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={1.25}>
            <CrystalReportVersionList
              versions={report.versions}
              reportArchived={report.isArchived}
              canDownloadVersion={can.downloadVersion}
              canUpload={can.upload}
              canPublish={can.publish}
              locked={locked}
              onDownload={(versionId) => {
                if (!guard(can.downloadVersion)) return;
                void crystalReportService.downloadVersion(report.id, versionId)
                  .then(({ blob, fileName }) => downloadCrystalReportBlob(blob, fileName))
                  .catch((cause) => showToast.error(cause, t("crystalReports.downloadError")));
              }}
              onRevalidate={revalidate}
              onPublish={publish}
            />

            {can.upload && !report.isArchived && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button component="label" variant="outlined" startIcon={<FileUpload />} disabled={locked}>
                  {file?.name ?? t("crystalReports.selectNewVersion")}
                  <input hidden type="file" accept=".rpt" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
                </Button>
                <Button variant="contained" disabled={locked || !canUseCrystalReportFile(file)} onClick={upload}>
                  {t("crystalReports.upload")}
                </Button>
                <Typography variant="caption" color="text.secondary">{t("crystalReports.summaryInfoHint")}</Typography>
              </Stack>
            )}
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={1}>
            {!can.access && <Alert severity="info" icon={<Lock />}>{t("crystalReports.accessReadOnly")}</Alert>}
            {can.viewAccess && roleOptions.map((role) => {
              const selected = grants.find((grant) => grant.roleId === role.id)?.rights ?? [];
              return (
                <Box key={role.id} sx={{ borderBottom: 1, borderColor: "divider", py: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{role.name}</Typography>
                  <Stack direction="row" sx={{ flexWrap: "wrap" }}>
                    {RIGHTS.map((right) => (
                      <FormControlLabel
                        key={right}
                        control={(
                          <Checkbox
                            checked={selected.includes(right)}
                            disabled={!can.access || locked}
                            onChange={(event) => updateGrant(role.id, right, event.target.checked)}
                          />
                        )}
                        label={t(`crystalReports.rights.${right}`)}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })}
            {can.access && (
              <Button variant="contained" startIcon={<Save />} disabled={locked} onClick={saveAccess}>
                {t("actions.save")}
              </Button>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose} disabled={locked}>{t("actions.close")}</Button></DialogActions>
    </Dialog>
  );
}
