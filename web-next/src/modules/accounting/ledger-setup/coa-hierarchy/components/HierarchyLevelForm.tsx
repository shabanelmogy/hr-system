"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import {
  MyForm,
  MySelect,
  MyTextField,
  toFormErrorMessages,
} from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import type {
  AccountHierarchyLevel,
  AccountHierarchyLevelMutationRequest,
  SelectOption,
} from "../types/coaHierarchy";
import {
  getHierarchyLevelSchema,
  type HierarchyLevelFormValues,
} from "../validation/coaHierarchyValidation";

interface Props {
  open: boolean;
  mode: "add" | "edit" | "view";
  item?: AccountHierarchyLevel | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (request: AccountHierarchyLevelMutationRequest) => Promise<void>;
}

const emptyValues: HierarchyLevelFormValues = {
  levelNumber: 1,
  nameAr: "",
  nameEn: "",
  canPost: false,
};

export default function HierarchyLevelForm({
  open,
  mode,
  item,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const readOnly = mode === "view";
  const form = useForm<HierarchyLevelFormValues>({
    resolver: zodResolver(
      getHierarchyLevelSchema(t),
    ) as Resolver<HierarchyLevelFormValues>,
    defaultValues: emptyValues,
    mode: "onSubmit",
  });
  const booleanOptions = useMemo<SelectOption[]>(
    () => [
      { id: true, label: t("ledgerSetup.boolean.yes") },
      { id: false, label: t("ledgerSetup.boolean.no") },
    ],
    [t],
  );

  useEffect(() => {
    if (!open) return;
    form.reset(
      item && mode !== "add"
        ? {
            levelNumber: item.levelNumber,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            canPost: item.canPost,
          }
        : emptyValues,
    );
  }, [form, item, mode, open]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t(`ledgerSetup.hierarchyLevels.form.${mode}Title`)}
      subtitle={t("ledgerSetup.hierarchyLevels.form.subtitle")}
      submitButtonText={
        mode === "edit" ? t("actions.update") : t("actions.create")
      }
      onSubmit={
        readOnly
          ? undefined
          : form.handleSubmit(async (values) => {
              try {
                await onSubmit(values);
              } catch (error) {
                applyApiFieldErrors(error, form.setError);
                if (
                  error instanceof ApiClientError &&
                  error.code === "Accounting.AccountHierarchyLevel.Duplicate"
                ) {
                  form.setError("levelNumber", {
                    type: "server",
                    message: error.message,
                  });
                }
              }
            })
      }
      isSubmitting={loading}
      isDirty={form.formState.isDirty}
      hideFooter={readOnly}
      isViewMode={readOnly}
      recordId={item?.id}
      maxWidth="sm"
      maxHeight="72vh"
      focusFieldName="levelNumber"
      autoFocusFirst
      errors={toFormErrorMessages(form.formState.errors)}
    >
      <MyTextField
        fieldName="levelNumber"
        labelKey="ledgerSetup.fields.levelNumber"
        type="number"
        control={form.control}
        errors={form.formState.errors}
        minValue={1}
        required
        readOnly={readOnly}
        loading={loading}
      />
      <MyTextField
        fieldName="nameAr"
        labelKey="ledgerSetup.fields.nameAr"
        control={form.control}
        errors={form.formState.errors}
        maxLength={150}
        required
        readOnly={readOnly}
        loading={loading}
      />
      <MyTextField
        fieldName="nameEn"
        labelKey="ledgerSetup.fields.nameEn"
        control={form.control}
        errors={form.formState.errors}
        maxLength={150}
        required
        readOnly={readOnly}
        loading={loading}
      />
      <MySelect
        control={form.control}
        name="canPost"
        label={t("ledgerSetup.fields.canPost")}
        dataSource={booleanOptions}
        valueMember="id"
        displayMember="label"
        required
        disabled={readOnly}
        errors={form.formState.errors}
      />
    </MyForm>
  );
}
