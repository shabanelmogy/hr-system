"use client";

import { Alert, Box, Button } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { ContentWrapper } from "@/shared/components/layout";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import OrganizationalStructureForm from "../components/OrganizationalStructureForm";
import OrganizationalStructureMultiView from "../components/OrganizationalStructureMultiView";
import JobDescriptionDecisionDialog from "../components/JobDescriptionDecisionDialog";
import {
  useApproveJobDescription,
  useArchiveOrganizationalItem,
  useCreateOrganizationalItem,
  useOrganizationalStructurePage,
  useRestoreOrganizationalItem,
  useRejectJobDescription,
  useUpdateOrganizationalItem,
} from "../hooks/useOrganizationalStructure";
import type {
  OrganizationalResource,
  OrganizationalSearchField,
  OrganizationalSearchOperator,
  OrganizationalStatus,
  OrganizationalStructureItem,
  OrganizationalStructureMutation,
} from "../types/OrganizationalStructure";

type DialogMode = "add" | "edit" | "view" | "lifecycle" | "approve" | "reject" | null;

export default function OrganizationalStructurePage({ resource }: { resource: OrganizationalResource }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrganizationalStatus>("active");
  const [sortBy, setSortBy] = useState<"nameEn" | "nameAr" | "code" | "parent" | "createdOn">("nameEn");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchField, setSearchField] = useState<OrganizationalSearchField>("all");
  const [searchOperator, setSearchOperator] = useState<OrganizationalSearchOperator>("contains");
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [selected, setSelected] = useState<OrganizationalStructureItem | null>(null);
  const canView = hasPermission(permissions.ViewOrganizationalStructure);
  const permissionSet = {
    canCreate: hasPermission(permissions.CreateOrganizationalStructure),
    canEdit: hasPermission(permissions.EditOrganizationalStructure),
    canDelete: hasPermission(permissions.DeleteOrganizationalStructure),
    canApprove: hasPermission(permissions.ApproveJobDescriptions),
  };
  const query = useOrganizationalStructurePage({
    resource, pageNumber: page + 1, pageSize, search: search || undefined,
    searchField, searchOperator, status, sortBy, sortDirection,
  }, canView);
  const createMutation = useCreateOrganizationalItem();
  const updateMutation = useUpdateOrganizationalItem();
  const archiveMutation = useArchiveOrganizationalItem();
  const restoreMutation = useRestoreOrganizationalItem();
  const approveMutation = useApproveJobDescription();
  const rejectMutation = useRejectJobDescription();
  const mutationLoading = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending || restoreMutation.isPending || approveMutation.isPending || rejectMutation.isPending;
  const close = () => { if (!mutationLoading) { setDialog(null); setSelected(null); } };
  const submit = async (values: OrganizationalStructureMutation) => {
    const request = resource === "job-descriptions" ? { ...values, version: values.code } : values;
    if (dialog === "edit" && selected) await updateMutation.mutateAsync({ resource, id: selected.id, request });
    else await createMutation.mutateAsync({ resource, request });
    close();
  };
  const lifecycle = async () => {
    if (!selected) return;
    const variables = { resource, id: selected.id };
    if (selected.isDeleted) await restoreMutation.mutateAsync(variables);
    else await archiveMutation.mutateAsync(variables);
    close();
  };
  const decide = async (values: { effectiveDate: string; expiryDate: string; reason: string }) => {
    if (!selected) return;
    if (dialog === "approve") await approveMutation.mutateAsync({ id: selected.id, effectiveDate: values.effectiveDate, expiryDate: values.expiryDate || undefined });
    if (dialog === "reject") await rejectMutation.mutateAsync({ id: selected.id, reason: values.reason });
    close();
  };
  const resetList = () => {
    setPage(0);
    setSearch("");
    setStatus("active");
    setSortBy("nameEn");
    setSortDirection("asc");
    setSearchField("all");
    setSearchOperator("contains");
  };

  if (!canView) return <Alert severity="warning">{t("authorization.forbidden.message")}</Alert>;
  if (query.error) return <Box sx={{ p: 3 }}><Alert severity="error" action={<Button color="inherit" onClick={() => void query.refetch()}>{t("common.retry")}</Button>}>
    {extractErrorMessage(query.error) || t("organizationalStructure.fetchError")}</Alert></Box>;

  return <ContentWrapper fillAvailable>
    <OrganizationalStructureMultiView
      resource={resource} items={query.data?.items ?? []} loading={query.isLoading} isFetching={query.isFetching}
      totalCount={query.data?.metaData.totalCount ?? 0} page={page} pageSize={pageSize}
      search={search} status={status} sortBy={sortBy} sortDirection={sortDirection} permissions={permissionSet}
      onPageChange={setPage}
      onPageSizeChange={(value) => { setPageSize(value); setPage(0); }}
      onSearchChange={(value) => { setSearch(value); setPage(0); }}
      onStatusChange={(value) => { setStatus(value); setPage(0); }}
      onSortChange={(column, direction) => { setSortBy(column); setSortDirection(direction); setPage(0); }}
      searchField={searchField} searchOperator={searchOperator}
      onSearchFieldChange={(value) => { setSearchField(value); setPage(0); }}
      onSearchOperatorChange={(value) => { setSearchOperator(value); setPage(0); }}
      onAdd={() => { setSelected(null); setDialog("add"); }}
      onView={(item) => { setSelected(item); setDialog("view"); }}
      onEdit={(item) => { setSelected(item); setDialog("edit"); }}
      onLifecycle={(item) => { setSelected(item); setDialog("lifecycle"); }}
      onApprove={(item) => { setSelected(item); setDialog("approve"); }}
      onReject={(item) => { setSelected(item); setDialog("reject"); }}
      onRefresh={() => void query.refetch()}
      onReset={resetList}
    />
    {dialog === "add" || dialog === "edit" || dialog === "view" ? <OrganizationalStructureForm
      open mode={dialog} resource={resource} item={selected} loading={mutationLoading}
      onClose={close} onSubmit={submit} /> : null}
    <ConfirmationDialog open={dialog === "lifecycle"} onClose={close} onConfirm={() => void lifecycle()}
      busy={mutationLoading} confirmColor={selected?.isDeleted ? "success" : "warning"}
      title={t(selected?.isDeleted ? "organizationalStructure.restoreTitle" : "organizationalStructure.archiveTitle")}
      description={t(selected?.isDeleted ? "organizationalStructure.restoreDescription" : "organizationalStructure.archiveDescription", { name: selected?.nameEn })}
      confirmLabel={t(selected?.isDeleted ? "actions.restore" : "actions.archive")} cancelLabel={t("actions.cancel")} />
    {dialog === "approve" || dialog === "reject" ? <JobDescriptionDecisionDialog
      open mode={dialog} loading={mutationLoading} onClose={close} onSubmit={decide} /> : null}
  </ContentWrapper>;
}
