"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { ContentWrapper } from "@/shared/components/layout";
import {
  getLastServerListPage,
  useServerListState,
} from "@/shared/hooks/useServerListState";
import TenantManagementMultiView from "./components/TenantManagementMultiView";
import { tenantApi, tenantKeys } from "./tenantApi";
import { toTenantPageQuery } from "./tenantPageQuery";
import {
  createTenantValidationSchema,
  type TenantFormState,
} from "./tenantValidation";
import { useTenantPage } from "./useTenantsQuery";
import { useInstalledModulesQuery, type ErpModule } from "@/platform/modules";
import {
  createDefaultEntitlements,
  hydrateEntitlements,
  toggleModuleEntitlement,
  toggleSubmoduleEntitlement,
} from "./entitlements";
import {
  subscriptionStatuses,
  type TenantListFilters,
  type TenantManagementRequest,
  type TenantManagementResponse,
  type TenantSortColumn,
} from "./types";

const defaultTenantFilters: TenantListFilters = { includeArchived: false };

export default function TenantManagementPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<TenantManagementResponse | null>(null);
  const [form, setForm] = useState<TenantFormState | null>(null);
  const list = useServerListState<TenantSortColumn, TenantListFilters>({
    defaultColumn: "name",
    defaultSortDirection: "ASC",
    defaultFilters: defaultTenantFilters,
    defaultPageSize: 10,
  });
  const pageQuery = useMemo(
    () => toTenantPageQuery(list.state, list.debouncedSearchValue),
    [list.debouncedSearchValue, list.state],
  );
  const tenantsQuery = useTenantPage(pageQuery);
  const installedModulesQuery = useInstalledModulesQuery();
  const tenants = tenantsQuery.data?.items ?? [];
  const totalCount = tenantsQuery.data?.metaData.totalCount ?? 0;
  const currentPage = list.state.page;
  const currentPageSize = list.state.pageSize;
  const setListPage = list.setPage;

  useEffect(() => {
    if (!tenantsQuery.data) return;
    const lastPage = getLastServerListPage(totalCount, currentPageSize);
    if (currentPage > lastPage) setListPage(lastPage);
  }, [currentPage, currentPageSize, setListPage, tenantsQuery.data, totalCount]);

  const saveMutation = useMutation({
    mutationFn: ({ id, request }: { id: string | null; request: TenantManagementRequest }) =>
      id ? tenantApi.update(id, request) : tenantApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      setEditing(null);
      setForm(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(createEmptyForm(installedModulesQuery.data ?? []));
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    setEditing(tenant);
    setForm(toForm(tenant, installedModulesQuery.data ?? []));
  };

  const closeDialog = () => {
    if (saveMutation.isPending) return;
    setEditing(null);
    setForm(null);
    saveMutation.reset();
  };

  const save = (values: TenantFormState) => {
    saveMutation.mutate({
      id: editing?.id ?? null,
      request: toRequest(values, editing?.rowVersion),
    });
  };

  return (
    <ContentWrapper fillAvailable>
      <TenantManagementMultiView
        tenants={tenants}
        loading={tenantsQuery.isLoading || installedModulesQuery.isLoading}
        isFetching={tenantsQuery.isFetching || list.isSearchPending}
        error={tenantsQuery.error ?? installedModulesQuery.error}
        page={list.state.page}
        pageSize={list.state.pageSize}
        totalCount={totalCount}
        searchValue={list.state.searchValue}
        sortColumn={list.state.columnName}
        sortDirection={list.state.sortDirection}
        onAdd={openCreate}
        onEdit={openEdit}
        onRefresh={() => void tenantsQuery.refetch()}
        onRetry={() => {
          void tenantsQuery.refetch();
          void installedModulesQuery.refetch();
        }}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        onSearchChange={list.setSearchValue}
        onSortChange={list.setSort}
        onReset={list.reset}
      />

      {form ? (
        <TenantDialog
          form={form}
          isEdit={Boolean(editing)}
          error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
          loading={saveMutation.isPending}
          onClose={closeDialog}
          onSave={save}
          installedModules={installedModulesQuery.data ?? []}
        />
      ) : null}
    </ContentWrapper>
  );
}

function TenantDialog({
  form,
  isEdit,
  error,
  loading,
  onClose,
  onSave,
  installedModules,
}: {
  form: TenantFormState;
  isEdit: boolean;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSave: (form: TenantFormState) => void;
  installedModules: ErpModule[];
}) {
  const { t } = useTranslation();
  const schema = useMemo(
    () => createTenantValidationSchema({
      required: t("validation.required"),
      maxLength: (count) => t("validation.maxLength", { count }),
      invalidIdentifier: t("tenantManagement.validation.invalidIdentifier"),
      invalidOption: t("tenantManagement.validation.invalidOption"),
      invalidDate: t("tenantManagement.validation.invalidDate"),
      endDateBeforeStart: t("tenantManagement.validation.endDateBeforeStart"),
      wholeNumberMin: (minimum) =>
        t("tenantManagement.validation.wholeNumberMin", { minimum }),
      invalidEmail: t("validation.invalidEmail"),
    }),
    [t],
  );
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TenantFormState>({
    defaultValues: form,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const subscriptionStartedOn = useWatch({ control, name: "subscriptionStartedOn" });

  return (
    <MyForm
      open
      maxWidth="md"
      title={isEdit ? t("tenantManagement.editTenant") : t("tenantManagement.addTenant")}
      onClose={onClose}
      onSubmit={(event) => void handleSubmit(onSave)(event)}
      isSubmitting={loading}
      errors={error ? { server: error } : undefined}
      submitButtonText={t("actions.save")}
    >
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          <MyTextField
            counter
            errors={errors}
            fieldName="identifier"
            label={t("tenantManagement.identifier")}
            margin="none"
            maxValue={100}
            register={register}
            required
          />
          <MyTextField
            counter
            errors={errors}
            fieldName="name"
            label={t("tenantManagement.name")}
            margin="none"
            maxValue={200}
            register={register}
            required
          />
          <MyTextField
            counter
            errors={errors}
            fieldName="planName"
            label={t("tenantManagement.plan")}
            margin="none"
            maxValue={100}
            register={register}
          />
          <MySelect
            all={false}
            control={control}
            dataSource={subscriptionStatuses.map((status) => ({
              label: t(`tenantManagement.statuses.${status}`),
              value: status,
            }))}
            displayMember="label"
            errors={errors}
            label={t("tenantManagement.status")}
            name="subscriptionStatus"
            required
            showClearButton={false}
            valueMember="value"
          />
          <MyTextField
            counter={false}
            errors={errors}
            fieldName="subscriptionStartedOn"
            label={t("tenantManagement.startsOn")}
            margin="none"
            register={register}
            required
            type="date"
          />
          <MyTextField
            counter={false}
            errors={errors}
            fieldName="subscriptionEndsOn"
            label={t("tenantManagement.endsOn")}
            margin="none"
            register={register}
            required
            slotProps={{ htmlInput: { min: subscriptionStartedOn || undefined } }}
            type="date"
          />
          <MyTextField
            counter={false}
            errors={errors}
            fieldName="maxAdmins"
            label={t("tenantManagement.maxAdmins")}
            margin="none"
            minValue={1}
            register={register}
            required
            type="number"
          />
          <MyTextField
            counter={false}
            errors={errors}
            fieldName="maxUsers"
            label={t("tenantManagement.maxUsers")}
            margin="none"
            minValue={0}
            register={register}
            required
            type="number"
          />
          <MyTextField
            counter
            errors={errors}
            fieldName="billingEmail"
            label={t("tenantManagement.billingEmail")}
            margin="none"
            maxValue={256}
            register={register}
            type="email"
          />
          <MyTextField
            counter
            errors={errors}
            fieldName="contactName"
            label={t("tenantManagement.contactName")}
            margin="none"
            maxValue={200}
            register={register}
          />
          <MyTextField
            counter
            errors={errors}
            fieldName="contactPhone"
            label={t("tenantManagement.contactPhone")}
            margin="none"
            maxValue={32}
            register={register}
            type="tel"
          />
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel
                control={(
                  <Switch
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                )}
                label={t("tenantManagement.tenantEnabled")}
              />
            )}
          />
          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <MyTextField
              counter
              errors={errors}
              fieldName="notes"
              label={t("tenantManagement.notes")}
              margin="none"
              maxValue={2000}
              multiline
              register={register}
              rows={3}
            />
          </Box>
          <Box sx={{ gridColumn: { sm: "1 / -1" }, mt: 1 }}>
            <Box sx={{ fontWeight: 700, mb: 1 }}>{t("tenantManagement.entitlements")}</Box>
            <Controller
              control={control}
              name="entitlements"
              render={({ field }) => (
                <Box sx={{ display: "grid", gap: 1 }}>
                  {installedModules.map(module => {
                    const current = field.value.find(
                      item => item.moduleCode.toLowerCase() === module.code.toLowerCase(),
                    );
                    return (
                      <Box key={module.code} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                        <FormControlLabel
                          label={module.code === "hr" ? t("modules.hr") : module.code === "acc" ? t("modules.accounting") : module.name}
                          control={<Checkbox checked={Boolean(current)} onChange={(_, checked) => {
                            field.onChange(toggleModuleEntitlement(field.value, module, checked));
                          }} />}
                        />
                        {module.submodules.length > 0 && current ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pl: 4 }}>
                            {module.submodules.map(submodule => (
                              <FormControlLabel key={submodule.code} label={t(`modules.submodules.${module.code}.${submodule.code}`, { defaultValue: submodule.name })} control={<Checkbox size="small" checked={current.submoduleCodes.some(code => code.toLowerCase() === submodule.code.toLowerCase())} onChange={(_, checked) => {
                                field.onChange(toggleSubmoduleEntitlement(
                                  field.value,
                                  module.code,
                                  submodule.code,
                                  checked,
                                ));
                              }} />} />
                            ))}
                          </Box>
                        ) : null}
                      </Box>
                    );
                  })}
                </Box>
              )}
            />
          </Box>
          </Box>
          {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}
    </MyForm>
  );
}

function createEmptyForm(installedModules: ErpModule[]): TenantFormState {
  return {
    identifier: "",
    name: "",
    isActive: true,
    subscriptionStatus: "free",
    subscriptionStartedOn: new Date().toISOString().slice(0, 10),
    subscriptionEndsOn: "",
    planName: "Free",
    maxAdmins: "1",
    maxUsers: "5",
    billingEmail: "",
    contactName: "",
    contactPhone: "",
    notes: "",
    entitlements: createDefaultEntitlements(installedModules),
  };
}

function toForm(
  tenant: TenantManagementResponse,
  installedModules: readonly ErpModule[],
): TenantFormState {
  return {
    identifier: tenant.identifier,
    name: tenant.name,
    isActive: tenant.isActive,
    subscriptionStatus: tenant.subscriptionStatus,
    subscriptionStartedOn: tenant.subscriptionStartedOn.slice(0, 10),
    subscriptionEndsOn: tenant.subscriptionEndsOn?.slice(0, 10) ?? "",
    planName: tenant.planName ?? "",
    maxAdmins: String(tenant.maxAdmins),
    maxUsers: String(tenant.maxUsers),
    billingEmail: tenant.billingEmail ?? "",
    contactName: tenant.contactName ?? "",
    contactPhone: tenant.contactPhone ?? "",
    notes: tenant.notes ?? "",
    entitlements: hydrateEntitlements(tenant.entitlements, installedModules),
  };
}

function toRequest(form: TenantFormState, rowVersion?: string): TenantManagementRequest {
  const optional = (value: string) => value.trim() || null;
  return {
    identifier: form.identifier.trim(),
    name: form.name.trim(),
    isActive: form.isActive,
    subscriptionStatus: form.subscriptionStatus,
    subscriptionStartedOn: new Date(`${form.subscriptionStartedOn}T00:00:00Z`).toISOString(),
    subscriptionEndsOn: new Date(`${form.subscriptionEndsOn}T23:59:59Z`).toISOString(),
    planName: optional(form.planName),
    maxAdmins: Math.max(1, Number.parseInt(form.maxAdmins, 10) || 1),
    maxUsers: Math.max(0, Number.parseInt(form.maxUsers, 10) || 0),
    billingEmail: optional(form.billingEmail),
    contactName: optional(form.contactName),
    contactPhone: optional(form.contactPhone),
    notes: optional(form.notes),
    rowVersion: rowVersion ?? null,
    entitlements: form.entitlements,
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Unable to save tenant.";
}
