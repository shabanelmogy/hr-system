"use client";

import { Alert, Box, Stack, Typography } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { jobOpeningSchema, type JobOpeningFormData, type JobOpeningFormInput } from "../validation/recruitmentValidation";
import { JobRequisitionStatus } from "../types";
import { useCreateJobOpening, useJobRequisitions } from "../hooks/useRecruitment";

interface JobOpeningDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<JobOpeningFormData>;
}

export default function JobOpeningDialog({ open, onClose, initialValues }: JobOpeningDialogProps) {
  const { t, i18n } = useTranslation();
  const createMutation = useCreateJobOpening();
  const requisitionsQuery = useJobRequisitions({ pageNumber: 1, pageSize: 100, status: JobRequisitionStatus.Approved });
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<JobOpeningFormInput, unknown, JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: { jobRequisitionId: undefined, positionCount: 1 },
  });
  const jobRequisitionId = Number(useWatch({ control, name: "jobRequisitionId" }));
  const availableRequisitions = useMemo(
    () => (requisitionsQuery.data?.items ?? []).filter((item) => item.remainingPositions > 0),
    [requisitionsQuery.data?.items],
  );
  const selectedRequisition = availableRequisitions.find((item) => item.id === jobRequisitionId);

  useEffect(() => {
    if (!open) return;
    reset({
      jobRequisitionId: initialValues?.jobRequisitionId,
      positionCount: initialValues?.positionCount ?? 1,
    });
  }, [initialValues, open, reset]);

  useEffect(() => {
    if (!selectedRequisition || initialValues?.jobRequisitionId === selectedRequisition.id) return;
    setValue("positionCount", selectedRequisition.remainingPositions, { shouldDirty: true });
  }, [initialValues?.jobRequisitionId, selectedRequisition, setValue]);

  const requisitionOptions = useMemo(() => availableRequisitions.map((requisition) => ({
    id: requisition.id,
    name: `${requisition.requisitionNumber} — ${i18n.language.startsWith("ar") ? requisition.positionTitleAr : requisition.positionTitleEn}`,
  })), [availableRequisitions, i18n.language]);

  const onSubmit = handleSubmit(async (data) => {
    const requisition = availableRequisitions.find((item) => item.id === Number(data.jobRequisitionId));
    if (!requisition) return;
    try {
      await createMutation.mutateAsync({
        jobRequisitionId: requisition.id,
        positionId: requisition.positionId,
        branchId: requisition.branchId,
        departmentId: requisition.departmentId,
        divisionId: requisition.divisionId,
        positionCount: Number(data.positionCount),
        employmentType: requisition.employmentType,
        workArrangement: requisition.workArrangement,
      });
      showToast.success(t("recruitment.openings.createdSuccess", "تم إنشاء الشاغر الوظيفي بنجاح"));
      reset();
      onClose();
    } catch (error: unknown) {
      showToast.error(error, t("common.error", "حدث خطأ أثناء حفظ الشاغر الوظيفي"));
    }
  });

  return <MyForm
    open={open}
    title={t("recruitment.openings.createTitle", "إنشاء شاغر وظيفي جديد / Create Job Opening")}
    subtitle={t("recruitment.openings.createSubtitle", "إضافة شاغر جديد لفتح باب التقديم والتوظيف")}
    isSubmitting={createMutation.isPending}
    onSubmit={onSubmit}
    onClose={onClose}
  >
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      <MySelect
        control={control}
        errors={errors}
        name="jobRequisitionId"
        label={t("recruitment.openings.requisition", "طلب الاحتياج الوظيفي (Job Requisition)")}
        dataSource={requisitionOptions}
        valueMember="id"
        displayMember="name"
        loading={requisitionsQuery.isLoading}
        required
      />
      {selectedRequisition ? <Alert severity="info">
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {i18n.language.startsWith("ar") ? selectedRequisition.positionTitleAr : selectedRequisition.positionTitleEn}
        </Typography>
        <Box component="span">
          {i18n.language.startsWith("ar") ? selectedRequisition.branchNameAr : selectedRequisition.branchNameEn}
          {" · "}
          {i18n.language.startsWith("ar") ? selectedRequisition.departmentNameAr : selectedRequisition.departmentNameEn}
        </Box>
      </Alert> : null}
      <MyTextField control={control} errors={errors} fieldName="positionCount" label={t("recruitment.openings.positionCount", "عدد الشواغر المطلوبة")} type="number" required />
    </Stack>
  </MyForm>;
}
