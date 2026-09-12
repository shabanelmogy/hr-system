"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControlLabel, Grid, Switch } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import type { EvaluationCriterionConfig } from "../../types/recruitmentSettingsTypes";
import {
  createCriterionSettingsSchema,
  type CriterionSettingsFormData,
  type CriterionSettingsFormInput,
} from "../../validation/recruitmentValidation";

interface CriterionEditDialogProps {
  open: boolean;
  criterion: EvaluationCriterionConfig | null;
  onClose: () => void;
  onSave: (data: Omit<EvaluationCriterionConfig, "id">) => void;
}

export default function CriterionEditDialog({ open, criterion, onClose, onSave }: CriterionEditDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createCriterionSettingsSchema(t), [t]);
  const defaults = useMemo<CriterionSettingsFormInput>(() => criterion ? {
    titleAr: criterion.titleAr, titleEn: criterion.titleEn,
    descriptionAr: criterion.descriptionAr ?? "", descriptionEn: criterion.descriptionEn ?? "",
    category: criterion.category, weight: criterion.weight, isMandatory: criterion.isMandatory,
  } : { titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", category: "technical", weight: 20, isMandatory: true }, [criterion]);
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CriterionSettingsFormInput, unknown, CriterionSettingsFormData>({ resolver: zodResolver(schema), defaultValues: defaults });
  useEffect(() => { if (open) reset(defaults); }, [defaults, open, reset]);
  const categories = [
    { id: "technical", name: t("recruitment.settings.critTech") },
    { id: "communication", name: t("recruitment.settings.critComm") },
    { id: "problem_solving", name: t("recruitment.settings.critProblem") },
    { id: "culture", name: t("recruitment.settings.critCulture") },
    { id: "leadership", name: t("recruitment.settings.critLead") },
  ];

  return (
    <MyForm open={open} onClose={onClose} title={t(criterion ? "recruitment.settings.editCriterion" : "recruitment.settings.addCriterion")} submitButtonText={t("common.save")} onSubmit={handleSubmit((data) => {
      onSave({ ...data, descriptionAr: data.descriptionAr || undefined, descriptionEn: data.descriptionEn || undefined, maxScore: 5 });
      onClose();
    })} isDirty={isDirty} errors={toFormErrorMessages(errors)} focusFieldName="titleAr">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="titleAr" label={t("recruitment.settings.criterionTitleAr")} required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="titleEn" label={t("recruitment.settings.criterionTitleEn")} required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MySelect control={control} errors={errors} name="category" label={t("recruitment.settings.criterionCategory")} dataSource={categories} valueMember="id" displayMember="name" required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="weight" label={t("recruitment.settings.criterionWeight")} type="number" minValue={1} maxValue={100} required /></Grid>
        <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="descriptionAr" label={t("recruitment.settings.criterionDescAr")} placeholder={t("recruitment.settings.criterionDescriptionPlaceholder")} multiline rows={2} /></Grid>
        <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="descriptionEn" label={t("recruitment.settings.criterionDescEn")} multiline rows={2} /></Grid>
        <Grid size={{ xs: 12 }}><Controller control={control} name="isMandatory" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t("recruitment.settings.mandatoryCriterion")} />} /></Grid>
      </Grid>
    </MyForm>
  );
}
