"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { Security } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { MyForm } from "@/shared/components/forms";
import { FeedbackState, EmptyState } from "@/shared/components/feedback/states";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useUnsavedChanges, useUnsavedChangesRegistration } from "@/shared/contexts/UnsavedChangesContext";
import { permissions } from "@/lib/auth/permissions";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import RolePermissionsCards from "../../roles/components/role-permissions/RolePermissionsCards";
import RolePermissionsFilters from "../../roles/components/role-permissions/RolePermissionsFilters";
import RolePermissionsModuleRail from "../../roles/components/role-permissions/RolePermissionsModuleRail";
import { summarizePermissionBusinessModules, splitPermission, sortPermissionActions } from "../../roles/utils/permissionPresentation";
import { useUserCompanyPermissions } from "../hooks/useUserCompanyPermissions";
import { createUserPermissionsFormSchema, type UserPermissionsFormValues } from "../validation/userPermissionsValidation";
import type { UserCompanyPermissions } from "../types/userPermissions";

export default function UserCompanyPermissionsDialog({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { requestDiscard } = useUnsavedChanges();
  const { hasPermission, isReadOnly } = usePermissions();
  const canView = hasPermission(permissions.ViewUserPermissions);
  const canEdit = !isReadOnly && canView && hasPermission(permissions.EditUserPermissions);
  const { query, mutation } = useUserCompanyPermissions(userId, canView);
  const baseline = useRef<UserCompanyPermissions | null>(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [search, setSearch] = useState("");
  const [screen, setScreen] = useState("");
  const [onlySelected, setOnlySelected] = useState(false);
  const form = useForm<UserPermissionsFormValues>({
    resolver: zodResolver(createUserPermissionsFormSchema(t("userPermissions.invalidSelection"))),
    defaultValues: { permissions: [] },
  });
  const selected = useWatch({ control: form.control, name: "permissions" });
  useUnsavedChangesRegistration(canEdit && (form.formState.isDirty || mutation.isPending), mutation.isPending);
  useEffect(() => {
    if (!query.data || baseline.current) return;
    baseline.current = query.data;
    form.reset({ permissions: query.data.permissions.filter((row) => row.isDirect).map((row) => row.permission) });
  }, [form, query.data]);
  const rows = query.data?.permissions ?? [];
  const claims = rows.map((row) => ({
    displayValue: row.permission, moduleCode: row.moduleCode || "platform",
    isSelected: selected.includes(row.permission),
  }));
  const modules = summarizePermissionBusinessModules(claims);
  const activeModule = modules.some((item) => item.code === selectedModule) ? selectedModule : modules[0]?.code ?? "";
  const screens = [...new Set(claims.filter((claim) => claim.moduleCode === activeModule)
    .map((claim) => splitPermission(claim.displayValue)?.resource).filter((value): value is string => Boolean(value)))].sort();
  const actions = sortPermissionActions([...new Set(claims.map((claim) => splitPermission(claim.displayValue)?.action)
    .filter((value): value is string => Boolean(value)))]);
  const filtered = screens.filter((resource) => (!screen || screen === resource) && claims.some((claim) =>
    claim.moduleCode === activeModule && splitPermission(claim.displayValue)?.resource === resource &&
    (!onlySelected || claim.isSelected) &&
    (!search || `${claim.displayValue} ${rows.find((row) => row.permission === claim.displayValue)?.inheritedFrom.join(" ")}`
      .toLocaleLowerCase().includes(search.toLocaleLowerCase()))));
  const replaceSelection = (values: string[]) => {
    if (!canEdit || mutation.isPending) return;
    form.setValue("permissions", [...new Set(values)], { shouldDirty: true, shouldValidate: true });
  };
  const toggle = (index: number) => {
    const row = rows[index];
    if (!row || (!row.canGrant && !row.isDirect)) return;
    replaceSelection(selected.includes(row.permission)
      ? selected.filter((key) => key !== row.permission) : [...selected, row.permission]);
  };
  const selectScreen = (resource: string, checked: boolean) => {
    const editable = rows.filter((row) => (row.moduleCode || "platform") === activeModule &&
      splitPermission(row.permission)?.resource === resource && (row.canGrant || row.isDirect)).map((row) => row.permission);
    replaceSelection(checked ? [...selected, ...editable] : selected.filter((key) => !editable.includes(key)));
  };
  const save = () => form.handleSubmit(async (values) => {
    if (!canEdit || !baseline.current || mutation.isPending) return;
    try {
      await mutation.mutateAsync({ permissions: values.permissions, expectedRevision: baseline.current.revision });
      onClose();
    } catch (error: unknown) {
      applyApiFieldErrors(error, form.setError, { "Request.Permissions": "permissions", "request.permissions": "permissions" });
    }
  })();
  const errorLabels = useMemo(() => ({ permissions: t("userPermissions.direct") }), [t]);

  return <MyForm open onClose={onClose} title={t("userPermissions.title")}
    subtitle={query.data ? t("userPermissions.scope", { user: query.data.userName, company: query.data.companyName }) : ""}
    icon={<Security />} maxWidth="xl" onSubmit={save} isSubmitting={mutation.isPending}
    isDirty={form.formState.isDirty} isViewMode={!canEdit} hideFooter={!canEdit}
    submitDisabled={!query.data || query.isPending || !canView} submitButtonText={t("actions.save")}
    errors={form.formState.errors.permissions?.message ? { permissions: form.formState.errors.permissions.message } : {}}
    errorLabels={errorLabels}
    mockDataAction={{ onGenerate: () => replaceSelection(rows.filter((row) => row.canGrant).slice(0, 3).map((row) => row.permission)), disabled: !canEdit || !query.data }}>
    <Stack spacing={2}>
      <Alert severity="info">{t("userPermissions.additiveHint")}</Alert>
      {mutation.isError ? <Alert severity="error" action={<Button onClick={async () => {
        if (!await requestDiscard()) return;
        const refreshed = await query.refetch();
        if (refreshed.data) {
          baseline.current = refreshed.data;
          form.reset({ permissions: refreshed.data.permissions.filter((row) => row.isDirect).map((row) => row.permission) });
          mutation.reset();
        }
      }}>{t("userPermissions.reload")}</Button>}>{t("userPermissions.saveFailed")}</Alert> : null}
      {!canView ? <Alert severity="warning">{t("userPermissions.forbidden")}</Alert>
        : query.isPending ? <FeedbackState icon={<CircularProgress />} title={t("general.loading")} />
        : query.isError ? <FeedbackState icon={<Security />} role="alert" title={t("userPermissions.loadFailed")}
          actions={<Button onClick={() => { baseline.current = null; void query.refetch(); }}>{t("userPermissions.reload")}</Button>} />
        : <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" }, minHeight: 420 }}>
          <RolePermissionsModuleRail modules={modules} selectedModule={activeModule} onSelect={(value) => { setSelectedModule(value); setScreen(""); }} />
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <RolePermissionsFilters screens={screens} selectedScreen={screen} searchTerm={search}
              showOnlySelected={onlySelected} resultCount={filtered.length} totalCount={screens.length}
              onSearchChange={setSearch} onScreenChange={setScreen} onShowOnlySelectedChange={setOnlySelected}
              onReset={() => { setSearch(""); setScreen(""); setOnlySelected(false); }} />
            {form.formState.errors.permissions?.message ? <Typography color="error" role="alert">{form.formState.errors.permissions.message}</Typography> : null}
            {filtered.length ? <RolePermissionsCards screens={filtered} actions={actions} claims={claims}
              onSelectScreen={selectScreen} onToggle={toggle} readOnly={!canEdit || mutation.isPending}
              isClaimDisabled={(index) => !rows[index]?.canGrant && !rows[index]?.isDirect}
              renderClaimDetails={(index) => {
                const row = rows[index];
                return <Typography component="span" variant="caption" sx={{ display: "block" }}>
                  {row.inheritedFrom.length ? t("userPermissions.inherited", { roles: row.inheritedFrom.join(", ") }) : t("userPermissions.noInherited")}
                  {" · "}{t(selected.includes(row.permission) || row.inheritedFrom.length ? "userPermissions.effective" : "userPermissions.notGranted")}
                </Typography>;
              }} /> : <EmptyState title={t("roles.noPermissionMatches")} />}
          </Stack>
        </Box>}
    </Stack>
  </MyForm>;
}
