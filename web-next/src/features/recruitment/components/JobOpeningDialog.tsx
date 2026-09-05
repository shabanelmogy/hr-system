"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { jobOpeningSchema, type JobOpeningFormData } from "../validation/recruitmentValidation";
import { EmploymentType, WorkArrangement, JobRequisitionStatus } from "../types";
import { useCreateJobOpening, useJobRequisitions, useOrgLookup } from "../hooks/useRecruitment";

interface JobOpeningDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<JobOpeningFormData>;
}

export default function JobOpeningDialog({ open, onClose, initialValues }: JobOpeningDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateJobOpening();

  // Organizational lookups
  const branchesQuery = useOrgLookup("branches", open);
  const departmentsQuery = useOrgLookup("departments", open);
  const positionsQuery = useOrgLookup("positions", open);
  const requisitionsQuery = useJobRequisitions({ status: JobRequisitionStatus.Approved });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema) as any,
    defaultValues: {
      jobRequisitionId: 0,
      positionId: 1,
      branchId: 1,
      departmentId: 1,
      positionCount: 1,
      employmentType: EmploymentType.FullTime,
      workArrangement: WorkArrangement.OnSite,
    },
  });

  // Reset with initialValues if provided when opened
  useEffect(() => {
    if (open && initialValues) {
      reset({
        jobRequisitionId: initialValues.jobRequisitionId ?? 0,
        positionId: initialValues.positionId ?? 1,
        branchId: initialValues.branchId ?? 1,
        departmentId: initialValues.departmentId ?? 1,
        positionCount: initialValues.positionCount ?? 1,
        employmentType: initialValues.employmentType ?? EmploymentType.FullTime,
        workArrangement: initialValues.workArrangement ?? WorkArrangement.OnSite,
      });
    }
  }, [open, initialValues, reset]);

  // Automatically select first lookup items when they load if not initialized
  useEffect(() => {
    if (!initialValues?.branchId && branchesQuery.data?.length && (!watch("branchId") || watch("branchId") <= 0)) {
      setValue("branchId", branchesQuery.data[0].id);
    }
  }, [branchesQuery.data, setValue, watch, initialValues]);

  useEffect(() => {
    if (departmentsQuery.data?.length && (!watch("departmentId") || watch("departmentId") <= 0)) {
      setValue("departmentId", departmentsQuery.data[0].id);
    }
  }, [departmentsQuery.data, setValue, watch]);

  useEffect(() => {
    if (positionsQuery.data?.length && (!watch("positionId") || watch("positionId") <= 0)) {
      setValue("positionId", positionsQuery.data[0].id);
    }
  }, [positionsQuery.data, setValue, watch]);

  const onSubmit = async (data: JobOpeningFormData) => {
    try {
      await createMutation.mutateAsync({
        jobRequisitionId: Number(data.jobRequisitionId) || 0,
        positionId: Number(data.positionId),
        branchId: Number(data.branchId),
        departmentId: Number(data.departmentId),
        divisionId: data.divisionId ? Number(data.divisionId) : undefined,
        positionCount: Number(data.positionCount),
        employmentType: Number(data.employmentType),
        workArrangement: Number(data.workArrangement),
      });
      showToast.success(t("recruitment.openings.createdSuccess", "تم إنشاء الشاغر الوظيفي بنجاح"));
      reset();
      onClose();
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء حفظ الشاغر الوظيفي"));
    }
  };

  const branchOptions = branchesQuery.data?.map((b) => ({
    id: b.id,
    name: b.nameAr ? `${b.nameAr} (${b.code})` : `${b.nameEn} (${b.code})`,
  })) ?? [{ id: 1, name: t("recruitment.openings.defaultBranch", "الفرع الافتراضي / Default Branch") }];

  const departmentOptions = departmentsQuery.data?.map((d) => ({
    id: d.id,
    name: d.nameAr ? `${d.nameAr} (${d.code})` : `${d.nameEn} (${d.code})`,
  })) ?? [{ id: 1, name: t("recruitment.openings.defaultDepartment", "الإدارة الافتراضية / Default Department") }];

  const positionOptions = positionsQuery.data?.map((p) => ({
    id: p.id,
    name: p.nameAr || p.nameEn || p.code,
  })) ?? [{ id: 1, name: t("recruitment.openings.defaultPosition", "الوظيفة الافتراضية / Default Position") }];

  const requisitionOptions = [
    { id: 0, name: t("recruitment.openings.directOpening", "شاغر مباشر (إنشاء واعتماد احتياج تلقائياً) / Direct Opening") },
    ...(requisitionsQuery.data?.items?.map((r) => ({
      id: r.id,
      name: `${r.requisitionNumber} - ${r.positionTitleAr || r.positionTitleEn} (${r.requestedPositions} مقاعد)`,
    })) ?? []),
  ];

  const employmentTypeOptions = [
    { id: EmploymentType.FullTime, name: t("recruitment.types.fullTime", "دوام كامل / Full Time") },
    { id: EmploymentType.PartTime, name: t("recruitment.types.partTime", "دوام جزئي / Part Time") },
    { id: EmploymentType.Contract, name: t("recruitment.types.contract", "عقد / Contract") },
    { id: EmploymentType.Internship, name: t("recruitment.types.internship", "تدريب / Internship") },
  ];

  const workArrangementOptions = [
    { id: WorkArrangement.OnSite, name: t("recruitment.work.onSite", "حضوري بالفرع / On-Site") },
    { id: WorkArrangement.Remote, name: t("recruitment.work.remote", "عن بعد / Remote") },
    { id: WorkArrangement.Hybrid, name: t("recruitment.work.hybrid", "هجين / Hybrid") },
  ];

  return (
    <MyForm
      open={open}
      title={t("recruitment.openings.createTitle", "إنشاء شاغر وظيفي جديد / Create Job Opening")}
      subtitle={t("recruitment.openings.createSubtitle", "إضافة شاغر جديد لفتح باب التقديم والتوظيف")}
      isSubmitting={createMutation.isPending}
      onSubmit={handleSubmit(onSubmit as any) as any}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <MySelect
          control={control as any}
          errors={errors as any}
          name="positionId"
          label={t("recruitment.openings.position", "الوظيفة / المنصب (Position)")}
          dataSource={positionOptions}
          valueMember="id"
          displayMember="name"
          required
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="branchId"
              label={t("recruitment.openings.branch", "الفرع (Branch)")}
              dataSource={branchOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="departmentId"
              label={t("recruitment.openings.department", "الإدارة (Department)")}
              dataSource={departmentOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
        </Grid>

        <MySelect
          control={control as any}
          errors={errors as any}
          name="jobRequisitionId"
          label={t("recruitment.openings.requisition", "طلب الاحتياج الوظيفي (Job Requisition)")}
          dataSource={requisitionOptions}
          valueMember="id"
          displayMember="name"
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="positionCount"
              label={t("recruitment.openings.positionCount", "عدد الشواغر المطلوبة")}
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="employmentType"
              label={t("recruitment.openings.employmentType", "نوع التوظيف")}
              dataSource={employmentTypeOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="workArrangement"
              label={t("recruitment.openings.workArrangement", "طبيعة العمل")}
              dataSource={workArrangementOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
        </Grid>
      </Stack>
    </MyForm>
  );
}
