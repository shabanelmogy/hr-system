"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ApiClientError } from "@/lib/api/client";
import { MyForm, MyTextField } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import type { ErrorLogSettings } from "../types/errorLogs";
import { retentionFormSchema, type RetentionFormValues } from "../validation/errorLogs";

export function ErrorLogSettingsDialog({ settings, onClose, onSave, onReload }: {
  settings: ErrorLogSettings;
  onClose: () => void;
  onSave: (days: number, revision: number) => Promise<ErrorLogSettings>;
  onReload: () => Promise<ErrorLogSettings | undefined>;
}) {
  const { t } = useTranslation();
  const { requestDiscard } = useUnsavedChanges();
  const [revision, setRevision] = useState(settings.revision);
  const [status, setStatus] = useState<"idle" | "conflict" | "error">("idle");
  const form = useForm<RetentionFormValues>({
    resolver: zodResolver(retentionFormSchema(t("errorLogSettings.required"), t("errorLogSettings.range"))),
    defaultValues: { retentionDays: String(settings.retentionDays) },
  });
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSave(Number(values.retentionDays), revision);
      onClose();
    } catch (error: unknown) {
      applyApiFieldErrors(error, form.setError, {
        retentionDays: "retentionDays", RetentionDays: "retentionDays", "Request.RetentionDays": "retentionDays",
      });
      setStatus(error instanceof ApiClientError && error.status === 409 ? "conflict" : "error");
    }
  });
  const reload = async () => {
    const latest = await onReload();
    if (latest) {
      setRevision(latest.revision);
      setStatus("idle");
      // Preserve the user's draft for review against the new server revision.
    }
  };
  return <MyForm open onClose={onClose} title={t("errorLogSettings.edit")} onSubmit={submit}
    isSubmitting={form.formState.isSubmitting} isDirty={form.formState.isDirty}
    errors={form.formState.errors.retentionDays?.message ? { retentionDays: form.formState.errors.retentionDays.message } : {}}
    errorLabels={{ retentionDays: t("errorLogSettings.retentionDays") }}
    focusFieldName={form.formState.errors.retentionDays ? "retentionDays" : null}
    submitButtonText={t("errorLogSettings.save")}>
    <Stack spacing={2}>
      {status === "conflict" ? <Alert severity="warning" action={<Button onClick={() => void reload()}>{t("errorLogSettings.reload")}</Button>}>{t("errorLogSettings.conflict")}</Alert> : null}
      {status === "error" ? <Alert severity="error">{t("errorLogSettings.saveFailed")}</Alert> : null}
      <Typography variant="body2" color="text.secondary">{t("errorLogSettings.helper")}</Typography>
      <MyTextField control={form.control} name="retentionDays" label={t("errorLogSettings.retentionDays")}
        type="number" minValue={1} maxValue={3650} errors={form.formState.errors} required />
      <Button size="small" onClick={async () => { if (await requestDiscard()) { const latest = await onReload(); if (latest) { form.reset({ retentionDays: String(latest.retentionDays) }); setRevision(latest.revision); setStatus("idle"); } } }}>
        {t("errorLogSettings.loadCurrent")}
      </Button>
    </Stack>
  </MyForm>;
}
