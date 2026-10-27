"use client";
import dynamic from "next/dynamic";
import EmailIcon from "@mui/icons-material/Email";
import { useMemo, useState } from "react";
import { Box, Button, Chip, CircularProgress, Grid } from "@mui/material";
import { Edit, Restore, Visibility } from "@mui/icons-material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { FeedbackState } from "@/shared/components/feedback/states";
import { MyDataGrid } from "@/shared/components/data-grid";
import { MySelect } from "@/shared/components/forms";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { useEmailTemplates } from "../hooks/useEmailTemplates";
import type { EmailCriteria, EmailLanguage, EmailTemplate } from "../types/emailTemplate";

const EmailTemplateDialog = dynamic(() => import("../components/EmailTemplateDialog").then(module => module.EmailTemplateDialog), { ssr: false });
type Filters = Pick<EmailCriteria, "language" | "status">;
export default function EmailTemplatesPage() {
  const { user } = useSession();
  return <EmailTemplatesWorkspace key={`${user?.tenantId}:${user?.companyId}:${user?.userId}`} />;
}
function EmailTemplatesWorkspace() {
  const { t, i18n } = useTranslation(); const { hasPermission, isReadOnly } = usePermissions();
  const canView = hasPermission(permissions.ViewCompanyEmailTemplates);
  const canEdit = canView && !isReadOnly && hasPermission(permissions.EditCompanyEmailTemplates);
  const canReset = canView && !isReadOnly && hasPermission(permissions.ResetCompanyEmailTemplates);
  const list = useServerListState<"id", Filters>({ defaultColumn: "id", defaultFilters: { language: "en", status: "all" }, defaultPageSize: 10 });
  const api = useEmailTemplates({ ...list.state.filters, search: list.debouncedSearchValue, page: list.state.page + 1, pageSize: list.state.pageSize }, canView);
  const [target, setTarget] = useState<EmailTemplate | null>(null);
  const [resetTarget, setResetTarget] = useState<EmailTemplate | null>(null);
  const [resetFailed, setResetFailed] = useState(false);
  const columns = useMemo<GridColDef<EmailTemplate>[]>(() => [
    { field: "id", headerName: t("emailTemplates.template"), flex: 1, minWidth: 210, sortable: false,
      renderCell: ({ row }) => i18n.resolvedLanguage?.startsWith("ar") ? row.nameAr : row.nameEn },
    { field: "subject", headerName: t("emailTemplates.subject"), flex: 1.5, minWidth: 230, sortable: false },
    { field: "isCustomized", headerName: t("emailTemplates.status"), width: 150, sortable: false,
      renderCell: ({ row }) => <Chip size="small" color={row.isCustomized ? "success" : "default"} label={t(row.isCustomized ? "emailTemplates.customized" : "emailTemplates.default")} /> },
    { field: "actions", type: "actions", headerName: t("emailTemplates.actions"), width: 110, sortable: false,
      getActions: ({ row }) => [
        <GridActionsCellItem key="view" icon={canEdit ? <Edit /> : <Visibility />} label={t(canEdit ? "emailTemplates.edit" : "emailTemplates.view")}
          color="primary" onClick={() => { if (canView) setTarget(row); }} />,
        ...(canReset ? [<GridActionsCellItem key="reset" icon={<Restore />} label={t("emailTemplates.reset")} disabled={!row.isCustomized}
          onClick={() => { if (canReset) { setResetFailed(false); setResetTarget(row); } }} />] : []),
      ] },
  ], [t, i18n.resolvedLanguage, canEdit, canView, canReset]);
  if (!canView) return <FeedbackState icon={<EmailIcon />} title={t("emailTemplates.forbidden")} />;
  return <ContentWrapper sx={{ minHeight: "min-content", flexShrink: 0 }}>
    <PageHeader title={t("emailTemplates.title")} subTitle={t("emailTemplates.description")} />
    {api.list.isError ? <FeedbackState icon={<EmailIcon />} title={t("emailTemplates.loadFailed")} role="alert" actions={<Button onClick={() => void api.list.refetch()}>{t("emailTemplates.reload")}</Button>} />
      : api.list.isPending ? <FeedbackState icon={<CircularProgress />} title={t("general.loading")} />
        : <Box sx={{ minHeight: 400, flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <MyDataGrid rows={api.list.data?.items ?? []} columns={columns} getRowId={row => row.id} loading={api.list.isFetching}
            pagination paginationMode="server" rowCount={api.list.data?.totalCount ?? 0} paginationModel={{ page: list.state.page, pageSize: list.state.pageSize }}
            onPaginationModelChange={model => model.pageSize !== list.state.pageSize ? list.setPageSize(model.pageSize) : list.setPage(model.page)}
            pageSizeOptions={[10, 25, 50]} disableColumnFilter disableRowSelectionOnClick showToolbar
            autoActivateFirstRow={false} autoSelectFirstRow={false} onRowDoubleClick={({ row }) => { if (canView) setTarget(row); }}
            toolbarFilters={<>
              <Grid size={{ xs: 12, sm: 6 }}><MySelect all={false} selectedItem={list.state.filters.language}
                handleSelectionChange={event => list.setFilters({ ...list.state.filters, language: event.target.value === "ar" ? "ar" : "en" })}
                dataSource={[{ value: "en", label: t("emailTemplates.english") }, { value: "ar", label: t("emailTemplates.arabic") }]}
                valueMember="value" displayMember="label" label={t("emailTemplates.language")} showClearButton={false} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><MySelect all={false} selectedItem={list.state.filters.status}
                handleSelectionChange={event => list.setFilters({ ...list.state.filters, status: event.target.value === "customized" ? "customized" : event.target.value === "default" ? "default" : "all" })}
                dataSource={["all", "default", "customized"].map(value => ({ value, label: t(`emailTemplates.${value}`) }))}
                valueMember="value" displayMember="label" label={t("emailTemplates.status")} showClearButton={false} /></Grid>
            </>}
            toolbarSearch={{ value: list.state.searchValue, onChange: list.setSearchValue, onClear: () => list.setSearchValue(""), placeholder: t("emailTemplates.search") }}
            emptyContent={<FeedbackState icon={<EmailIcon />} title={t("emailTemplates.empty")} />} sx={{ height: "100%", minHeight: 360 }} />
        </Box>}
    {target && <EmailTemplateDialog key={`${target.id}:${target.language}:${target.revision}`} row={target} canEdit={canEdit} onClose={() => setTarget(null)}
      onReload={async () => { const data = await api.list.refetch(); const latest = data.data?.items.find(row => row.id === target.id); setTarget(latest ?? null); }}
      onSave={async values => { if (!canEdit) return; await api.save.mutateAsync({ id: target.id, request: { ...values, language: target.language, expectedRevision: target.revision } }); }}
      onPreview={values => { if (!canView) return Promise.reject(new Error("Forbidden")); return api.preview.mutateAsync({ id: target.id, language: target.language, draft: values }); }} />}
    <ConfirmationDialog open={Boolean(resetTarget)} title={t("emailTemplates.reset")} description={resetFailed ? t("emailTemplates.operationFailed") : t("emailTemplates.resetConfirm")}
      onClose={() => setResetTarget(null)} onConfirm={async () => { if (!canReset || !resetTarget) return; try {
        await api.reset.mutateAsync({ id: resetTarget.id, language: resetTarget.language as EmailLanguage, revision: resetTarget.revision }); setResetTarget(null);
      } catch { setResetFailed(true); } }} confirmLabel={t("emailTemplates.reset")} cancelLabel={t("actions.cancel")} busy={api.reset.isPending} />
  </ContentWrapper>;
}
