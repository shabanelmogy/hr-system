"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, FormSection, toFormErrorMessages } from "@/shared/components/forms";
import { SafeHtmlPreview } from "@/shared/components/preview";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { emailTemplateFormSchema, type EmailTemplateFormValues } from "../validation/emailTemplateValidation";
import type { EmailPreview, EmailTemplate } from "../types/emailTemplate";

const MyRichTextField = dynamic(() => import("@/shared/components/forms/rich-text").then(module => module.MyRichTextField), { ssr: false });

export function EmailTemplateDialog({ row, canEdit, onClose, onSave, onPreview, onReload }: {
  row: EmailTemplate; canEdit: boolean; onClose: () => void;
  onSave: (values: EmailTemplateFormValues) => Promise<void>;
  onPreview: (values: EmailTemplateFormValues) => Promise<EmailPreview>;
  onReload: () => Promise<void>;
}) {
  const { t } = useTranslation(); const { requestDiscard } = useUnsavedChanges();
  const [failure, setFailure] = useState(false); const [previewing, setPreviewing] = useState(false);
  const [snapshot, setSnapshot] = useState<{ values: EmailTemplateFormValues; rendered: EmailPreview } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (snapshot) { previewRef.current?.scrollIntoView({ block: "start" }); previewRef.current?.focus({ preventScroll: true }); }
  }, [snapshot]);
  const form = useForm<EmailTemplateFormValues>({ resolver: zodResolver(emailTemplateFormSchema({
    subject: t("emailTemplates.subjectValidation"), body: t("emailTemplates.bodyValidation"), action: t("emailTemplates.actionValidation"),
  })), defaultValues: { subject: row.subject, body: row.body } });
  const submit = form.handleSubmit(async values => {
    if (!canEdit) return;
    try { await onSave(values); onClose(); } catch (error: unknown) { showFailure(error); }
  });
  function showFailure(error: unknown) {
    applyApiFieldErrors(error, form.setError, { "Request.Subject": "subject", "request.subject": "subject", Subject: "subject", subject: "subject",
      "Request.Body": "body", "request.body": "body", Body: "body", body: "body" });
    setFailure(true);
  }
  const preview = form.handleSubmit(async values => {
    setPreviewing(true); setFailure(false);
    try { setSnapshot({ values, rendered: await onPreview(values) }); } catch (error: unknown) { showFailure(error); }
    finally { setPreviewing(false); }
  });
  const values = useWatch({ control: form.control });
  const isCurrentPreview = snapshot?.values.subject === values.subject && snapshot?.values.body === values.body;
  const errors = toFormErrorMessages(form.formState.errors);
  return <MyForm open onClose={onClose} title={row.language === "ar" ? row.nameAr : row.nameEn}
    subtitle={t(row.isCustomized ? "emailTemplates.customized" : "emailTemplates.default")}
    onSubmit={submit} maxWidth="lg" isSubmitting={form.formState.isSubmitting} isDirty={form.formState.isDirty}
    isViewMode={!canEdit} hideFooter={!canEdit} errors={errors}
    errorLabels={{ subject: t("emailTemplates.subject"), body: t("emailTemplates.body") }}
    focusFieldName={form.formState.errors.subject ? "subject" : form.formState.errors.body ? "body" : null}
    submitButtonText={t("actions.save")} mockDataAction={canEdit ? { onGenerate: () => {
      form.setValue("subject", row.language === "ar" ? "رسالة تجريبية إلى {FIRST_NAME}" : "A sample message for {FIRST_NAME}", { shouldDirty: true });
    } } : undefined}>
    <Stack spacing={2}>
      <Alert severity="info">{t("emailTemplates.securityHint")}</Alert>
      {failure && <Alert severity="error" action={<Button onClick={async () => { if (await requestDiscard()) await onReload(); }}>{t("emailTemplates.reload")}</Button>}>{t("emailTemplates.operationFailed")}</Alert>}
      <FormSection title={t("emailTemplates.subject")} variant="outlined">
      <MyTextField name="subject" control={form.control} errors={form.formState.errors} label={t("emailTemplates.subject")} readOnly={!canEdit} maxLength={200} />
      <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
        {row.variables.filter(item => item.subjectAllowed).map(item => <Button key={item.token} size="small" type="button" disabled={!canEdit}
          onClick={() => form.setValue("subject", form.getValues("subject") + " " + item.token, { shouldDirty: true })}>{t("emailTemplates.insertSubject", { token: item.token })}</Button>)}
      </Stack>
      </FormSection>
      <FormSection title={t("emailTemplates.body")} variant="outlined">
      <Controller control={form.control} name="body" render={({ field, fieldState }) => <MyRichTextField
        name={field.name} label={t("emailTemplates.body")} value={field.value} onChange={field.onChange} onBlur={field.onBlur}
        inputRef={field.ref} error={fieldState.error?.message} readOnly={!canEdit} direction={row.language === "ar" ? "rtl" : "ltr"}
        insertions={row.variables.map(item => ({ value: item.token, label: item.token,
          kind: item.subjectAllowed ? "text" as const : "link" as const, text: t("emailTemplates.actionButton") }))} />} />
      <Typography variant="body2">{t("emailTemplates.variables")}</Typography>
      {row.variables.map(item => <Typography variant="caption" key={item.token} component="div">{item.token} · {row.language === "ar" ? item.nameAr : item.nameEn} · {item.sample}</Typography>)}
      </FormSection>
      <FormSection title={t("emailTemplates.preview")} variant="outlined">
      <Button type="button" variant="outlined" disabled={previewing} onClick={() => void preview()}>{t(previewing ? "emailTemplates.previewing" : "emailTemplates.preview")}</Button>
      <Alert severity="info">{t("emailTemplates.previewHint")}</Alert>
      {snapshot && (isCurrentPreview ? <Box ref={previewRef} tabIndex={-1} role="region" aria-label={t("emailTemplates.preview")}>
        <Typography variant="subtitle1">{snapshot.rendered.subject}</Typography>
        <SafeHtmlPreview html={snapshot.rendered.html} title={t("emailTemplates.preview")} />
      </Box> : <Alert severity="warning">{t("emailTemplates.previewOutdated")}</Alert>)}
      </FormSection>
    </Stack>
  </MyForm>;
}
