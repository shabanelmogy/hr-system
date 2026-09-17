"use client";

import { Add, Archive, Download, FolderOpen, Refresh, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Chip, MenuItem, Stack, TextField } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridRowParams } from "@mui/x-data-grid";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { permissions } from "@/lib/auth/permissions";
import { ApiClientError } from "@/lib/api/client";
import { showToast } from "@/shared/components/feedback/transient";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { downloadCrystalReportBlob } from "./files";
import { crystalReportService } from "./services";
import type { CrystalReportCapabilities, CrystalReportDetail, CrystalReportListItem, CrystalReportRoleOption, CrystalReportStatus, ImportDiscoveredCrystalReportRequest } from "./types";

const CrystalReportCreateDialog = dynamic(
  () => import("./CrystalReportCreateDialog").then((module) => module.CrystalReportCreateDialog),
  { ssr: false },
);
const CrystalReportDetailDialog = dynamic(
  () => import("./CrystalReportDetailDialog").then((module) => module.CrystalReportDetailDialog),
  { ssr: false },
);
const CrystalReportImportDialog = dynamic(
  () => import("./CrystalReportImportDialog").then((module) => module.CrystalReportImportDialog),
  { ssr: false },
);

export default function CrystalReportManagerPage() {
  const { t, i18n } = useTranslation();
  const { hasAllPermissions } = usePermissions();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const [items, setItems] = useState<CrystalReportListItem[]>([]); const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(""); const [entityKey, setEntityKey] = useState(""); const [status, setStatus] = useState<CrystalReportStatus | "">("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [createOpen, setCreateOpen] = useState(false); const [importOpen, setImportOpen] = useState(false); const [selected, setSelected] = useState<CrystalReportDetail | null>(null); const [archiveTarget, setArchiveTarget] = useState<CrystalReportListItem | null>(null); const [busy, setBusy] = useState(false);
  const [roles, setRoles] = useState<CrystalReportRoleOption[]>([]);
  const can = useMemo<CrystalReportCapabilities>(() => {
    const viewAccess = hasAllPermissions([permissions.ManageCrystalReportAccess]);
    return { view: viewAccess, viewAccess, create: !isReadOnly && hasAllPermissions([permissions.CreateCrystalReports]), download: hasAllPermissions([permissions.DownloadCrystalReports]), downloadVersion: viewAccess, upload: !isReadOnly && hasAllPermissions([permissions.UploadCrystalReports]), publish: !isReadOnly && hasAllPermissions([permissions.PublishCrystalReports]), access: !isReadOnly && hasAllPermissions([permissions.ManageCrystalReportAccess]), remove: !isReadOnly && hasAllPermissions([permissions.DeleteCrystalReports]) };
  }, [hasAllPermissions, isReadOnly]);
  const load = useCallback(async () => { if (!can.view) return; setLoading(true); setError(null); try { const page = await crystalReportService.listForManagement({ entityKey: entityKey || undefined, search: search || undefined, status: status || undefined, page: paginationModel.page + 1, pageSize: paginationModel.pageSize }); setItems(page.items); setTotalCount(page.totalCount); } catch (cause) { setError(extractErrorMessage(cause) || t("crystalReports.loadError")); } finally { setLoading(false); } }, [can.view, entityKey, paginationModel.page, paginationModel.pageSize, search, status, t]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    if (!selected || !can.access) return;
    void crystalReportService.listGrantRoleOptions()
      .then(setRoles)
      .catch((cause) => showToast.error(cause, t("crystalReports.rolesLoadError")));
  }, [can.access, selected, t]);
  const openDetails = useCallback(async (item: { id: string }) => { try { setBusy(true); setSelected(await crystalReportService.get(item.id)); } catch (cause) { showToast.error(cause, t("crystalReports.detailsError")); } finally { setBusy(false); } }, [t]);
  const guard = useCallback((allowed: boolean) => { if (allowed) return true; if (isReadOnly) notifyBlockedAction(); else showToast.error(t("crystalReports.permissionDenied")); return false; }, [isReadOnly, notifyBlockedAction, t]);
  const archive = useCallback(async () => { if (!archiveTarget || !guard(can.remove)) return; try { setBusy(true); await crystalReportService.archive(archiveTarget.id, archiveTarget.rowVersion); showToast.success(t("crystalReports.archiveSuccess")); setArchiveTarget(null); await load(); } catch (cause) { if (cause instanceof ApiClientError && cause.status === 409) { setArchiveTarget(null); await load(); showToast.warning(t("crystalReports.conflictReloaded")); } else { showToast.error(cause, t("crystalReports.archiveError")); } } finally { setBusy(false); } }, [archiveTarget, can.remove, guard, load, t]);
  const importDeployment = useCallback(async (request: ImportDiscoveredCrystalReportRequest) => { if (!guard(can.create)) return false; try { setBusy(true); await crystalReportService.importDeployment(request); showToast.success(t("crystalReports.importSuccess")); await load(); return true; } catch (cause) { if (cause instanceof ApiClientError && cause.status === 409) { await load(); showToast.warning(t("crystalReports.conflictReloaded")); } else { showToast.error(cause, t("crystalReports.importError")); } return false; } finally { setBusy(false); } }, [can.create, guard, load, t]);
  const columns = useMemo<GridColDef<CrystalReportListItem>[]>(() => [
    { field: "displayName", headerName: t("crystalReports.displayName"), flex: 1.35, minWidth: 170 },
    { field: "entityKey", headerName: t("crystalReports.entityKey"), flex: .85, minWidth: 120 },
    { field: "reportKey", headerName: t("crystalReports.reportKey"), flex: 1, minWidth: 130 },
    { field: "currentVersionNumber", headerName: t("crystalReports.version"), width: 95, align: "center", headerAlign: "center", valueFormatter: (value) => value == null ? "—" : `v${value}` },
    { field: "isPublished", headerName: t("crystalReports.status"), width: 120, align: "center", headerAlign: "center", renderCell: ({ row }) => <Chip size="small" color={row.isArchived ? "default" : row.isPublished ? "success" : "warning"} label={t(row.isArchived ? "crystalReports.archived" : row.isPublished ? "crystalReports.published" : "crystalReports.draft")} /> },
    { field: "updatedOn", headerName: t("crystalReports.updatedOn"), flex: 1, minWidth: 145, valueFormatter: (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(value))) : "—" },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 180, getActions: (params: GridRowParams<CrystalReportListItem>) => [
      <GridActionsCellItem icon={<Visibility />} label={t("actions.view")} key="view" onClick={() => void openDetails(params.row)} />,
      ...(can.download && params.row.isPublished && !params.row.isArchived ? [<GridActionsCellItem icon={<Download />} label={t("crystalReports.download")} key="download" onClick={() => { if (guard(can.download)) void crystalReportService.download(params.row.id).then(({ blob, fileName }) => downloadCrystalReportBlob(blob, fileName)).catch((cause) => showToast.error(cause, t("crystalReports.downloadError"))); }} />] : []),
      ...(can.remove && !params.row.isArchived ? [<GridActionsCellItem icon={<Archive />} label={t("crystalReports.archive")} key="archive" onClick={() => { if (guard(can.remove)) setArchiveTarget(params.row); }} />] : []),
    ] },
  ], [can.download, can.remove, guard, i18n.language, openDetails, t]);
  if (!can.view) return null;
  return <ContentWrapper>
    <PageHeader title={t("crystalReports.title")} subTitle={t("crystalReports.subTitle")} />
    <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5, alignItems: { md: "center" } }}>
      <TextField size="small" label={t("actions.search")} value={search} onChange={(event) => { setSearch(event.target.value); setPaginationModel((model) => ({ ...model, page: 0 })); }} />
      <TextField size="small" label={t("crystalReports.entityKey")} value={entityKey} onChange={(event) => setEntityKey(event.target.value)} />
      <TextField select size="small" label={t("crystalReports.status")} value={status} onChange={(event) => setStatus(event.target.value as CrystalReportStatus | "")} sx={{ minWidth: 150 }}><MenuItem value="">{t("crystalReports.active")}</MenuItem><MenuItem value="published">{t("crystalReports.published")}</MenuItem><MenuItem value="draft">{t("crystalReports.draft")}</MenuItem><MenuItem value="archived">{t("crystalReports.archived")}</MenuItem></TextField>
      <Box sx={{ flex: 1 }} />
      <Button startIcon={<Refresh />} onClick={() => void load()} disabled={loading}>{t("actions.refresh")}</Button>
      {can.create && <Button variant="outlined" startIcon={<FolderOpen />} onClick={() => { if (guard(can.create)) setImportOpen(true); }}>{t("crystalReports.importExisting")}</Button>}
      {can.create && <Button variant="contained" startIcon={<Add />} onClick={() => { if (guard(can.create)) setCreateOpen(true); }}>{t("crystalReports.create")}</Button>}
    </Stack>
    {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void load()}>{t("actions.retry")}</Button>}>{error}</Alert>}
    <MyDataGrid rows={items} columns={columns} loading={loading || busy} getRowId={(row) => row.id} checkboxSelection={false} pagination paginationMode="server" rowCount={totalCount} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[5, 10, 25]} autoSelectFirstRow={false} />
    {createOpen ? <CrystalReportCreateDialog key="open" open busy={busy} onClose={() => setCreateOpen(false)} onSubmit={async (request) => { if (!guard(can.create)) return; try { setBusy(true); await crystalReportService.create(request); showToast.success(t("crystalReports.created")); setCreateOpen(false); await load(); } catch (cause) { showToast.error(cause, t("crystalReports.createError")); } finally { setBusy(false); } }} /> : null}
    {importOpen && <CrystalReportImportDialog open busy={busy} onClose={() => setImportOpen(false)} onImport={importDeployment} />}
    {selected && <CrystalReportDetailDialog key={`${selected.id}:${selected.rowVersion}`} report={selected} roles={roles} can={can} busy={busy} onClose={() => setSelected(null)} onRefresh={() => openDetails(selected)} onChanged={load} guard={guard} />}
    {archiveTarget ? <ConfirmationDialog
      open
      title={t("crystalReports.archive")}
      description={archiveTarget ? t("crystalReports.archiveConfirm", { name: archiveTarget.displayName }) : ""}
      confirmLabel={t("crystalReports.archive")}
      cancelLabel={t("actions.cancel")}
      confirmColor="warning"
      confirmIcon={<Archive />}
      busy={busy}
      onClose={() => setArchiveTarget(null)}
      onConfirm={() => void archive()}
    /> : null}
  </ContentWrapper>;
}
