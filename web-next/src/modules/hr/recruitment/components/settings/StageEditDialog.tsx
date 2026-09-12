"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import type { RecruitmentStageConfig } from "../../types/recruitmentSettingsTypes";
import {
  createStageSettingsSchema,
  type StageSettingsFormData,
  type StageSettingsFormInput,
} from "../../validation/recruitmentValidation";

const PRESET_COLORS = ["#1976d2", "#ed6c02", "#9c27b0", "#0288d1", "#5c6bc0", "#ff9800", "#009688", "#2e7d32", "#d32f2f", "#795548"];

interface StageEditDialogProps {
  open: boolean;
  stage: RecruitmentStageConfig | null;
  onClose: () => void;
  onSave: (data: Omit<RecruitmentStageConfig, "id">) => void;
}

export default function StageEditDialog({ open, stage, onClose, onSave }: StageEditDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createStageSettingsSchema(t), [t]);
  const defaults = useMemo<StageSettingsFormInput>(() => stage ? {
    nameAr: stage.nameAr, nameEn: stage.nameEn, sequence: stage.sequence, color: stage.color,
    foldedInKanban: stage.foldedInKanban, sendEmailNotification: stage.sendEmailNotification,
    emailTemplate: stage.emailTemplate ?? "",
  } : {
    nameAr: "", nameEn: "", sequence: 10, color: "#1976d2", foldedInKanban: false,
    sendEmailNotification: false, emailTemplate: "",
  }, [stage]);
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<StageSettingsFormInput, unknown, StageSettingsFormData>({ resolver: zodResolver(schema), defaultValues: defaults });
  useEffect(() => { if (open) reset(defaults); }, [defaults, open, reset]);
  const sendEmail = useWatch({ control, name: "sendEmailNotification" });

  return (
    <MyForm open={open} onClose={onClose} title={t(stage ? "recruitment.settings.editStage" : "recruitment.settings.addStage")} submitButtonText={t("common.save")} onSubmit={handleSubmit((data) => {
      onSave({ ...data, emailTemplate: data.emailTemplate || undefined, isDefault: stage?.isDefault ?? false, mappedStatus: stage?.mappedStatus ?? 3 });
      onClose();
    })} isDirty={isDirty} errors={toFormErrorMessages(errors)} focusFieldName="nameAr">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="nameAr" label={t("recruitment.settings.stageNameAr")} required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="nameEn" label={t("recruitment.settings.stageNameEn")} required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="sequence" label={t("recruitment.settings.sequence")} type="number" required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><Typography variant="caption" color="text.secondary">{t("recruitment.settings.stageColor")}</Typography><Controller control={control} name="color" render={({ field }) => <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", mt: 0.5 }}>{PRESET_COLORS.map((color) => <Box component="button" type="button" aria-label={`${t("recruitment.settings.stageColor")} ${color}`} key={color} onClick={() => field.onChange(color)} sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: color, cursor: "pointer", border: field.value === color ? "3px solid" : "1px solid", borderColor: field.value === color ? "text.primary" : "divider" }} />)}</Box>} /></Grid>
        <Grid size={{ xs: 12 }}><Controller control={control} name="foldedInKanban" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t("recruitment.settings.foldInKanban")} />} /></Grid>
        <Grid size={{ xs: 12 }}><Controller control={control} name="sendEmailNotification" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t("recruitment.settings.autoEmail")} />} /></Grid>
        {sendEmail ? <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="emailTemplate" label={t("recruitment.settings.emailTemplate")} placeholder={t("recruitment.settings.emailTemplatePlaceholder")} multiline rows={3} /></Grid> : null}
      </Grid>
    </MyForm>
  );
}
