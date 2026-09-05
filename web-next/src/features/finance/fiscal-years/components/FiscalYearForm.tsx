"use client";

import { MyDateTimeField, MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FiscalYearDetail, FiscalYearMutationRequest } from "../types/FiscalYear";
import { getFiscalYearSchema, type FiscalYearFormValues } from "../validation/fiscalYearValidation";
import { buildFiscalPeriodPreview, endOfFiscalYear } from "../utils/fiscalPeriodPreview";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  item?: FiscalYearDetail | null;
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
  onSubmit: (request: FiscalYearMutationRequest) => Promise<void>;
}

const frequencies = [
  { id: 1 as const, labelKey: "fiscalYears.frequency.monthly" },
  { id: 2 as const, labelKey: "fiscalYears.frequency.quarterly" },
];

export default function FiscalYearForm({ open, mode, item, loading = false, detailError = null, onRetryDetail, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const readOnly = mode === "view";
  const fieldsReadOnly = readOnly || Boolean(detailError);
  const form = useForm<FiscalYearFormValues>({
    resolver: zodResolver(getFiscalYearSchema(t)) as Resolver<FiscalYearFormValues>,
    defaultValues: { code: "", nameAr: "", nameEn: "", startDate: "", endDate: "", periodFrequency: 1 },
    mode: "onSubmit",
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const code = useWatch({ control: form.control, name: "code" });
  const periodFrequency = useWatch({ control: form.control, name: "periodFrequency" });

  useEffect(() => {
    if (!open) return;
    form.reset(item && mode !== "add" ? {
      code: item.code,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      startDate: item.startDate,
      endDate: item.endDate,
      periodFrequency: item.periodFrequency,
    } : { code: "", nameAr: "", nameEn: "", startDate: "", endDate: "", periodFrequency: 1 });
  }, [form, item, mode, open]);

  useEffect(() => {
    if (!readOnly && startDate) {
      form.setValue("endDate", endOfFiscalYear(startDate), { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    }
  }, [form, readOnly, startDate]);

  const messages = Object.fromEntries(Object.entries(form.formState.errors)
    .flatMap(([key, value]) => value?.message ? [[key, String(value.message)]] : []));
  const frequencyOptions = frequencies.map(option => ({ id: option.id, label: t(option.labelKey) }));
  const displayedPeriods = useMemo(
    () => readOnly
      ? item?.periods ?? []
      : buildFiscalPeriodPreview(code, startDate, periodFrequency ?? 1),
    [code, item?.periods, periodFrequency, readOnly, startDate],
  );

  const fillMock = () => {
    const year = new Date().getFullYear() + 1;
    const values = { shouldDirty: true, shouldValidate: true };
    form.setValue("code", `FY-${year}`, values);
    form.setValue("nameAr", `السنة المالية ${year}`, values);
    form.setValue("nameEn", `Fiscal Year ${year}`, values);
    form.setValue("startDate", `${year}-01-01`, values);
    form.setValue("endDate", `${year}-12-31`, values);
    form.setValue("periodFrequency", 1, values);
  };

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t(`fiscalYears.form.${mode}Title`)}
      subtitle={t("fiscalYears.form.subtitle")}
      submitButtonText={mode === "edit" ? t("actions.update") : t("actions.create")}
      onSubmit={readOnly ? undefined : form.handleSubmit(async values => {
        try { await onSubmit({ ...values, periodFrequency: values.periodFrequency ?? 1 }); }
        catch (error) {
          applyApiFieldErrors(error, form.setError, {
            "FiscalYear.DuplicateCode": ["code"],
            "FiscalYear.OverlappingDates": ["startDate", "endDate"],
          });
        }
      })}
      isSubmitting={loading}
      submitDisabled={Boolean(detailError)}
      isDirty={form.formState.isDirty}
      hideFooter={readOnly}
      isViewMode={readOnly}
      recordId={item?.id}
      maxWidth="md"
      maxHeight="78vh"
      focusFieldName="code"
      autoFocusFirst
      errors={messages}
      mockDataAction={process.env.NODE_ENV !== "production" && !readOnly ? { onGenerate: fillMock, disabled: loading } : undefined}
    >
      {detailError ? <Alert severity="error" action={onRetryDetail ? <Button color="inherit" onClick={onRetryDetail}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
      <MyTextField fieldName="code" labelKey={t("fiscalYears.fields.code")} control={form.control} errors={form.formState.errors} maxLength={20} required readOnly={fieldsReadOnly} loading={loading} />
      <MyTextField fieldName="nameAr" labelKey={t("general.nameAr")} control={form.control} errors={form.formState.errors} maxLength={100} required readOnly={fieldsReadOnly} loading={loading} />
      <MyTextField fieldName="nameEn" labelKey={t("general.nameEn")} control={form.control} errors={form.formState.errors} maxLength={100} required readOnly={fieldsReadOnly} loading={loading} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Controller name="startDate" control={form.control} render={({ field, fieldState }) => (
            <MyDateTimeField fieldName={field.name} label={t("fiscalYears.fields.startDate")} value={field.value} onChange={field.onChange} onBlur={field.onBlur} mode="date" required disabled={fieldsReadOnly || loading} error={!!fieldState.error} helperText={fieldState.error?.message} />
          )} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Controller name="endDate" control={form.control} render={({ field, fieldState }) => (
            <MyDateTimeField fieldName={field.name} label={t("fiscalYears.fields.endDate")} value={field.value} onChange={field.onChange} onBlur={field.onBlur} mode="date" required disabled error={!!fieldState.error} helperText={fieldState.error?.message ?? t("fiscalYears.form.endDateHelper")} />
          )} />
        </Box>
      </Stack>
      <MySelect name="periodFrequency" label={t("fiscalYears.fields.frequency")} control={form.control} dataSource={frequencyOptions} valueMember="id" displayMember="label" errors={form.formState.errors} required disabled={fieldsReadOnly || loading} isViewMode={fieldsReadOnly} />
      <Alert severity="info">{t("fiscalYears.form.periodsHelper")}</Alert>

      {displayedPeriods.length ? <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>{t("fiscalYears.periods.title")}</Typography>
        <Stack spacing={1}>
          {displayedPeriods.map(period => (
            <Stack key={period.sequence} direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ p: 1.25, border: 1, borderColor: "divider", borderRadius: 2, alignItems: { sm: "center" } }}>
              <Chip size="small" color="primary" variant="outlined" label={period.code} />
              <Typography sx={{ flex: 1 }}>{"nameEn" in period && "nameAr" in period ? `${String(period.nameEn)} / ${String(period.nameAr)}` : t("fiscalYears.periods.item", { sequence: period.sequence })}</Typography>
              <Typography variant="body2" color="text.secondary">{period.startDate} — {period.endDate}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box> : null}
    </MyForm>
  );
}
