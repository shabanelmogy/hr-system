import { FileUpload } from "@mui/icons-material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, FormHelperText, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { type Resolver, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import type { CreateCrystalReportRequest, SupportedCrystalReportEntity } from "./types";
import { getCrystalReportCreateSchema, type CrystalReportCreateFormValues } from "./validation";

interface Props {
  open: boolean;
  busy: boolean;
  entities: SupportedCrystalReportEntity[];
  entitiesLoading: boolean;
  entitiesError: string | null;
  onRetryEntities: () => void;
  onClose: () => void;
  onSubmit: (request: CreateCrystalReportRequest) => Promise<void>;
}

const emptyValues: CrystalReportCreateFormValues = { entityKey: "", description: "", file: null };

export function CrystalReportCreateDialog({
  open,
  busy,
  entities,
  entitiesLoading,
  entitiesError,
  onRetryEntities,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const form = useForm<CrystalReportCreateFormValues>({
    resolver: zodResolver(getCrystalReportCreateSchema(t)) as Resolver<CrystalReportCreateFormValues>,
    defaultValues: emptyValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [form, open]);

  const entityOptions = entities.map((entity) => ({
    id: entity.entityKey,
    label: t(`crystalReports.entities.${entity.entityKey}`),
  }));
  const file = useWatch({ control: form.control, name: "file" });
  const fileError = form.formState.errors.file?.message;

  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={t("crystalReports.create")}
      subtitle={t("crystalReports.createHint")}
      submitButtonText={t("actions.create")}
      onSubmit={form.handleSubmit(async (values) => {
        if (!values.file) return;
        await onSubmit({
          entityKey: values.entityKey,
          description: values.description || undefined,
          file: values.file,
        });
      })}
      isSubmitting={busy}
      submitDisabled={Boolean(entitiesError) || entitiesLoading || entities.length === 0}
      isDirty={form.formState.isDirty}
      focusFieldName="entityKey"
      autoFocusFirst
      maxWidth="sm"
      errors={toFormErrorMessages(form.formState.errors)}
      errorLabels={{ entityKey: t("crystalReports.entity"), description: t("crystalReports.description"), file: t("crystalReports.reportFile") }}
    >
      {entitiesError ? (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={onRetryEntities}>{t("actions.retry")}</Button>}>
          {entitiesError}
        </Alert>
      ) : null}
      <MySelect
        name="entityKey"
        label={t("crystalReports.entity")}
        control={form.control}
        dataSource={entityOptions}
        valueMember="id"
        displayMember="label"
        errors={form.formState.errors}
        loading={entitiesLoading}
        disabled={busy || Boolean(entitiesError)}
        required
        showClearButton
        placeholder={t("crystalReports.selectEntity")}
        noOptionsText={t("crystalReports.noSupportedEntities")}
      />
      <MyTextField fieldName="description" labelKey={t("crystalReports.description")} control={form.control} errors={form.formState.errors} loading={busy} multiline rows={3} maxLength={500} />
      <Stack spacing={0.5}>
        <Button component="label" variant="outlined" startIcon={<FileUpload />} disabled={busy} color={fileError ? "error" : "primary"}>
          {file?.name ?? t("crystalReports.selectFile")}
          <input
            name="file"
            type="file"
            accept=".rpt,application/octet-stream"
            style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}
            aria-invalid={Boolean(fileError)}
            aria-describedby="crystal-report-file-help"
            onChange={(event) => form.setValue("file", event.target.files?.[0] ?? null, { shouldDirty: true, shouldTouch: true, shouldValidate: form.formState.isSubmitted })}
          />
        </Button>
        <FormHelperText id="crystal-report-file-help" error={Boolean(fileError)}>{fileError ?? t("crystalReports.fileHint")}</FormHelperText>
      </Stack>
      <Typography variant="caption" color="text.secondary">{t("crystalReports.summaryInfoHint")}</Typography>
    </MyForm>
  );
}
