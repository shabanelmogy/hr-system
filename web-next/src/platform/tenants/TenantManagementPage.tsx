"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ContactMailRoundedIcon from "@mui/icons-material/ContactMailRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import {
  Alert,
  alpha,
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Controller, type FieldErrors, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  FormTabs,
  MyDateTimeField,
  MyForm,
  MySelect,
  MyTextField,
  type FormTab,
} from "@/shared/components/forms";
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
import {
  getFirstTenantErrorField,
  getFirstTenantErrorTab,
  type TenantFormTab,
} from "./tenantFormTabs";
import {
  toLauncherModule,
  useTenantEntitlementModulesQuery,
  type ErpModule,
} from "@/platform/modules";
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
import { resolveModuleAccent } from "@/shared/components/layout/navigation";

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
  const tenantEntitlementModulesQuery = useTenantEntitlementModulesQuery();
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
    setForm(createEmptyForm(tenantEntitlementModulesQuery.data ?? []));
  };

  const openEdit = (tenant: TenantManagementResponse) => {
    setEditing(tenant);
    setForm(toForm(tenant, tenantEntitlementModulesQuery.data ?? []));
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
        loading={tenantsQuery.isLoading || tenantEntitlementModulesQuery.isLoading}
        isFetching={tenantsQuery.isFetching || list.isSearchPending}
        error={tenantsQuery.error ?? tenantEntitlementModulesQuery.error}
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
          void tenantEntitlementModulesQuery.refetch();
        }}
        onPageChange={list.setPage}
        onPageSizeChange={list.setPageSize}
        onSearchChange={list.setSearchValue}
        onSortChange={list.setSort}
        onReset={list.reset}
      />

      {form ? (
        <TenantEditor
          form={form}
          isEdit={Boolean(editing)}
          error={saveMutation.isError ? getErrorMessage(saveMutation.error) : null}
          loading={saveMutation.isPending}
          onClose={closeDialog}
          onSave={save}
          tenantEntitlementModules={tenantEntitlementModulesQuery.data ?? []}
        />
      ) : null}
    </ContentWrapper>
  );
}

function TenantEditor({
  form,
  isEdit,
  error,
  loading,
  onClose,
  onSave,
  tenantEntitlementModules,
}: {
  form: TenantFormState;
  isEdit: boolean;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSave: (form: TenantFormState) => void;
  tenantEntitlementModules: ErpModule[];
}) {
  const { t } = useTranslation();
  const theme = useTheme();
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
    formState: { errors, isDirty },
  } = useForm<TenantFormState>({
    defaultValues: form,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const subscriptionStartedOn = useWatch({ control, name: "subscriptionStartedOn" });
  const enabledEntitlementCount = useWatch({ control, name: "entitlements" })?.length ?? 0;
  const [activeTab, setActiveTab] = useState<TenantFormTab>("identity");
  const [focusField, setFocusField] = useState<keyof TenantFormState | null>(null);
  const [selectedEntitlementModuleCode, setSelectedEntitlementModuleCode] = useState(
    () => tenantEntitlementModules[0]?.code ?? "",
  );

  useEffect(() => {
    if (!focusField || typeof document === "undefined") return;
    const field = focusField;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[name="${String(field)}"]`)?.focus();
      setFocusField(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, focusField]);

  const handleInvalid = (validationErrors: FieldErrors<TenantFormState>) => {
    setActiveTab(getFirstTenantErrorTab(validationErrors));
    setFocusField(getFirstTenantErrorField(validationErrors));
  };

  const handleClose = async () => {
    if (loading) return;
    onClose();
  };

  const tabs: FormTab<TenantFormTab>[] = [
    {
      value: "identity",
      label: t("tenantManagement.tabs.identity"),
      icon: <ApartmentRoundedIcon fontSize="small" />,
      hasError: Boolean(errors.identifier || errors.name || errors.isActive),
      content: (
        <TenantFormSection
          icon={<ApartmentRoundedIcon fontSize="small" />}
          title={t("tenantManagement.sections.identity")}
          description={t("tenantManagement.sections.identityDescription")}
        >
          <Box sx={formGridSx}>
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
            <Box
              sx={{
                gridColumn: { xs: "1", md: "1 / -1" },
                display: "flex",
                alignItems: "center",
                minHeight: 44,
                px: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ m: 0 }}
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
            </Box>
          </Box>
        </TenantFormSection>
      ),
    },
    {
      value: "subscription",
      label: t("tenantManagement.tabs.subscription"),
      icon: <CalendarMonthRoundedIcon fontSize="small" />,
      hasError: Boolean(
        errors.planName ||
        errors.subscriptionStatus ||
        errors.subscriptionStartedOn ||
        errors.subscriptionEndsOn ||
        errors.maxAdmins ||
        errors.maxUsers,
      ),
      content: (
        <Stack spacing={2.5}>
          <TenantFormSection
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            title={t("tenantManagement.sections.subscription")}
            description={t("tenantManagement.sections.subscriptionDescription")}
            >
            <Box sx={formGridSx}>
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
              <Controller
                control={control}
                name="subscriptionStartedOn"
                render={({ field }) => (
                  <MyDateTimeField
                    fieldName={field.name}
                    label={t("tenantManagement.startsOn")}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mode="date"
                    size="medium"
                    required
                    error={Boolean(errors.subscriptionStartedOn)}
                    helperText={errors.subscriptionStartedOn?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="subscriptionEndsOn"
                render={({ field }) => (
                  <MyDateTimeField
                    fieldName={field.name}
                    label={t("tenantManagement.endsOn")}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    mode="date"
                    size="medium"
                    required
                    minDate={subscriptionStartedOn ? dayjs(subscriptionStartedOn) : undefined}
                    error={Boolean(errors.subscriptionEndsOn)}
                    helperText={errors.subscriptionEndsOn?.message}
                  />
                )}
              />
            </Box>
          </TenantFormSection>

          <TenantFormSection
            icon={<GroupRoundedIcon fontSize="small" />}
            title={t("tenantManagement.sections.capacity")}
            description={t("tenantManagement.sections.capacityDescription")}
          >
            <Box sx={formGridSx}>
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
            </Box>
          </TenantFormSection>
        </Stack>
      ),
    },
    {
      value: "contact",
      label: t("tenantManagement.tabs.contact"),
      icon: <ContactMailRoundedIcon fontSize="small" />,
      hasError: Boolean(errors.billingEmail || errors.contactName || errors.contactPhone),
      content: (
        <TenantFormSection
          icon={<ContactMailRoundedIcon fontSize="small" />}
          title={t("tenantManagement.sections.contact")}
          description={t("tenantManagement.sections.contactDescription")}
        >
          <Box sx={formGridSx}>
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
          </Box>
        </TenantFormSection>
      ),
    },
    {
      value: "entitlements",
      label: t("tenantManagement.tabs.entitlements"),
      icon: <AppsRoundedIcon fontSize="small" />,
      hasError: Boolean(errors.entitlements),
      content: (
        <TenantFormSection
          icon={<AppsRoundedIcon fontSize="small" />}
          title={t("tenantManagement.entitlements")}
          description={t("tenantManagement.sections.entitlementsDescription")}
          action={(
            <Chip
              size="medium"
              label={`${enabledEntitlementCount}/${tenantEntitlementModules.length}`}
              aria-label={t("tenantManagement.enabledModulesCount", {
                enabled: enabledEntitlementCount,
                total: tenantEntitlementModules.length,
              })}
              sx={{
                minWidth: 62,
                fontWeight: 900,
                color: enabledEntitlementCount > 0 ? "primary.contrastText" : "text.secondary",
                bgcolor: enabledEntitlementCount > 0 ? "primary.main" : "action.selected",
              }}
            />
          )}
        >
          <Controller
            control={control}
            name="entitlements"
            render={({ field }) => {
              return (
                <Stack spacing={2.5}>
                  {tenantEntitlementModules.length === 0 ? null : (() => {
                    const selectedModule = tenantEntitlementModules.find(
                      (module) => module.code.toLowerCase() === selectedEntitlementModuleCode.toLowerCase(),
                    ) ?? tenantEntitlementModules[0];
                    const selectedCurrent = field.value.find(
                      (item) => item.moduleCode.toLowerCase() === selectedModule.code.toLowerCase(),
                    );
                    const selectedPresentation = toLauncherModule(selectedModule);
                    const selectedAccent = resolveModuleAccent(selectedPresentation.accentColor, theme)
                      ?? theme.palette[selectedPresentation.tone ?? "primary"].main;
                    const selectedModuleLabel = t(`modules.${selectedModule.code}`, {
                      defaultValue: selectedModule.name,
                    });

                    return (
                      <Paper
                        variant="outlined"
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "260px minmax(0, 1fr)" },
                          minHeight: 420,
                          overflow: "hidden",
                          borderRadius: 3,
                        }}
                      >
                        <Box
                          component="aside"
                          sx={{
                            borderInlineEnd: { md: 1 },
                            borderBottom: { xs: 1, md: 0 },
                            borderColor: "divider",
                            bgcolor: alpha(theme.palette.background.default, 0.48),
                            p: 1,
                          }}
                        >
                          <Stack spacing={0.75}>
                            {tenantEntitlementModules.map((module) => {
                              const current = field.value.find(
                                (item) => item.moduleCode.toLowerCase() === module.code.toLowerCase(),
                              );
                              const presentation = toLauncherModule(module);
                              const accent = resolveModuleAccent(presentation.accentColor, theme)
                                ?? theme.palette[presentation.tone ?? "primary"].main;
                              const moduleLabel = t(`modules.${module.code}`, { defaultValue: module.name });
                              const selected = module.code.toLowerCase() === selectedModule.code.toLowerCase();

                              return (
                                <Box
                                  key={module.code}
                                  component="button"
                                  type="button"
                                  onClick={() => setSelectedEntitlementModuleCode(module.code)}
                                  sx={{
                                    display: "flex",
                                    width: "100%",
                                    alignItems: "center",
                                    gap: 1.1,
                                    p: 1.1,
                                    border: 1,
                                    borderColor: selected ? alpha(accent, 0.65) : "transparent",
                                    borderRadius: 2,
                                    color: "text.primary",
                                    bgcolor: selected ? alpha(accent, 0.1) : "transparent",
                                    textAlign: "start",
                                    cursor: "pointer",
                                    font: "inherit",
                                    transition: theme.transitions.create(
                                      ["background-color", "border-color", "transform"],
                                      { duration: theme.transitions.duration.shortest },
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(accent, selected ? 0.14 : 0.06),
                                      borderColor: alpha(accent, 0.3),
                                    },
                                  }}
                                >
                                  <Box
                                    aria-hidden
                                    sx={{
                                      display: "grid",
                                      width: 36,
                                      height: 36,
                                      flexShrink: 0,
                                      placeItems: "center",
                                      borderRadius: 2,
                                      color: current ? theme.palette.getContrastText(accent) : accent,
                                      bgcolor: current ? accent : alpha(accent, 0.11),
                                    }}
                                  >
                                    {presentation.icon}
                                  </Box>
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: selected ? 900 : 700 }} noWrap>
                                      {moduleLabel}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {current
                                        ? t("tenantManagement.enabled")
                                        : t("tenantManagement.disabled")}
                                    </Typography>
                                  </Box>
                                  <Box
                                    aria-hidden
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      flexShrink: 0,
                                      borderRadius: "50%",
                                      bgcolor: current ? accent : "action.disabled",
                                      boxShadow: current ? `0 0 0 4px ${alpha(accent, 0.12)}` : "none",
                                    }}
                                  />
                                </Box>
                              );
                            })}
                          </Stack>
                        </Box>

                        <Box sx={{ minWidth: 0, p: { xs: 2, sm: 2.5 } }}>
                          <Stack spacing={2.25}>
                            {selectedModule.submodules.length > 0 ? (
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                    mb: 1.25,
                                  }}
                                >
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                      {t("tenantManagement.functionalAreas")}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={t("tenantManagement.selectedAreasCount", {
                                        selected: selectedCurrent?.submoduleCodes.length ?? 0,
                                        total: selectedModule.submodules.length,
                                      })}
                                      sx={{
                                        fontWeight: 800,
                                        color: selectedCurrent ? selectedAccent : "text.secondary",
                                        bgcolor: selectedCurrent ? alpha(selectedAccent, 0.1) : "action.hover",
                                        border: 1,
                                        borderColor: selectedCurrent ? alpha(selectedAccent, 0.26) : "divider",
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                      {selectedCurrent
                                        ? t("tenantManagement.enabled")
                                        : t("tenantManagement.disabled")}
                                    </Typography>
                                    <Switch
                                      size="small"
                                      checked={Boolean(selectedCurrent)}
                                      onChange={(_, checked) => {
                                        field.onChange(toggleModuleEntitlement(field.value, selectedModule, checked));
                                      }}
                                      slotProps={{ input: { "aria-label": selectedModuleLabel } }}
                                      sx={{
                                        "& .MuiSwitch-switchBase.Mui-checked": { color: selectedAccent },
                                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                          bgcolor: selectedAccent,
                                        },
                                      }}
                                    />
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                      xs: "1fr",
                                      sm: "repeat(2, minmax(0, 1fr))",
                                    },
                                    gap: 1,
                                  }}
                                >
                                  {selectedModule.submodules.map((submodule) => {
                                    const checked = selectedCurrent?.submoduleCodes.some(
                                      (code) => code.toLowerCase() === submodule.code.toLowerCase(),
                                    ) ?? false;
                                    const label = t(
                                      `modules.submodules.${selectedModule.code}.${submodule.code}`,
                                      { defaultValue: submodule.name },
                                    );

                                    return (
                                      <Box
                                        key={submodule.code}
                                        sx={{
                                          minWidth: 0,
                                          border: 1,
                                          borderColor: checked ? alpha(selectedAccent, 0.65) : "divider",
                                          borderRadius: 2,
                                          bgcolor: checked ? alpha(selectedAccent, 0.09) : "background.paper",
                                          opacity: selectedCurrent ? 1 : 0.5,
                                          transition: theme.transitions.create(
                                            ["border-color", "background-color", "opacity"],
                                            { duration: theme.transitions.duration.shortest },
                                          ),
                                          ...(selectedCurrent && {
                                            "&:hover": {
                                              borderColor: alpha(selectedAccent, 0.5),
                                              bgcolor: alpha(selectedAccent, checked ? 0.13 : 0.05),
                                            },
                                          }),
                                        }}
                                      >
                                        <FormControlLabel
                                          sx={{
                                            m: 0,
                                            width: "100%",
                                            px: 1,
                                            py: 0.45,
                                            "& .MuiFormControlLabel-label": {
                                              minWidth: 0,
                                              fontSize: "0.84rem",
                                            },
                                          }}
                                          label={label}
                                          control={(
                                            <Checkbox
                                              size="small"
                                              disabled={!selectedCurrent}
                                              checked={checked}
                                              sx={{
                                                color: alpha(selectedAccent, 0.62),
                                                "&.Mui-checked": { color: selectedAccent },
                                              }}
                                              onChange={(_, enabled) => {
                                                field.onChange(toggleSubmoduleEntitlement(
                                                  field.value,
                                                  selectedModule.code,
                                                  submodule.code,
                                                  enabled,
                                                ));
                                              }}
                                            />
                                          )}
                                        />
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            ) : null}
                          </Stack>
                        </Box>
                      </Paper>
                    );
                  })()}
                </Stack>
              );
            }}
          />
        </TenantFormSection>
      ),
    },
    {
      value: "notes",
      label: t("tenantManagement.tabs.notes"),
      icon: <NotesRoundedIcon fontSize="small" />,
      hasError: Boolean(errors.notes),
      content: (
        <TenantFormSection
          icon={<NotesRoundedIcon fontSize="small" />}
          title={t("tenantManagement.notes")}
          description={t("tenantManagement.sections.notesDescription")}
        >
          <MyTextField
            counter
            errors={errors}
            fieldName="notes"
            label={t("tenantManagement.notes")}
            margin="none"
            maxValue={2000}
            multiline
            register={register}
            rows={5}
          />
        </TenantFormSection>
      ),
    },
  ];

  const editorContent = (
    <Stack spacing={2.5}>
      <FormTabs<TenantFormTab>
        label={t("tenantManagement.tabs.label")}
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
        panelSx={{ pt: 2.5 }}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );

  return (
    <MyForm
      open
      maxWidth="lg"
      title={isEdit ? t("tenantManagement.editTenant") : t("tenantManagement.addTenant")}
      subtitle={t("tenantManagement.formSubtitle")}
      onClose={() => void handleClose()}
      onSubmit={(event) => void handleSubmit(onSave, handleInvalid)(event)}
      isSubmitting={loading}
      isDirty={isDirty}
      errors={error ? { server: error } : undefined}
      submitButtonText={t("actions.save")}
      variant="modern"
    >
      {editorContent}
    </MyForm>
  );
}

const formGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  columnGap: { xs: 2, md: 3 },
  rowGap: 2.25,
  alignItems: "start",
};

function TenantFormSection({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Shown at the end of the header row (e.g. a count badge). */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: "grid",
            width: 36,
            height: 36,
            flexShrink: 0,
            placeItems: "center",
            borderRadius: 2,
            color: "primary.main",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.35 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {description}
          </Typography>
        </Box>
        {action ? <Box sx={{ flexShrink: 0, alignSelf: "center" }}>{action}</Box> : null}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        {children}
      </Box>
    </Paper>
  );
}

function createEmptyForm(tenantEntitlementModules: ErpModule[]): TenantFormState {
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
    entitlements: createDefaultEntitlements(tenantEntitlementModules),
  };
}

function toForm(
  tenant: TenantManagementResponse,
  tenantEntitlementModules: readonly ErpModule[],
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
    entitlements: hydrateEntitlements(tenant.entitlements, tenantEntitlementModules),
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
