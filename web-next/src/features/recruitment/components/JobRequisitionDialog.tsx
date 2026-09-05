"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Grid, Switch, FormControlLabel, Box, Typography, Alert, AlertTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { jobRequisitionSchema, type JobRequisitionFormData } from "../validation/recruitmentValidation";
import { EmploymentType, WorkArrangement, RequisitionType } from "../types";
import {
  useCreateJobRequisition,
  useSubmitJobRequisition,
  useApproveJobRequisition,
  useCreateJobOpening,
  useOrgLookup,
  usePositionHeadcountSummary,
} from "../hooks/useRecruitment";

interface JobRequisitionDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function JobRequisitionDialog({ open, onClose }: JobRequisitionDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateJobRequisition();
  const submitMutation = useSubmitJobRequisition();
  const approveMutation = useApproveJobRequisition();
  const createOpeningMutation = useCreateJobOpening();

  const [autoCreateOpening, setAutoCreateOpening] = useState(true);

  // Organizational lookups
  const branchesQuery = useOrgLookup("branches", open);
  const departmentsQuery = useOrgLookup("departments", open);
  const positionsQuery = useOrgLookup("positions", open);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobRequisitionFormData>({
    resolver: zodResolver(jobRequisitionSchema) as any,
    defaultValues: {
      positionId: 1,
      branchId: 1,
      departmentId: 1,
      requestedPositions: 1,
      businessReason: "توسع في أنشطة الإدارة وتلبية لمتطلبات خطة العمل",
      employmentType: EmploymentType.FullTime,
      workArrangement: WorkArrangement.OnSite,
      type: RequisitionType.NewPosition,
      isBudgeted: true,
      budgetJustification: "",
    },
  });

  const selectedPositionId = watch("positionId");
  const headcountQuery = usePositionHeadcountSummary(selectedPositionId, {
    enabled: open && !!selectedPositionId && selectedPositionId > 0,
  });
  const headcountSummary = headcountQuery.data;

  const currentType = Number(watch("type")) || RequisitionType.NewPosition;
  const requestedPositions = Number(watch("requestedPositions") || 1);
  const availableHeadcount = headcountSummary?.availableHeadcount ?? 1;
  const isExceedingHeadcount =
    currentType === RequisitionType.NewPosition && requestedPositions > availableHeadcount;

  useEffect(() => {
    if (branchesQuery.data?.length && (!watch("branchId") || watch("branchId") <= 0)) {
      setValue("branchId", branchesQuery.data[0].id);
    }
  }, [branchesQuery.data, setValue, watch]);

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

  const onSubmit = async (data: JobRequisitionFormData) => {
    try {
      const requisition = await createMutation.mutateAsync({
        positionId: Number(data.positionId),
        branchId: Number(data.branchId),
        departmentId: Number(data.departmentId),
        divisionId: data.divisionId ? Number(data.divisionId) : undefined,
        requestedPositions: Number(data.requestedPositions),
        businessReason: data.businessReason,
        employmentType: Number(data.employmentType),
        workArrangement: Number(data.workArrangement),
        targetHireDate: data.targetHireDate,
        type: Number(data.type) || RequisitionType.NewPosition,
        replacementEmployeeId: data.replacementEmployeeId ? Number(data.replacementEmployeeId) : undefined,
        isBudgeted: !isExceedingHeadcount,
        budgetJustification: data.budgetJustification?.trim() || undefined,
      });

      // Submit and approve requisition so it can immediately be used for job openings
      await submitMutation.mutateAsync(requisition.id);
      await approveMutation.mutateAsync(requisition.id);

      if (autoCreateOpening) {
        await createOpeningMutation.mutateAsync({
          jobRequisitionId: requisition.id,
          positionId: Number(data.positionId),
          branchId: Number(data.branchId),
          departmentId: Number(data.departmentId),
          divisionId: data.divisionId ? Number(data.divisionId) : undefined,
          positionCount: Number(data.requestedPositions),
          employmentType: Number(data.employmentType),
          workArrangement: Number(data.workArrangement),
        });

        showToast.success(
          t(
            "recruitment.requisitions.createdWithOpeningSuccess",
            "تم إنشاء واعتماد طلب الاحتياج ونشر الشاغر الوظيفي مباشرة بنجاح"
          )
        );
      } else {
        showToast.success(
          t(
            "recruitment.requisitions.createdSuccess",
            "تم إنشاء واعتماد طلب الاحتياج الوظيفي بنجاح، وأصبح متاحاً لفتح الشواغر الوظيفية"
          )
        );
      }

      reset();
      onClose();
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء حفظ طلب الاحتياج"));
    }
  };

  const requisitionTypeOptions = [
    {
      id: RequisitionType.NewPosition,
      name: t("recruitment.requisitions.typeNewPosition", "وظيفة جديدة ضمن الهيكل / New Position"),
    },
    {
      id: RequisitionType.Replacement,
      name: t("recruitment.requisitions.typeReplacement", "إحلال / بديل لموظف مستقيل (Replacement)"),
    },
  ];

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
      title={t("recruitment.requisitions.createTitle", "رفع طلب احتياج وظيفي جديد / New Job Requisition")}
      subtitle={t("recruitment.requisitions.createSubtitle", "تقديم طلب من الإدارة المعنية لتوفير كوادر وظيفية واعتمادها")}
      isSubmitting={createMutation.isPending || submitMutation.isPending || approveMutation.isPending}
      onSubmit={handleSubmit(onSubmit as any) as any}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="type"
              label={t("recruitment.requisitions.type", "نوع طلب الاحتياج (Requisition Type)")}
              dataSource={requisitionTypeOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="positionId"
              label={t("recruitment.openings.position", "الوظيفة / المنصب المطلوب (Position)")}
              dataSource={positionOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
        </Grid>

        {headcountSummary && (
          <Box
            sx={{
              p: 2,
              bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.900" : "grey.50"),
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 1 }}>
              {t("recruitment.headcount.summaryTitle", "موازنة وسقف الوظيفة (Headcount Budget & Availability)")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("recruitment.headcount.target", "السقف المعتمد")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {headcountSummary.targetHeadcount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("recruitment.headcount.active", "المشغول حالياً")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "info.main" }}>
                  {headcountSummary.activeHeadcount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("recruitment.headcount.pending", "طلبات قيد الإجراء")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "warning.main" }}>
                  {headcountSummary.pendingRequisitionsCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t("recruitment.headcount.available", "الشاغر المتاح بالموازنة")}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: headcountSummary.availableHeadcount > 0 ? "success.main" : "error.main",
                  }}
                >
                  {headcountSummary.availableHeadcount}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {isExceedingHeadcount && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              {t("recruitment.headcount.exceedsWarningTitle", "طلب غير مدرج بالموازنة المعتمدة (Unbudgeted Requisition)")}
            </AlertTitle>
            {t(
              "recruitment.headcount.exceedsWarningMsg",
              `عدد المقاعد المطلوبة (${requestedPositions}) يتجاوز الشاغر المتاح بالموازنة (${availableHeadcount}). سيتم تصنيف الطلب كغير مدرج بالموازنة ويجب كتابة مبرر استثنائي أدناه.`
            )}
          </Alert>
        )}

        {currentType === RequisitionType.Replacement && (
          <MyTextField
            control={control as any}
            errors={errors as any}
            fieldName="replacementEmployeeId"
            label={t("recruitment.requisitions.replacementEmployeeId", "معرف الموظف المستبدل (Employee ID to Replace)")}
            type="number"
            required
            placeholder="1"
          />
        )}

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
              label={t("recruitment.openings.department", "الإدارة الطالبة (Department)")}
              dataSource={departmentOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="requestedPositions"
              label={t("recruitment.requisitions.requestedPositions", "عدد المقاعد المطلوبة (Headcount)")}
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

        <MyTextField
          control={control as any}
          errors={errors as any}
          fieldName="businessReason"
          label={t("recruitment.requisitions.businessReason", "مبرر الاحتياج الوظيفي (Business Justification)")}
          multiline
          rows={2}
          required
        />

        {isExceedingHeadcount && (
          <MyTextField
            control={control as any}
            errors={errors as any}
            fieldName="budgetJustification"
            label={t("recruitment.requisitions.budgetJustification", "مبرر الموازنة الاستثنائية (Budget Justification)")}
            multiline
            rows={2}
            required
            placeholder={t(
              "recruitment.requisitions.budgetJustificationPlaceholder",
              "بيان أسباب التعيين الاستثنائي وتجاوز سقف الموازنة المعتمد..."
            )}
          />
        )}

        <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={autoCreateOpening}
                onChange={(e) => setAutoCreateOpening(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t(
                    "recruitment.requisitions.autoCreateOpening",
                    "فتح شاغر وظيفي ونشره فوراً على لوحة التوظيف / Open Job Position Immediately"
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {t(
                    "recruitment.requisitions.autoCreateOpeningHelp",
                    "إنشاء بطاقة الوظيفة الشاغرة تلقائياً لاستقبال طلبات المتقدمين بمجرد الحفظ"
                  )}
                </Typography>
              </Box>
            }
          />
        </Box>
      </Stack>
    </MyForm>
  );
}
