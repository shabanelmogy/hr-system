"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControlLabel, Grid, Switch } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import type { RecruitmentSourceConfig } from "../../types/recruitmentSettingsTypes";
import {
  createSourceSettingsSchema,
  type SourceSettingsFormData,
} from "../../validation/recruitmentValidation";

interface SourceEditDialogProps {
  open: boolean;
  source: RecruitmentSourceConfig | null;
  onClose: () => void;
  onSave: (data: Omit<RecruitmentSourceConfig, "id">) => void;
}

export default function SourceEditDialog({ open, source, onClose, onSave }: SourceEditDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createSourceSettingsSchema(t), [t]);
  const defaults = useMemo<SourceSettingsFormData>(() => source
    ? { nameAr: source.nameAr, nameEn: source.nameEn, type: source.type, isActive: source.isActive }
    : { nameAr: "", nameEn: "", type: "portal", isActive: true }, [source]);
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SourceSettingsFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  useEffect(() => { if (open) reset(defaults); }, [defaults, open, reset]);

  const sourceTypes = ["portal", "social", "referral", "agency", "fair", "other"].map((id) => ({
    id,
    name: t(`recruitment.settings.type${id[0].toUpperCase()}${id.slice(1)}`),
  }));

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t(source ? "recruitment.settings.editSource" : "recruitment.settings.addSource")}
      submitButtonText={t("common.save")}
      onSubmit={handleSubmit((data) => {
        onSave({ ...data, applicationsCount: source?.applicationsCount ?? 0, hiredCount: source?.hiredCount ?? 0 });
        onClose();
      })}
      isDirty={isDirty}
      errors={toFormErrorMessages(errors)}
      focusFieldName="nameAr"
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="nameAr" label={t("recruitment.settings.sourceNameAr")} required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="nameEn" label={t("recruitment.settings.sourceNameEn")} required /></Grid>
        <Grid size={{ xs: 12 }}><MySelect control={control} errors={errors} name="type" label={t("recruitment.settings.sourceType")} dataSource={sourceTypes} valueMember="id" displayMember="name" required /></Grid>
        <Grid size={{ xs: 12 }}><Controller control={control} name="isActive" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} color="success" />} label={t("recruitment.settings.sourceActive")} />} /></Grid>
      </Grid>
    </MyForm>
  );
}
