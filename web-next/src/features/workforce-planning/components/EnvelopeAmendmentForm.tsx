"use client";

import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePositionEnvelopePage } from "../hooks/useWorkforceBudgetQueries";
import type { EnvelopeAmendmentDetail, EnvelopeAmendmentMutation } from "../types/Staffing";
import { getEnvelopeAmendmentSchema, type EnvelopeAmendmentFormValues } from "../validation/staffingValidation";

interface Props {
  open: boolean;
  item?: EnvelopeAmendmentDetail | null;
  loading?: boolean;
  detailError?: string | null;
  onClose: () => void;
  onSubmit: (request: EnvelopeAmendmentMutation) => Promise<void>;
}

export default function EnvelopeAmendmentForm({ open, item, loading = false, detailError, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const readOnly = Boolean(item);
  const envelopes = usePositionEnvelopePage({ pageNumber: 1, pageSize: 50, sortBy: "envelopeCode", sortDirection: "asc" });
  const options = useMemo(() => (envelopes.data?.items ?? []).map(envelope => ({ id: envelope.id, displayName: `${envelope.envelopeCode} — ${envelope.availableHeadcount} / ${envelope.availableSalaryBudget.toLocaleString()} ${envelope.currencyCode}` })), [envelopes.data]);
  const form = useForm<EnvelopeAmendmentFormValues>({
    resolver: zodResolver(getEnvelopeAmendmentSchema(t)) as Resolver<EnvelopeAmendmentFormValues>,
    defaultValues: { envelopeId: 0, additionalHeadcount: 1, additionalSalaryCost: 0, justification: "" },
    mode: "onSubmit",
  });
  useEffect(() => {
    if (!open) return;
    form.reset(item ? {
      envelopeId: item.envelopeId,
      additionalHeadcount: item.additionalHeadcount,
      additionalSalaryCost: item.additionalSalaryCost,
      justification: item.justification,
    } : { envelopeId: 0, additionalHeadcount: 1, additionalSalaryCost: 0, justification: "" });
  }, [form, item, open]);
  const field = (name: keyof EnvelopeAmendmentFormValues, label: string, type: "text" | "number" = "text") =>
    <MyTextField fieldName={name} labelKey={label} type={type} control={form.control} errors={form.formState.errors} readOnly={readOnly} loading={loading} />;

  return <MyForm open={open} onClose={onClose} title={t(readOnly ? "staffing.amendments.viewTitle" : "staffing.amendments.createTitle")} subtitle={t("staffing.amendments.subtitle")} submitButtonText={t("actions.create")}
    onSubmit={readOnly ? undefined : form.handleSubmit(values => onSubmit({ envelopeId: Number(values.envelopeId), additionalHeadcount: Number(values.additionalHeadcount), additionalSalaryCost: Number(values.additionalSalaryCost), justification: values.justification.trim() }))}
    isSubmitting={loading} isDirty={form.formState.isDirty} hideFooter={readOnly} isViewMode={readOnly} focusFieldName="envelopeId" autoFocusFirst errors={toFormErrorMessages(form.formState.errors)} maxWidth="sm">
    {detailError ? <Alert severity="error">{detailError}</Alert> : null}
    <MySelect name="envelopeId" label={t("staffing.fields.envelope")} control={form.control} dataSource={options} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="envelopeId" required loading={loading || envelopes.isLoading} isViewMode={readOnly} />
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      <Box sx={{ flex: 1 }}>{field("additionalHeadcount", t("staffing.fields.additionalHeadcount"), "number")}</Box>
      <Box sx={{ flex: 1 }}>{field("additionalSalaryCost", t("staffing.fields.additionalSalaryCost"), "number")}</Box>
    </Stack>
    {field("justification", t("staffing.fields.justification"))}
  </MyForm>;
}
