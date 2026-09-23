"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button } from "@mui/material";
import { useEffect, useMemo } from "react";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCurrencyLookup } from "@/modules/accounting/currencies";
import {
  MyForm,
  MySelect,
  MyTextField,
  toFormErrorMessages,
} from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import {
  useAccountLookup,
  useHierarchyLevels,
} from "../hooks/useCoaHierarchyQueries";
import type {
  AccountDetail,
  AccountMutationRequest,
  SelectOption,
} from "../types/coaHierarchy";
import {
  getAccountSchema,
  type AccountFormValues,
} from "../validation/coaHierarchyValidation";
import { isAccountCodeConflict } from "../utils/accountErrors";

type FormMode = "add" | "edit" | "view";

interface Props {
  open: boolean;
  mode: FormMode;
  item?: AccountDetail | null;
  proposalCode?: string;
  initialParentAccountId?: number | null;
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
  onSubmit: (request: AccountMutationRequest) => Promise<void>;
}

const emptyValues: AccountFormValues = {
  code: "",
  nameAr: "",
  nameEn: "",
  accountHierarchyLevelId: 0,
  parentAccountId: null,
  allowPosting: false,
  manualPostingPolicy: 1,
  currencyPolicy: 1,
  specificCurrencyId: null,
};

export default function AccountForm({
  open,
  mode,
  item,
  proposalCode,
  initialParentAccountId = null,
  loading = false,
  detailError = null,
  onRetryDetail,
  onClose,
  onSubmit,
}: Props) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const readOnly = mode === "view";
  const fieldsReadOnly = readOnly || Boolean(detailError);
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(getAccountSchema(t)) as Resolver<AccountFormValues>,
    defaultValues: emptyValues,
    mode: "onSubmit",
  });
  const currencyPolicy = useWatch({
    control: form.control,
    name: "currencyPolicy",
  });

  const accounts = useAccountLookup(open);
  const levels = useHierarchyLevels("active", open);
  const currencies = useCurrencyLookup(open);

  const parentOptions = useMemo<SelectOption[]>(
    () =>
      (accounts.data ?? [])
        .filter((account) => !account.allowPosting && account.id !== item?.id)
        .map((account) => ({
          id: account.id,
          label: `${account.code} — ${isArabic ? account.nameAr : account.nameEn}`,
        })),
    [accounts.data, isArabic, item?.id],
  );
  const levelOptions = useMemo<SelectOption[]>(
    () =>
      (levels.data ?? []).map((level) => ({
        id: level.id,
        label: `${level.levelNumber} — ${isArabic ? level.nameAr : level.nameEn}`,
      })),
    [isArabic, levels.data],
  );
  const currencyOptions = useMemo<SelectOption[]>(
    () =>
      (currencies.data ?? []).map((currency) => ({
        id: currency.id,
        label: `${currency.currencyCode} — ${isArabic ? currency.nameAr : currency.nameEn}`,
      })),
    [currencies.data, isArabic],
  );
  const booleanOptions = useMemo<SelectOption[]>(
    () => [
      { id: true, label: t("ledgerSetup.boolean.yes") },
      { id: false, label: t("ledgerSetup.boolean.no") },
    ],
    [t],
  );
  const manualPostingOptions = useMemo<SelectOption[]>(
    () => [
      { id: 1, label: t("ledgerSetup.enums.manualPosting.allowed") },
      { id: 2, label: t("ledgerSetup.enums.manualPosting.restricted") },
      { id: 3, label: t("ledgerSetup.enums.manualPosting.blocked") },
    ],
    [t],
  );
  const currencyPolicyOptions = useMemo<SelectOption[]>(
    () => [
      { id: 1, label: t("ledgerSetup.enums.currencyPolicy.any") },
      { id: 2, label: t("ledgerSetup.enums.currencyPolicy.functionalOnly") },
      { id: 3, label: t("ledgerSetup.enums.currencyPolicy.specificCurrency") },
    ],
    [t],
  );

  useEffect(() => {
    if (!open) return;
    if (item && mode !== "add") {
      form.reset({
        code: item.code,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        accountHierarchyLevelId: item.accountHierarchyLevelId,
        parentAccountId: item.parentAccountId,
        allowPosting: item.allowPosting,
        manualPostingPolicy: item.manualPostingPolicy,
        currencyPolicy: item.currencyPolicy,
        specificCurrencyId: item.specificCurrencyId,
      });
      return;
    }
    form.reset({
      ...emptyValues,
      parentAccountId: initialParentAccountId,
    });
  }, [form, initialParentAccountId, item, mode, open]);

  useEffect(() => {
    if (
      open &&
      mode === "add" &&
      proposalCode &&
      !form.getValues("code")
    ) {
      form.setValue("code", proposalCode, { shouldDirty: false });
    }
  }, [form, mode, open, proposalCode]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t(`ledgerSetup.accounts.form.${mode}Title`)}
      subtitle={t("ledgerSetup.accounts.form.subtitle")}
      submitButtonText={
        mode === "edit" ? t("actions.update") : t("actions.create")
      }
      onSubmit={
        readOnly
          ? undefined
          : form.handleSubmit(async (values) => {
              try {
                await onSubmit({
                  ...values,
                  parentAccountId: values.parentAccountId ?? null,
                  specificCurrencyId: values.specificCurrencyId ?? null,
                });
              } catch (error) {
                applyApiFieldErrors(error, form.setError);
                if (isAccountCodeConflict(error)) {
                  form.setError("code", {
                    type: "server",
                    message: error.message,
                  });
                }
              }
            })
      }
      isSubmitting={loading}
      submitDisabled={Boolean(detailError)}
      isDirty={form.formState.isDirty}
      hideFooter={readOnly}
      isViewMode={readOnly}
      recordId={item?.id}
      maxWidth="md"
      maxHeight="82vh"
      focusFieldName="code"
      autoFocusFirst
      errors={toFormErrorMessages(form.formState.errors)}
    >
      {detailError ? (
        <Alert
          severity="error"
          action={
            onRetryDetail ? (
              <Button color="inherit" onClick={onRetryDetail}>
                {t("common.retry")}
              </Button>
            ) : undefined
          }
        >
          {detailError}
        </Alert>
      ) : null}
      <MyTextField
        fieldName="code"
        labelKey="ledgerSetup.fields.code"
        control={form.control}
        errors={form.formState.errors}
        maxLength={50}
        required
        readOnly={fieldsReadOnly}
        loading={loading}
      />
      <MyTextField
        fieldName="nameAr"
        labelKey="ledgerSetup.fields.nameAr"
        control={form.control}
        errors={form.formState.errors}
        maxLength={200}
        required
        readOnly={fieldsReadOnly}
        loading={loading}
      />
      <MyTextField
        fieldName="nameEn"
        labelKey="ledgerSetup.fields.nameEn"
        control={form.control}
        errors={form.formState.errors}
        maxLength={200}
        required
        readOnly={fieldsReadOnly}
        loading={loading}
      />
      <MySelect
        control={form.control}
        name="accountHierarchyLevelId"
        label={t("ledgerSetup.fields.accountHierarchyLevelId")}
        dataSource={levelOptions}
        valueMember="id"
        displayMember="label"
        required
        loading={levels.isLoading}
        disabled={fieldsReadOnly}
        errors={form.formState.errors}
      />
      <MySelect
        control={form.control}
        name="parentAccountId"
        label={t("ledgerSetup.fields.parentAccountId")}
        dataSource={parentOptions}
        valueMember="id"
        displayMember="label"
        showClearButton
        loading={accounts.isLoading}
        disabled={fieldsReadOnly}
        errors={form.formState.errors}
      />
      <MySelect
        control={form.control}
        name="allowPosting"
        label={t("ledgerSetup.fields.allowPosting")}
        dataSource={booleanOptions}
        valueMember="id"
        displayMember="label"
        required
        disabled={fieldsReadOnly}
        errors={form.formState.errors}
      />
      <MySelect
        control={form.control}
        name="manualPostingPolicy"
        label={t("ledgerSetup.fields.manualPostingPolicy")}
        dataSource={manualPostingOptions}
        valueMember="id"
        displayMember="label"
        required
        disabled={fieldsReadOnly}
        errors={form.formState.errors}
      />
      <MySelect
        control={form.control}
        name="currencyPolicy"
        label={t("ledgerSetup.fields.currencyPolicy")}
        dataSource={currencyPolicyOptions}
        valueMember="id"
        displayMember="label"
        required
        disabled={fieldsReadOnly}
        errors={form.formState.errors}
      />
      {currencyPolicy === 3 ? (
        <MySelect
          control={form.control}
          name="specificCurrencyId"
          label={t("ledgerSetup.fields.specificCurrencyId")}
          dataSource={currencyOptions}
          valueMember="id"
          displayMember="label"
          required
          loading={currencies.isLoading}
          disabled={fieldsReadOnly}
          errors={form.formState.errors}
        />
      ) : null}
    </MyForm>
  );
}
