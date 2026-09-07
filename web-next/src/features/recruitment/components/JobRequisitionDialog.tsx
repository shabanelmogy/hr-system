"use client";

import { Alert, Box, Grid, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField, toFormErrorMessages } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { useApprovedStaffingRequestOptions, useCreateJobRequisition } from "../hooks/useRecruitment";
import { EmploymentType, RequisitionType, WorkArrangement } from "../types";
import { jobRequisitionSchema, type JobRequisitionFormData } from "../validation/recruitmentValidation";

interface JobRequisitionDialogProps { open: boolean; onClose: () => void }

export default function JobRequisitionDialog({ open, onClose }: JobRequisitionDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateJobRequisition();
  const optionsQuery = useApprovedStaffingRequestOptions(open);
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<JobRequisitionFormData>({
    resolver: zodResolver(jobRequisitionSchema) as Resolver<JobRequisitionFormData>,
    defaultValues: { staffingRequestId: 0, requestedPositions: 1, businessReason: "", employmentType: EmploymentType.FullTime, workArrangement: WorkArrangement.OnSite, type: RequisitionType.NewPosition, targetHireDate: "" },
  });

  const staffingRequestId = Number(watch("staffingRequestId"));
  const selected = optionsQuery.data?.find((item) => item.id === staffingRequestId);
  const requestedPositions = Number(watch("requestedPositions"));
  const exceedsQuota = Boolean(selected && requestedPositions > selected.remainingAllocatable);
  const requestOptions = useMemo(() => (optionsQuery.data ?? []).map((item) => ({
    id: item.id,
    name: `${item.envelopeCode} — ${item.remainingAllocatable} ${t("recruitment.requisitions.availableSlots")}`,
  })), [optionsQuery.data, t]);

  const submit = handleSubmit(async (data) => {
    if (exceedsQuota) return;
    try {
      await createMutation.mutateAsync({
        staffingRequestId: Number(data.staffingRequestId), requestedPositions: Number(data.requestedPositions),
        businessReason: data.businessReason.trim(), employmentType: Number(data.employmentType),
        workArrangement: Number(data.workArrangement), targetHireDate: data.targetHireDate || undefined,
        type: Number(data.type), replacementEmployeeId: data.replacementEmployeeId ? Number(data.replacementEmployeeId) : undefined,
      });
      showToast.success(t("recruitment.requisitions.createdDraftSuccess"));
      reset(); onClose();
    } catch (error: unknown) { showToast.error(error, t("recruitment.requisitions.createError")); }
  });

  const employmentTypeOptions = [
    { id: EmploymentType.FullTime, name: t("recruitment.types.fullTime") }, { id: EmploymentType.PartTime, name: t("recruitment.types.partTime") },
    { id: EmploymentType.Contract, name: t("recruitment.types.contract") }, { id: EmploymentType.Internship, name: t("recruitment.types.internship") },
  ];
  const workArrangementOptions = [
    { id: WorkArrangement.OnSite, name: t("recruitment.work.onSite") }, { id: WorkArrangement.Remote, name: t("recruitment.work.remote") },
    { id: WorkArrangement.Hybrid, name: t("recruitment.work.hybrid") },
  ];
  const requisitionTypeOptions = [
    { id: RequisitionType.NewPosition, name: t("recruitment.requisitions.typeNewPosition") },
    { id: RequisitionType.Replacement, name: t("recruitment.requisitions.typeReplacement") },
  ];

  return <MyForm open={open} title={t("recruitment.requisitions.createTitle")} subtitle={t("recruitment.requisitions.plannedCreateSubtitle")} isSubmitting={createMutation.isPending} onClose={onClose} onSubmit={submit} submitButtonText={t("common.create")} errors={toFormErrorMessages(errors)}>
    <Stack spacing={2.5}>
      <MySelect control={control} errors={errors} name="staffingRequestId" label={t("recruitment.requisitions.staffingRequest")} dataSource={requestOptions} valueMember="id" displayMember="name" required loading={optionsQuery.isLoading} />
      {selected ? <Alert severity={exceedsQuota ? "error" : "info"}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selected.envelopeCode}</Typography>
        <Box component="span">{t("recruitment.requisitions.serverDerivedOrganization", { position: selected.positionId, branch: selected.branchId ?? "—", department: selected.departmentId, division: selected.divisionId })}</Box>
        <Box component="span" sx={{ display: "block" }}>{t("recruitment.requisitions.capacityLine", { available: selected.remainingAllocatable, remainingToHire: selected.remainingToHire, cost: selected.estimatedFiscalYearCostPerSlot, currency: selected.currencyCode })}</Box>
      </Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="requestedPositions" label={t("recruitment.requisitions.requestedPositions")} type="number" required /></Grid>
        <Grid size={{ xs: 12, sm: 6 }}><MyTextField control={control} errors={errors} fieldName="targetHireDate" label={t("recruitment.requisitions.targetHireDate")} type="date" /></Grid>
      </Grid>
      {exceedsQuota ? <Alert severity="error">{t("recruitment.requisitions.quotaExceeded")}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}><MySelect control={control} errors={errors} name="type" label={t("recruitment.requisitions.requestType")} dataSource={requisitionTypeOptions} valueMember="id" displayMember="name" required /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><MySelect control={control} errors={errors} name="employmentType" label={t("recruitment.openings.employmentType")} dataSource={employmentTypeOptions} valueMember="id" displayMember="name" required /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><MySelect control={control} errors={errors} name="workArrangement" label={t("recruitment.openings.workArrangement")} dataSource={workArrangementOptions} valueMember="id" displayMember="name" required /></Grid>
      </Grid>
      {Number(watch("type")) === RequisitionType.Replacement ? <MyTextField control={control} errors={errors} fieldName="replacementEmployeeId" label={t("recruitment.requisitions.replacementEmployee")} type="number" required /> : null}
      <MyTextField control={control} errors={errors} fieldName="businessReason" label={t("recruitment.requisitions.businessReason")} multiline rows={3} required />
    </Stack>
  </MyForm>;
}
