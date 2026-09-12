"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import type { RejectionReasonConfig } from "../../types/recruitmentSettingsTypes";
import {
  createRejectionReasonSettingsSchema,
  type RejectionReasonSettingsFormData,
} from "../../validation/recruitmentValidation";

interface RejectionReasonDialogProps {
  open: boolean;
  reason: RejectionReasonConfig | null;
  onClose: () => void;
  onSave: (data: Omit<RejectionReasonConfig, "id">) => void;
}

export default function RejectionReasonDialog({ open, reason, onClose, onSave }: RejectionReasonDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createRejectionReasonSettingsSchema(t), [t]);
  const defaults = useMemo<RejectionReasonSettingsFormData>(() => reason ? {
    reasonAr: reason.reasonAr, reasonEn: reason.reasonEn, category: reason.category,
    sendAutoEmail: reason.sendAutoEmail, emailSubjectAr: reason.emailSubjectAr ?? "",
    emailSubjectEn: reason.emailSubjectEn ?? "", emailBodyAr: reason.emailBodyAr ?? "",
    emailBodyEn: reason.emailBodyEn ?? "",
  } : {
    reasonAr: "", reasonEn: "", category: "qualifications", sendAutoEmail: true,
    emailSubjectAr: t("recruitment.settings.defaultEmailSubjectAr"),
    emailSubjectEn: t("recruitment.settings.defaultEmailSubjectEn"),
    emailBodyAr: t("recruitment.settings.defaultEmailBodyAr"),
    emailBodyEn: t("recruitment.settings.defaultEmailBodyEn"),
  }, [reason, t]);
  const { control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<RejectionReasonSettingsFormData>({ resolver: zodResolver(schema), defaultValues: defaults });
  useEffect(() => { if (open) reset(defaults); }, [defaults, open, reset]);
  const sendEmail = useWatch({ control, name: "sendAutoEmail" });
  const categories = [
    { id: "qualifications", name: t("recruitment.settings.catQuals") },
    { id: "salary", name: t("recruitment.settings.catSalary") },
    { id: "behavioral", name: t("recruitment.settings.catBehavioral") },
    { id: "candidate_withdrew", name: t("recruitment.settings.catWithdrew") },
    { id: "other", name: t("recruitment.settings.catOther") },
  ];

  return (
    <MyForm open={open} onClose={onClose} title={t(reason ? "recruitment.settings.editReason" : "recruitment.settings.addReason")} submitButtonText={t("common.save")} onSubmit={handleSubmit((data) => {
      onSave({ ...data, emailSubjectAr: sendEmail ? data.emailSubjectAr : undefined, emailSubjectEn: sendEmail ? data.emailSubjectEn : undefined, emailBodyAr: sendEmail ? data.emailBodyAr : undefined, emailBodyEn: sendEmail ? data.emailBodyEn : undefined });
      onClose();
    })} isDirty={isDirty} errors={toFormErrorMessages(errors)} focusFieldName="reasonAr">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="reasonAr" label={t("recruitment.settings.reasonAr")} required /></Grid>
        <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="reasonEn" label={t("recruitment.settings.reasonEn")} required /></Grid>
        <Grid size={{ xs: 12 }}><MySelect control={control} errors={errors} name="category" label={t("recruitment.settings.reasonCategory")} dataSource={categories} valueMember="id" displayMember="name" required /></Grid>
        <Grid size={{ xs: 12 }}><Controller control={control} name="sendAutoEmail" render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={(_, value) => field.onChange(value)} />} label={t("recruitment.settings.sendPoliteEmail")} />} /></Grid>
        {sendEmail ? <>
          <Grid size={{ xs: 12 }}><Typography variant="subtitle2" color="primary.main">{t("recruitment.settings.emailTemplateTitle")}</Typography></Grid>
          <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="emailSubjectAr" label={t("recruitment.settings.emailSubjectAr")} /></Grid>
          <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="emailBodyAr" label={t("recruitment.settings.emailBodyAr")} multiline rows={3} /></Grid>
          <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="emailSubjectEn" label={t("recruitment.settings.emailSubjectEn")} /></Grid>
          <Grid size={{ xs: 12 }}><MyTextField control={control} errors={errors} fieldName="emailBodyEn" label={t("recruitment.settings.emailBodyEn")} multiline rows={3} /></Grid>
        </> : null}
      </Grid>
    </MyForm>
  );
}
