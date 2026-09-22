"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@mui/material";
import { useEffect } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import type { Currency, CurrencyMutationRequest } from "../types/Currency";
import { getCurrencySchema, type CurrencyFormValues } from "../validation/currencyValidation";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  item?: Currency | null;
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
  onSubmit: (request: CurrencyMutationRequest) => Promise<void>;
}

const emptyValues: CurrencyFormValues = {
  currencyCode: "",
  nameEn: "",
  nameAr: "",
  symbol: "",
};

export default function CurrencyForm({
  open,
  mode,
  item,
  loading = false,
  detailError = null,
  onRetryDetail,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const readOnly = mode === "view";
  const fieldsReadOnly = readOnly || Boolean(detailError);
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(getCurrencySchema(t)) as Resolver<CurrencyFormValues>,
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;
    form.reset(item && mode !== "add" ? {
      currencyCode: item.currencyCode,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      symbol: item.symbol,
    } : emptyValues);
  }, [form, item, mode, open]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t(`currencies.form.${mode}Title`)}
      subtitle={t("currencies.form.subtitle")}
      submitButtonText={mode === "edit" ? t("actions.update") : t("actions.create")}
      onSubmit={readOnly ? undefined : form.handleSubmit(async values => {
        try {
          await onSubmit(values);
        } catch (error) {
          applyApiFieldErrors(error, form.setError, {
            "Currency.DuplicateCode": ["currencyCode"],
          });
        }
      })}
      isSubmitting={loading}
      submitDisabled={Boolean(detailError)}
      isDirty={form.formState.isDirty}
      hideFooter={readOnly}
      isViewMode={readOnly}
      recordId={item?.id}
      maxWidth="sm"
      maxHeight="72vh"
      focusFieldName="currencyCode"
      autoFocusFirst
      errors={toFormErrorMessages(form.formState.errors)}
      mockDataAction={process.env.NODE_ENV !== "production" && !readOnly ? {
        onGenerate: () => {
          const options = { shouldDirty: true, shouldValidate: true };
          form.setValue("currencyCode", "EGP", options);
          form.setValue("nameEn", "Egyptian Pound", options);
          form.setValue("nameAr", "جنيه مصري", options);
          form.setValue("symbol", "EGP", options);
        },
        disabled: loading,
      } : undefined}
    >
      {detailError ? (
        <Alert
          severity="error"
          action={onRetryDetail ? <Button color="inherit" onClick={onRetryDetail}>{t("common.retry")}</Button> : undefined}
        >
          {detailError}
        </Alert>
      ) : null}
      <MyTextField fieldName="currencyCode" labelKey={t("currencies.fields.currencyCode")} control={form.control} errors={form.formState.errors} maxLength={3} required readOnly={fieldsReadOnly} loading={loading} />
      <MyTextField fieldName="nameAr" labelKey={t("general.nameAr")} control={form.control} errors={form.formState.errors} maxLength={100} required readOnly={fieldsReadOnly} loading={loading} />
      <MyTextField fieldName="nameEn" labelKey={t("general.nameEn")} control={form.control} errors={form.formState.errors} maxLength={100} required readOnly={fieldsReadOnly} loading={loading} />
      <MyTextField fieldName="symbol" labelKey={t("currencies.fields.symbol")} control={form.control} errors={form.formState.errors} maxLength={10} required readOnly={fieldsReadOnly} loading={loading} />
    </MyForm>
  );
}
