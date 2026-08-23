"use client";

import { Add, Archive, Download, FileUpload, FolderOpen, Lock, Publish, Refresh, Save, SystemUpdateAlt, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { GridActionsCellItem, type GridColDef, type GridPaginationModel, type GridRowParams } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { MyDataGrid } from "@/shared/components/data-grid";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { permissions } from "@/lib/auth/permissions";
import { showToast } from "@/shared/components/feedback/transient";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { crystalReportService } from "./services";
import type { CrystalReportAccessGrant, CrystalReportDetail, CrystalReportListItem, CrystalReportRight, CrystalReportRoleOption, CrystalReportStatus, CreateCrystalReportRequest, DiscoveredCrystalReport, ImportDiscoveredCrystalReportRequest } from "./types";

const RIGHTS: CrystalReportRight[] = ["Run", "Download", "Upload", "Publish", "ManageAccess"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function canUseRpt(file: File | null) { return !!file && file.name.toLowerCase().endsWith(".rpt") && file.size <= MAX_FILE_BYTES; }
function downloadBlob(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }

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
  const can = useMemo(() => {
    const viewAccess = hasAllPermissions([permissions.ManageCrystalReportAccess]);
    return { view: viewAccess, viewAccess, create: !isReadOnly && hasAllPermissions([permissions.CreateCrystalReports]), download: hasAllPermissions([permissions.DownloadCrystalReports]), upload: !isReadOnly && hasAllPermissions([permissions.UploadCrystalReports]), publish: !isReadOnly && hasAllPermissions([permissions.PublishCrystalReports]), access: !isReadOnly && viewAccess, remove: !isReadOnly && hasAllPermissions([permissions.DeleteCrystalReports]) };
  }, [hasAllPermissions, isReadOnly]);
  const load = useCallback(async () => { if (!can.view) return; setLoading(true); setError(null); try { const page = await crystalReportService.listForManagement({ entityKey: entityKey || undefined, search: search || undefined, status: status || undefined, page: paginationModel.page + 1, pageSize: paginationModel.pageSize }); setItems(page.items); setTotalCount(page.totalCount); } catch (cause) { setError(extractErrorMessage(cause) || t("crystalReports.loadError")); } finally { setLoading(false); } }, [can.view, entityKey, paginationModel.page, paginationModel.pageSize, search, status, t]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  useEffect(() => {
    if (!selected || !can.viewAccess) return;
    void crystalReportService.listRoles()
      .then(setRoles)
      .catch((cause) => showToast.error(cause, t("crystalReports.rolesLoadError")));
  }, [can.viewAccess, selected, t]);
  const openDetails = useCallback(async (item: CrystalReportListItem) => { try { setBusy(true); setSelected(await crystalReportService.get(item.id)); } catch (cause) { showToast.error(cause, t("crystalReports.detailsError")); } finally { setBusy(false); } }, [t]);
  const guard = useCallback((allowed: boolean) => { if (allowed) return true; if (isReadOnly) notifyBlockedAction(); else showToast.error(t("crystalReports.permissionDenied")); return false; }, [isReadOnly, notifyBlockedAction, t]);
  const archive = useCallback(async () => { if (!archiveTarget || !guard(can.remove)) return; try { setBusy(true); await crystalReportService.archive(archiveTarget.id, archiveTarget.rowVersion); showToast.success(t("crystalReports.archiveSuccess")); setArchiveTarget(null); await load(); } catch (cause) { showToast.error(cause, t("crystalReports.archiveError")); } finally { setBusy(false); } }, [archiveTarget, can.remove, guard, load, t]);
  const importLegacy = useCallback(async (request: ImportDiscoveredCrystalReportRequest) => { if (!guard(can.create)) return false; try { setBusy(true); await crystalReportService.importLegacy(request); showToast.success(t("crystalReports.importSuccess")); await load(); return true; } catch (cause) { showToast.error(cause, t("crystalReports.importError")); return false; } finally { setBusy(false); } }, [can.create, guard, load, t]);
  const columns = useMemo<GridColDef<CrystalReportListItem>[]>(() => [
    { field: "displayName", headerName: t("crystalReports.displayName"), flex: 1.35, minWidth: 170 },
    { field: "entityKey", headerName: t("crystalReports.entityKey"), flex: .85, minWidth: 120 },
    { field: "reportKey", headerName: t("crystalReports.reportKey"), flex: 1, minWidth: 130 },
    { field: "currentVersionNumber", headerName: t("crystalReports.version"), width: 95, align: "center", headerAlign: "center", valueFormatter: (value) => value == null ? "—" : `v${value}` },
    { field: "isPublished", headerName: t("crystalReports.status"), width: 120, align: "center", headerAlign: "center", renderCell: ({ row }) => <Chip size="small" color={row.isArchived ? "default" : row.isPublished ? "success" : "warning"} label={t(row.isArchived ? "crystalReports.archived" : row.isPublished ? "crystalReports.published" : "crystalReports.draft")} /> },
    { field: "updatedOn", headerName: t("crystalReports.updatedOn"), flex: 1, minWidth: 145, valueFormatter: (value) => value ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(value))) : "—" },
    { field: "actions", type: "actions", headerName: t("actions.buttons"), width: 180, getActions: (params: GridRowParams<CrystalReportListItem>) => [
      <GridActionsCellItem icon={<Visibility />} label={t("actions.view")} key="view" onClick={() => void openDetails(params.row)} />,
      ...(can.download && params.row.isPublished && !params.row.isArchived ? [<GridActionsCellItem icon={<Download />} label={t("crystalReports.download")} key="download" onClick={() => { if (guard(can.download)) void crystalReportService.download(params.row.id).then((blob) => downloadBlob(blob, `${params.row.reportKey}.rpt`)).catch((cause) => showToast.error(cause, t("crystalReports.downloadError"))); }} />] : []),
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
    <CreateDialog key={createOpen ? "open" : "closed"} open={createOpen} busy={busy} onClose={() => setCreateOpen(false)} onSubmit={async (request) => { if (!guard(can.create)) return; try { setBusy(true); await crystalReportService.create(request); showToast.success(t("crystalReports.created")); setCreateOpen(false); await load(); } catch (cause) { showToast.error(cause, t("crystalReports.createError")); } finally { setBusy(false); } }} />
    {importOpen && <ImportExistingDialog open busy={busy} onClose={() => setImportOpen(false)} onImport={importLegacy} />}
    {selected && <DetailDialog key={`${selected.id}:${selected.rowVersion}`} report={selected} roles={roles} can={can} busy={busy} onClose={() => setSelected(null)} onRefresh={() => void openDetails(selected)} onChanged={load} guard={guard} />}
    <ConfirmationDialog
      open={archiveTarget !== null}
      title={t("crystalReports.archive")}
      description={archiveTarget ? t("crystalReports.archiveConfirm", { name: archiveTarget.displayName }) : ""}
      confirmLabel={t("crystalReports.archive")}
      cancelLabel={t("actions.cancel")}
      confirmColor="warning"
      confirmIcon={<Archive />}
      busy={busy}
      onClose={() => setArchiveTarget(null)}
      onConfirm={() => void archive()}
    />
  </ContentWrapper>;
}

function ImportExistingDialog({ open, busy, onClose, onImport }: { open: boolean; busy: boolean; onClose: () => void; onImport: (request: ImportDiscoveredCrystalReportRequest) => Promise<boolean> }) {
  const { t } = useTranslation(); const [items, setItems] = useState<DiscoveredCrystalReport[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [search, setSearch] = useState("");
  const loadCatalog = useCallback(async () => { setLoading(true); setError(null); try { setItems(await crystalReportService.listLegacyCandidates()); } catch (cause) { setError(extractErrorMessage(cause) || t("crystalReports.catalogError")); } finally { setLoading(false); } }, [t]);
  useEffect(() => { void Promise.resolve().then(loadCatalog); }, [loadCatalog]);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleItems = items.filter((item) => !normalizedSearch || [item.displayName, item.subject, item.entityKey, item.fileName].some((value) => value?.toLowerCase().includes(normalizedSearch)));
  const importItem = async (item: DiscoveredCrystalReport) => { const imported = await onImport({ sourceId: item.sourceId, expectedSha256: item.sha256 }); if (imported) await loadCatalog(); };
  return <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle>{t("crystalReports.importExisting")}</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ pt: 1 }}><Typography color="text.secondary">{t("crystalReports.importExistingHint")}</Typography><TextField size="small" label={t("actions.search")} value={search} onChange={(event) => setSearch(event.target.value)} />{loading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}{error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void loadCatalog()}>{t("actions.retry")}</Button>}>{error}</Alert>}{!loading && !error && visibleItems.length === 0 && <Alert severity="info">{t("crystalReports.noExistingReports")}</Alert>}{!loading && !error && visibleItems.map((item) => <Box key={item.sourceId} sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, p: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}><Box sx={{ minWidth: 0, flex: 1 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}><Typography sx={{ fontWeight: 700 }}>{item.displayName}</Typography><Chip size="small" label={item.entityKey} />{item.isImported && <Chip size="small" color="success" label={t("crystalReports.imported")} />}</Stack>{item.subject && <Typography variant="body2" color="text.secondary">{item.subject}</Typography>}<Typography variant="caption" color="text.secondary">{item.fileName} · {formatBytes(item.size)}</Typography>{item.validationReason && <Typography variant="caption" color="error" sx={{ display: "block" }}>{item.validationReason}</Typography>}</Box><Button variant="contained" size="small" startIcon={<SystemUpdateAlt />} disabled={busy || item.isImported || !item.isImportable} onClick={() => void importItem(item)}>{item.isImported ? t("crystalReports.imported") : t("crystalReports.import")}</Button></Box>)}</Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={busy}>{t("actions.close")}</Button></DialogActions></Dialog>;
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function CreateDialog({ open, busy, onClose, onSubmit }: { open: boolean; busy: boolean; onClose: () => void; onSubmit: (request: CreateCrystalReportRequest) => Promise<void> }) {
  const { t } = useTranslation(); const [entityKey, setEntityKey] = useState(""); const [description, setDescription] = useState(""); const [file, setFile] = useState<File | null>(null); const invalid = file !== null && !canUseRpt(file);
  return <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm"><DialogTitle>{t("crystalReports.create")}</DialogTitle><DialogContent><Stack spacing={2} sx={{ pt: 1 }}><TextField required label={t("crystalReports.entityKey")} value={entityKey} onChange={(e) => setEntityKey(e.target.value)} helperText={t("crystalReports.entityKeyHint")} /><TextField label={t("crystalReports.description")} value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} /><Button component="label" variant="outlined" startIcon={<FileUpload />}>{file?.name ?? t("crystalReports.selectFile")}<input hidden type="file" accept=".rpt,application/octet-stream" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Button>{invalid && <Alert severity="error">{t("crystalReports.fileHint")}</Alert>}<Typography variant="caption" color="text.secondary">{t("crystalReports.summaryInfoHint")}</Typography></Stack></DialogContent><DialogActions><Button onClick={onClose} disabled={busy}>{t("actions.cancel")}</Button><Button variant="contained" startIcon={busy ? <CircularProgress size={16} /> : <Save />} disabled={busy || !entityKey.trim() || !canUseRpt(file)} onClick={() => file && void onSubmit({ entityKey: entityKey.trim(), description: description.trim() || undefined, file })}>{t("actions.save")}</Button></DialogActions></Dialog>;
}

function DetailDialog({ report, roles, can, busy, onClose, onRefresh, onChanged, guard }: { report: CrystalReportDetail; roles: CrystalReportRoleOption[]; can: Record<string, boolean>; busy: boolean; onClose: () => void; onRefresh: () => void; onChanged: () => Promise<void>; guard: (value: boolean) => boolean }) {
  const { t } = useTranslation(); const [tab, setTab] = useState(0); const [grants, setGrants] = useState<CrystalReportAccessGrant[]>(report.access); const [file, setFile] = useState<File | null>(null);
  const updateGrant = (roleId: string, right: CrystalReportRight, checked: boolean) => setGrants((current) => { const prior = current.find((grant) => grant.roleId === roleId)?.rights ?? []; const rights = checked ? [...new Set([...prior, right])] : prior.filter((item) => item !== right); return [...current.filter((grant) => grant.roleId !== roleId), ...(rights.length ? [{ roleId, rights }] : [])]; });
  const upload = async () => { if (!guard(can.upload) || !canUseRpt(file)) return; try { await crystalReportService.uploadVersion(report.id, file!); showToast.success(t("crystalReports.versionUploaded")); onRefresh(); onChanged(); } catch (cause) { showToast.error(cause, t("crystalReports.uploadError")); } };
  const saveAccess = async () => { if (!guard(can.access)) return; try { await crystalReportService.saveAccess(report.id, grants, report.rowVersion); showToast.success(t("crystalReports.accessSaved")); onRefresh(); } catch (cause) { showToast.error(cause, t("crystalReports.accessError")); } };
  return <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md"><DialogTitle>{report.displayName}</DialogTitle><DialogContent><Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab label={t("crystalReports.overview")} /><Tab label={t("crystalReports.versions")} /><Tab label={t("crystalReports.permissions")} /></Tabs><Divider sx={{ mb: 2 }} />
    {tab === 0 && <Stack spacing={1}><Typography><b>{t("crystalReports.entityKey")}:</b> {report.entityKey}</Typography><Typography><b>{t("crystalReports.reportKey")}:</b> {report.reportKey}</Typography><Typography>{report.description || "—"}</Typography><Stack direction="row" spacing={1}>{can.download && report.isPublished && !report.isArchived && <Button startIcon={<Download />} onClick={() => { if (guard(can.download)) void crystalReportService.download(report.id).then((blob) => downloadBlob(blob, `${report.reportKey}.rpt`)); }}>{t("crystalReports.download")}</Button>}</Stack></Stack>}
    {tab === 1 && <Stack spacing={1.25}>{report.versions.map((item) => <Box key={item.id} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1, display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}><Typography sx={{ minWidth: 58 }}>v{item.versionNumber}</Typography><Box sx={{ flex: 1 }}><Typography>{item.summaryTitle || item.originalFileName}</Typography>{item.summarySubject && <Typography variant="caption" color="text.secondary">{item.summarySubject}</Typography>}</Box><Chip size="small" label={item.validationStatus} color={item.validationStatus === "invalid" ? "error" : item.validationStatus === "published" ? "success" : "default"} />{can.download && <IconButton aria-label={t("crystalReports.download")} onClick={() => { if (guard(can.download)) void crystalReportService.downloadVersion(report.id, item.id).then((blob) => downloadBlob(blob, item.originalFileName)).catch((cause) => showToast.error(cause, t("crystalReports.downloadError"))); }}><Download /></IconButton>}{can.publish && <Button size="small" startIcon={<Publish />} disabled={item.validationStatus === "invalid"} onClick={() => { if (guard(can.publish)) void crystalReportService.publishVersion(report.id, item.id, report.rowVersion).then(() => { showToast.success(t("crystalReports.published")); onRefresh(); onChanged(); }).catch((cause) => showToast.error(cause, t("crystalReports.publishError"))); }}>{t("crystalReports.publish")}</Button>}</Box>)}{can.upload && <Stack direction={{ xs: "column", sm: "row" }} spacing={1}><Button component="label" variant="outlined" startIcon={<FileUpload />}>{file?.name ?? t("crystalReports.selectNewVersion")}<input hidden type="file" accept=".rpt" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Button><Button variant="contained" disabled={!canUseRpt(file)} onClick={() => void upload()}>{t("crystalReports.upload")}</Button><Typography variant="caption" color="text.secondary">{t("crystalReports.summaryInfoHint")}</Typography></Stack>}</Stack>}
    {tab === 2 && <Stack spacing={1}>{!can.access && <Alert severity="info" icon={<Lock />}>{t("crystalReports.accessReadOnly")}</Alert>}{can.viewAccess && roles.map((role) => { const selected = grants.find((grant) => grant.roleId === role.id)?.rights ?? []; return <Box key={role.id} sx={{ borderBottom: 1, borderColor: "divider", py: 1 }}><Typography sx={{ fontWeight: 600 }}>{role.name}</Typography><Stack direction="row" sx={{ flexWrap: "wrap" }}>{RIGHTS.map((right) => <FormControlLabel key={right} control={<Checkbox checked={selected.includes(right)} disabled={!can.access} onChange={(e) => updateGrant(role.id, right, e.target.checked)} />} label={t(`crystalReports.rights.${right}`)} />)}</Stack></Box>; })}{can.access && <Button variant="contained" startIcon={<Save />} onClick={() => void saveAccess()}>{t("actions.save")}</Button>}</Stack>}
  </DialogContent><DialogActions><Button onClick={onClose}>{t("actions.close")}</Button></DialogActions></Dialog>;
}
