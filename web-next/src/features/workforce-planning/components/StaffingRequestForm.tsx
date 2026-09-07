"use client";

import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePositionEnvelopePage } from "../hooks/useWorkforceBudgetQueries";
import type { StaffingRequestDetail, StaffingRequestMutation, StaffingRequestPriority, StaffingRequestType } from "../types/Staffing";
import { getStaffingRequestSchema, type StaffingRequestFormValues } from "../validation/staffingValidation";

interface Props { open: boolean; item?: StaffingRequestDetail | null; loading?: boolean; detailError?: string | null; onClose: () => void; onSubmit: (request: StaffingRequestMutation) => Promise<void> }

export default function StaffingRequestForm({ open, item, loading = false, detailError, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const readOnly = Boolean(item);
  const envelopes = usePositionEnvelopePage({ pageNumber: 1, pageSize: 50, sortBy: "envelopeCode", sortDirection: "asc" });
  const envelopeOptions = useMemo(() => (envelopes.data?.items ?? []).filter(envelope => envelope.availableHeadcount > 0).map(envelope => ({ id: envelope.id, displayName: `${envelope.envelopeCode} — ${envelope.availableHeadcount} / ${envelope.availableSalaryBudget.toLocaleString()} ${envelope.currencyCode}` })), [envelopes.data]);
  const typeOptions = useMemo(() => [{ id: 1, displayName: t("staffing.type.newHire") }, { id: 2, displayName: t("staffing.type.replacement") }], [t]);
  const priorityOptions = useMemo(() => [1, 2, 3, 4].map(id => ({ id, displayName: t(`staffing.priority.${id}`) })), [t]);
  const defaults: StaffingRequestFormValues = { envelopeId: 0, requestedHeadcount: 1, estimatedAnnualSalaryPerSlot: 0, targetStartDate: "", requestType: 1, priority: 2, justification: "" };
  const form = useForm<StaffingRequestFormValues>({ resolver: zodResolver(getStaffingRequestSchema(t)) as Resolver<StaffingRequestFormValues>, defaultValues: defaults, mode: "onSubmit" });
  useEffect(() => {
    if (!open) return;
    form.reset(item ? { envelopeId: item.envelopeId, requestedHeadcount: item.requestedHeadcount, estimatedAnnualSalaryPerSlot: item.estimatedAnnualSalaryPerSlot, targetStartDate: item.targetStartDate, requestType: item.requestType, priority: item.priority, justification: item.justification } : defaults);
    // defaults is intentionally recreated only when the dialog reopens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, item, open]);
  const field = (name: keyof StaffingRequestFormValues, label: string, type: "text" | "number" | "date" = "text") => <MyTextField fieldName={name} labelKey={label} type={type} control={form.control} errors={form.formState.errors} readOnly={readOnly} loading={loading} />;
  return <MyForm open={open} onClose={onClose} title={t(readOnly ? "staffing.requests.viewTitle" : "staffing.requests.createTitle")} subtitle={t("staffing.requests.subtitle")} submitButtonText={t("actions.create")}
    onSubmit={readOnly ? undefined : form.handleSubmit(values => onSubmit({ envelopeId: Number(values.envelopeId), requestedHeadcount: Number(values.requestedHeadcount), estimatedAnnualSalaryPerSlot: Number(values.estimatedAnnualSalaryPerSlot), targetStartDate: values.targetStartDate, requestType: Number(values.requestType) as StaffingRequestType, priority: Number(values.priority) as StaffingRequestPriority, justification: values.justification.trim() }))}
    isSubmitting={loading} isDirty={form.formState.isDirty} hideFooter={readOnly} isViewMode={readOnly} focusFieldName="envelopeId" autoFocusFirst errors={toFormErrorMessages(form.formState.errors)} maxWidth="md">
    {detailError ? <Alert severity="error">{detailError}</Alert> : null}
    <MySelect name="envelopeId" label={t("staffing.fields.envelope")} control={form.control} dataSource={envelopeOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="envelopeId" required loading={loading || envelopes.isLoading} isViewMode={readOnly} />
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Box sx={{ flex: 1 }}>{field("requestedHeadcount", t("staffing.fields.requestedHeadcount"), "number")}</Box><Box sx={{ flex: 1 }}>{field("estimatedAnnualSalaryPerSlot", t("staffing.fields.annualSalary"), "number")}</Box><Box sx={{ flex: 1 }}>{field("targetStartDate", t("staffing.fields.targetStartDate"), "date")}</Box></Stack>
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Box sx={{ flex: 1 }}><MySelect name="requestType" label={t("staffing.fields.requestType")} control={form.control} dataSource={typeOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="requestType" required isViewMode={readOnly} /></Box><Box sx={{ flex: 1 }}><MySelect name="priority" label={t("staffing.fields.priority")} control={form.control} dataSource={priorityOptions} valueMember="id" displayMember="displayName" errors={form.formState.errors} actualFieldName="priority" required isViewMode={readOnly} /></Box></Stack>
    {field("justification", t("staffing.fields.justification"))}
    {item ? <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}><Chip label={t("staffing.capacity.allocatable", { count: item.remainingAllocatable })} /><Chip label={t("staffing.capacity.toHire", { count: item.remainingToHire })} /><Chip label={`${item.totalReservedCost.toLocaleString()} ${item.currencyCode}`} /><Typography variant="caption" color="text.secondary">{item.calculationPolicyVersion}</Typography></Stack> : null}
  </MyForm>;
}
