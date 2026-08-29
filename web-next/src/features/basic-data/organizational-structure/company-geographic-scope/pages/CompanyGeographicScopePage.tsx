"use client";

import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import {
  type Resolver,
  type SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { permissions } from "@/lib/auth/permissions";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";
import { MySelect } from "@/shared/components/forms/selects";
import useNotifications from "@/shared/hooks/useNotifications";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import {
  useCompanyGeographicScope,
  useUpdateCompanyGeographicScope,
} from "../hooks/useCompanyGeographicScope";
import CompanyGeographicScopeMultiView from "../components/CompanyGeographicScopeMultiView";
import type {
  CompanyCountryOption,
  CompanyGeographicScopeFormValues,
} from "../types/CompanyGeographicScope";

const emptyValues: CompanyGeographicScopeFormValues = {
  countryIds: [],
  registrationCountryId: 0,
  defaultCountryId: 0,
};

export default function CompanyGeographicScopePage() {
  const { i18n, t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const canView = hasPermission(permissions.ViewCompanyGeographicScope);
  const canManage = hasPermission(permissions.ManageCompanyGeographicScope);

  const schema = useMemo(
    () => z.object({
      countryIds: z.array(z.number().int().positive())
        .min(1, t("companyGeographicScope.validation.countriesRequired"))
        .max(100, t("companyGeographicScope.validation.countryLimit")),
      registrationCountryId: z.number().int().positive(
        t("companyGeographicScope.validation.registrationRequired"),
      ),
      defaultCountryId: z.number().int().positive(
        t("companyGeographicScope.validation.defaultRequired"),
      ),
    }).superRefine((value, context) => {
      if (!value.countryIds.includes(value.registrationCountryId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["registrationCountryId"],
          message: t("companyGeographicScope.validation.registrationMustBeSelected"),
        });
      }
      if (!value.countryIds.includes(value.defaultCountryId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["defaultCountryId"],
          message: t("companyGeographicScope.validation.defaultMustBeSelected"),
        });
      }
    }),
    [t],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<CompanyGeographicScopeFormValues>({
    resolver: zodResolver(schema) as Resolver<CompanyGeographicScopeFormValues>,
    mode: "onChange",
    defaultValues: emptyValues,
  });

  const scopeQuery = useCompanyGeographicScope(canView);
  const updateMutation = useUpdateCompanyGeographicScope({
    onSuccess: (scope) => {
      reset({
        countryIds: scope.countries.filter((country) => country.isSelected).map((country) => country.id),
        registrationCountryId: scope.registrationCountryId ?? 0,
        defaultCountryId: scope.defaultCountryId ?? 0,
      });
      showSuccess(t("companyGeographicScope.saved"));
    },
    onError: (error) => showError(extractErrorMessage(error)),
  });

  useEffect(() => {
    if (!scopeQuery.data) return;
    reset({
      countryIds: scopeQuery.data.countries
        .filter((country) => country.isSelected)
        .map((country) => country.id),
      registrationCountryId: scopeQuery.data.registrationCountryId ?? 0,
      defaultCountryId: scopeQuery.data.defaultCountryId ?? 0,
    });
  }, [reset, scopeQuery.data]);

  const watchedCountryIds = useWatch({ control, name: "countryIds" });
  const selectedCountryIds = useMemo(
    () => watchedCountryIds ?? [],
    [watchedCountryIds],
  );
  const defaultCountryId = useWatch({ control, name: "defaultCountryId" });
  const registrationCountryId = useWatch({ control, name: "registrationCountryId" });
  useEffect(() => {
    if (defaultCountryId > 0 && !selectedCountryIds.includes(defaultCountryId)) {
      setValue("defaultCountryId", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [defaultCountryId, selectedCountryIds, setValue]);
  useEffect(() => {
    if (registrationCountryId > 0 && !selectedCountryIds.includes(registrationCountryId)) {
      setValue("registrationCountryId", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [registrationCountryId, selectedCountryIds, setValue]);

  const countryOptions = useMemo(() => {
    const language = i18n.resolvedLanguage?.startsWith("ar") ? "ar" : "en";
    return (scopeQuery.data?.countries ?? []).map((country) => ({
      id: country.id,
      name: language === "ar"
        ? country.nameAr || country.nameEn
        : country.nameEn || country.nameAr,
    }));
  }, [i18n.resolvedLanguage, scopeQuery.data?.countries]);
  const selectedCountryOptions = useMemo(
    () => countryOptions.filter((country) => selectedCountryIds.includes(country.id)),
    [countryOptions, selectedCountryIds],
  );
  const displayedCountries = useMemo<CompanyCountryOption[]>(
    () => (scopeQuery.data?.countries ?? []).filter((country) =>
      selectedCountryIds.includes(country.id)),
    [scopeQuery.data?.countries, selectedCountryIds],
  );

  const submit: SubmitHandler<CompanyGeographicScopeFormValues> = async (values) => {
    if (isReadOnly) {
      notifyBlockedAction();
      return;
    }
    if (!canManage) {
      showError(t("companyGeographicScope.permissionDenied"));
      return;
    }
    await updateMutation.mutateAsync(values);
  };

  if (!canView) {
    return <Alert severity="error">{t("companyGeographicScope.permissionDenied")}</Alert>;
  }

  return (
    <Stack
      spacing={2}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          borderRadius: 2,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {scopeQuery.isLoading ? (
          <Stack sx={{ minHeight: 220, alignItems: "center", justifyContent: "center" }}>
            <CircularProgress aria-label={t("companyGeographicScope.loading")} />
          </Stack>
        ) : scopeQuery.isError ? (
          <Alert
            severity="error"
            action={(
              <Button color="inherit" size="small" onClick={() => scopeQuery.refetch()}>
                {t("common.retry")}
              </Button>
            )}
          >
            {extractErrorMessage(scopeQuery.error)}
          </Alert>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(submit)}
            noValidate
            sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}
          >
            <Stack spacing={2.25} sx={{ minHeight: 0, flex: 1 }}>
              <CompanyGeographicScopeMultiView
                countries={displayedCountries}
                defaultCountryId={defaultCountryId}
                registrationCountryId={registrationCountryId}
                isFetching={scopeQuery.isFetching || updateMutation.isPending}
                onRefresh={() => scopeQuery.refetch()}
                selectionControls={(
                  <>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 1.5, md: 2 }}
                    sx={{ width: "100%", minWidth: 0, mb: 2.25 }}
                  >
                    <MySelect
                      control={control}
                      name="countryIds"
                      dataSource={countryOptions}
                      label={t("companyGeographicScope.operatingCountries")}
                      valueMember="id"
                      displayMember="name"
                      multiple
                      required
                      disabled={!canManage || isReadOnly || updateMutation.isPending}
                      placeholder={t("companyGeographicScope.selectCountries")}
                      noOptionsText={t("companyGeographicScope.noCountries")}
                      sx={{ flex: { md: "1 1 0" }, minWidth: 0, width: { xs: "100%", md: "auto" } }}
                      onChange={(_, selected) => {
                        const nextIds = Array.isArray(selected)
                          ? selected.map((country) => country.id)
                          : [];
                        if (defaultCountryId > 0 && !nextIds.includes(defaultCountryId)) {
                          setValue("defaultCountryId", 0, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }
                        if (registrationCountryId > 0 && !nextIds.includes(registrationCountryId)) {
                          setValue("registrationCountryId", 0, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                    <MySelect
                      control={control}
                      name="registrationCountryId"
                      dataSource={selectedCountryOptions}
                      label={t("companyGeographicScope.registrationCountry")}
                      valueMember="id"
                      displayMember="name"
                      required
                      disabled={!canManage || isReadOnly || updateMutation.isPending || selectedCountryOptions.length === 0}
                      placeholder={t("companyGeographicScope.selectRegistrationCountry")}
                      helperText={t("companyGeographicScope.registrationCountryHelp")}
                      noOptionsText={t("companyGeographicScope.selectOperatingCountriesFirst")}
                      sx={{ flex: { md: "1 1 0" }, minWidth: 0, width: { xs: "100%", md: "auto" } }}
                    />
                    <MySelect
                      control={control}
                      name="defaultCountryId"
                      dataSource={selectedCountryOptions}
                      label={t("companyGeographicScope.defaultOperatingCountry")}
                      valueMember="id"
                      displayMember="name"
                      required
                      disabled={!canManage || isReadOnly || updateMutation.isPending || selectedCountryOptions.length === 0}
                      placeholder={t("companyGeographicScope.selectDefaultCountry")}
                      noOptionsText={t("companyGeographicScope.selectOperatingCountriesFirst")}
                      sx={{ flex: { md: "1 1 0" }, minWidth: 0, width: { xs: "100%", md: "auto" } }}
                    />
                  </Stack>
                  </>
                )}
              />

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                sx={{ justifyContent: "flex-end", gap: 1, flexWrap: "wrap", flexShrink: 0 }}
              >
                {canManage ? (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={updateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                    disabled={!isDirty || isReadOnly || updateMutation.isPending}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    {t("companyGeographicScope.save")}
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        )}
      </Paper>
      {SnackbarComponent}
    </Stack>
  );
}
