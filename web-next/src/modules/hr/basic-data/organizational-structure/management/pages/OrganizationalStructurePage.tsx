"use client";

import { Alert, Box, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { permissions } from "@/lib/auth/permissions";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { ContentWrapper } from "@/shared/components/layout";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { showToast } from "@/shared/components/feedback/transient";
import OrganizationalStructureForm from "../components/OrganizationalStructureForm";
import OrganizationalStructureMultiView from "../components/OrganizationalStructureMultiView";
import JobDescriptionDecisionDialog from "../components/JobDescriptionDecisionDialog";
import JobDescriptionDetailsDialog from "../components/JobDescriptionDetailsDialog";
import { EntityChangeLogDialog } from "@/shared/components/audit-log";
import {
  useApproveJobDescription,
  useArchiveOrganizationalItem,
  useCreateOrganizationalItem,
  useOrganizationalStructurePage,
  useRestoreOrganizationalItem,
  useRejectJobDescription,
  useUpdateOrganizationalItem,
  useOrganizationalChangeLogs,
} from "../hooks/useOrganizationalStructure";
import type {
  OrganizationalResource,
  OrganizationalSearchField,
  OrganizationalSearchOperator,
  OrganizationalStatus,
  OrganizationalStructureItem,
  OrganizationalStructureMutation,
} from "../types/OrganizationalStructure";

type DialogMode = "add" | "edit" | "view" | "lifecycle" | "approve" | "reject" | "logs" | null;

export default function OrganizationalStructurePage({ resource }: { resource: OrganizationalResource }) {
  const { t, i18n } = useTranslation();
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
  const [addSeed, setAddSeed] = useState<Partial<OrganizationalStructureMutation> | null>(null);
  const canView = hasPermission(permissions.ViewOrganizationalStructure);
  const permissionSet = useMemo(() => ({
    canCreate: hasPermission(permissions.CreateOrganizationalStructure),
    canEdit: hasPermission(permissions.EditOrganizationalStructure),
    canDelete: hasPermission(permissions.DeleteOrganizationalStructure),
    canApprove: hasPermission(permissions.ApproveJobDescriptions),
  }), [hasPermission]);
  const queryArgs = useMemo(() => ({
    resource,
    pageNumber: page + 1,
    pageSize,
    search: search || undefined,
    searchField,
    searchOperator,
    status,
    sortBy,
    sortDirection,
  }), [resource, page, pageSize, search, searchField, searchOperator, status, sortBy, sortDirection]);
  const query = useOrganizationalStructurePage(queryArgs, canView);
  const changeLogsQuery = useOrganizationalChangeLogs(resource, selected?.id, dialog === "logs");
  const createMutation = useCreateOrganizationalItem();
  const updateMutation = useUpdateOrganizationalItem();
  const archiveMutation = useArchiveOrganizationalItem();
  const restoreMutation = useRestoreOrganizationalItem();
  const approveMutation = useApproveJobDescription();
  const rejectMutation = useRejectJobDescription();
  const mutationLoading = createMutation.isPending || updateMutation.isPending || archiveMutation.isPending || restoreMutation.isPending || approveMutation.isPending || rejectMutation.isPending;
  const close = () => { if (!mutationLoading) { setDialog(null); setSelected(null); setAddSeed(null); } };
  const submit = async (values: OrganizationalStructureMutation) => {
    const request = resource === "job-descriptions" ? { ...values, version: values.code } : values;
    if (dialog === "edit" && selected) {
      await updateMutation.mutateAsync({ resource, id: selected.id, request });
      showToast.success(t("organizationalStructure.updated"));
    } else {
      await createMutation.mutateAsync({ resource, request });
      showToast.success(t("organizationalStructure.created"));
    }
    setDialog(null);
    setSelected(null);
    setAddSeed(null);
  };
  const lifecycle = async () => {
    if (!selected) return;
    const variables = { resource, id: selected.id };
    if (selected.isDeleted) {
      await restoreMutation.mutateAsync(variables);
      showToast.success(t("organizationalStructure.restored"));
    } else {
      await archiveMutation.mutateAsync(variables);
      showToast.success(t("organizationalStructure.archived"));
    }
    setDialog(null);
    setSelected(null);
  };
  const decide = async (values: { effectiveDate: string; expiryDate: string; reason: string }) => {
    if (!selected) return;
    if (dialog === "approve") {
      await approveMutation.mutateAsync({ id: selected.id, effectiveDate: values.effectiveDate, expiryDate: values.expiryDate || undefined });
      showToast.success(t("organizationalStructure.decision.approved"));
    }
    if (dialog === "reject") {
      await rejectMutation.mutateAsync({ id: selected.id, reason: values.reason });
      showToast.success(t("organizationalStructure.decision.rejected"));
    }
    setDialog(null);
    setSelected(null);
  };
  const handleReparent = async (
    sourceItem: OrganizationalStructureItem,
    newParentId: number | null,
    swapWithTarget?: OrganizationalStructureItem,
  ) => {
    if (swapWithTarget) {
      const targetRequest: OrganizationalStructureMutation = {
        code: swapWithTarget.code,
        nameEn: swapWithTarget.nameEn,
        nameAr: swapWithTarget.nameAr,
        descriptionEn: swapWithTarget.descriptionEn ?? undefined,
        descriptionAr: swapWithTarget.descriptionAr ?? undefined,
        costCenterCode: swapWithTarget.costCenterCode ?? undefined,
        managerId: swapWithTarget.managerId ?? undefined,
        branchId: swapWithTarget.branchId ?? undefined,
        parentDepartmentId: sourceItem.parentDepartmentId ?? undefined,
        isCentralized: swapWithTarget.isCentralized ?? !swapWithTarget.branchId,
      };
      await updateMutation.mutateAsync({ resource, id: swapWithTarget.id, request: targetRequest });

      const sourceRequest: OrganizationalStructureMutation = {
        code: sourceItem.code,
        nameEn: sourceItem.nameEn,
        nameAr: sourceItem.nameAr,
        descriptionEn: sourceItem.descriptionEn ?? undefined,
        descriptionAr: sourceItem.descriptionAr ?? undefined,
        costCenterCode: sourceItem.costCenterCode ?? undefined,
        managerId: sourceItem.managerId ?? undefined,
        branchId: sourceItem.branchId ?? undefined,
        parentDepartmentId: swapWithTarget.id,
        isCentralized: sourceItem.isCentralized ?? !sourceItem.branchId,
      };
      await updateMutation.mutateAsync({ resource, id: sourceItem.id, request: sourceRequest });
      return;
    }

    const request: OrganizationalStructureMutation = {
      code: sourceItem.code,
      nameEn: sourceItem.nameEn,
      nameAr: sourceItem.nameAr,
      descriptionEn: sourceItem.descriptionEn ?? undefined,
      descriptionAr: sourceItem.descriptionAr ?? undefined,
      costCenterCode: sourceItem.costCenterCode ?? undefined,
      managerId: sourceItem.managerId ?? undefined,
      branchId: sourceItem.branchId ?? undefined,
      parentDepartmentId: resource === "departments" ? (newParentId ?? undefined) : undefined,
      parentCostCenterId: resource === "cost-centers" ? (newParentId ?? undefined) : undefined,
      isCentralized: sourceItem.isCentralized ?? !sourceItem.branchId,
    };
    await updateMutation.mutateAsync({ resource, id: sourceItem.id, request });
  };
  const handleAddChild = (parentItem: OrganizationalStructureItem) => {
    if (resource === "cost-centers") {
      setAddSeed({
        parentCostCenterId: parentItem.id,
      });
    } else {
      setAddSeed({
        parentDepartmentId: parentItem.id,
        branchId: parentItem.branchId,
        isCentralized: parentItem.isCentralized ?? !parentItem.branchId,
        costCenterCode: parentItem.costCenterCode,
      });
    }
    setSelected(null);
    setDialog("add");
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
      onAdd={() => { setSelected(null); setAddSeed(null); setDialog("add"); }}
      onAddChild={handleAddChild}
      onView={(item) => { setSelected(item); setDialog("view"); }}
      onEdit={(item) => { setSelected(item); setDialog("edit"); }}
      onLifecycle={(item) => { setSelected(item); setDialog("lifecycle"); }}
      onApprove={(item) => { setSelected(item); setDialog("approve"); }}
      onReject={(item) => { setSelected(item); setDialog("reject"); }}
      onViewLogs={(item) => { setSelected(item); setDialog("logs"); }}
      onRefresh={() => void query.refetch()}
      onReset={resetList}
      onReparent={handleReparent}
    />
    {dialog === "add" || dialog === "edit" || (dialog === "view" && resource !== "job-descriptions") ? (
      <OrganizationalStructureForm
        open mode={dialog} resource={resource} item={selected} initialValues={addSeed} loading={mutationLoading}
        onClose={close} onSubmit={submit} />
    ) : null}
    {dialog === "view" && resource === "job-descriptions" ? (
      <JobDescriptionDetailsDialog
        open
        item={selected}
        canEdit={permissionSet.canEdit}
        canApprove={permissionSet.canApprove}
        onClose={close}
        onEdit={(item) => {
          setSelected(item);
          setDialog("edit");
        }}
        onApprove={(item) => {
          setSelected(item);
          setDialog("approve");
        }}
        onReject={(item) => {
          setSelected(item);
          setDialog("reject");
        }}
        onViewLogs={(item) => {
          setSelected(item);
          setDialog("logs");
        }}
      />
    ) : null}
    {dialog === "logs" && selected ? (
      <EntityChangeLogDialog
        open
        onClose={close}
        entityCode={selected.code}
        entityName={i18n.language?.startsWith("ar") ? selected.nameAr : selected.nameEn}
        logs={changeLogsQuery.data}
        loading={changeLogsQuery.isLoading}
        error={changeLogsQuery.error}
        onRetry={() => void changeLogsQuery.refetch()}
      />
    ) : null}
    <ConfirmationDialog open={dialog === "lifecycle"} onClose={close} onConfirm={() => void lifecycle()}
      busy={mutationLoading} confirmColor={selected?.isDeleted ? "success" : "warning"}
      title={t(selected?.isDeleted ? "organizationalStructure.restoreTitle" : "organizationalStructure.archiveTitle")}
      description={t(selected?.isDeleted ? "organizationalStructure.restoreDescription" : "organizationalStructure.archiveDescription", { name: selected?.nameEn })}
      confirmLabel={t(selected?.isDeleted ? "actions.restore" : "actions.archive")} cancelLabel={t("actions.cancel")} />
    {dialog === "approve" || dialog === "reject" ? <JobDescriptionDecisionDialog
      open mode={dialog} loading={mutationLoading} onClose={close} onSubmit={decide} /> : null}
  </ContentWrapper>;
}
