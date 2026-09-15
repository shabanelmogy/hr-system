"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { newApplicationSchema, type NewApplicationFormData, type NewApplicationFormInput } from "../validation/recruitmentValidation";
import { ApplicationSource, JobOpeningStatus } from "../types";
import { useCreateCandidate, useJobOpenings, useRecruitmentSettingsQuery, useSubmitApplication } from "../hooks/useRecruitment";

interface NewApplicationDialogProps {
  open: boolean;
  openingId: number | null;
  onClose: () => void;
}

export default function NewApplicationDialog({
  open,
  openingId,
  onClose,
}: NewApplicationDialogProps) {
  const { t } = useTranslation();
  const createCandidateMutation = useCreateCandidate();
  const submitAppMutation = useSubmitApplication();
  const openingsQuery = useJobOpenings({ pageNumber: 1, pageSize: 100, status: JobOpeningStatus.Open });
  const settingsQuery = useRecruitmentSettingsQuery();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NewApplicationFormInput, unknown, NewApplicationFormData>({
    resolver: zodResolver(newApplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      jobOpeningId: openingId ?? undefined,
      source: undefined,
      expectedSalaryCurrencyCode: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    setValue("jobOpeningId", openingId ?? undefined);
  }, [open, openingId, setValue]);

  useEffect(() => {
    const defaultCurrency = settingsQuery.data?.general.defaultCurrency;
    if (open && defaultCurrency) setValue("expectedSalaryCurrencyCode", defaultCurrency);
  }, [open, setValue, settingsQuery.data?.general.defaultCurrency]);

  const onSubmit = async (data: NewApplicationFormData) => {
    try {
      // 1. Create candidate
      const candidate = await createCandidateMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      // 2. Submit application
      await submitAppMutation.mutateAsync({
        candidateId: candidate.id,
        jobOpeningId: data.jobOpeningId,
        source: data.source,
        expectedSalary: data.expectedSalary,
        expectedSalaryCurrencyCode: data.expectedSalaryCurrencyCode,
        availableFrom: data.availableFrom,
        coverLetter: data.coverLetter,
      });

      showToast.success(t("recruitment.applications.submittedSuccess", "تم تقديم طلب المرشح بنجاح"));
      reset();
      onClose();
    } catch (err: unknown) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء تقديم الطلب"));
    }
  };

  const sourceOptions = [
    { id: ApplicationSource.CareersPortal, name: t("recruitment.sources.careersPortal", "بوابة التوظيف / Careers Portal") },
    { id: ApplicationSource.Internal, name: t("recruitment.sources.internal", "داخلي / Internal") },
    { id: ApplicationSource.EmployeeReferral, name: t("recruitment.sources.referral", "ترشيح موظف / Employee Referral") },
    { id: ApplicationSource.RecruitmentAgency, name: t("recruitment.sources.agency", "وكالة توظيف / Recruitment Agency") },
    { id: ApplicationSource.Manual, name: t("recruitment.sources.manual", "إدخال يدوي / Manual Direct") },
  ];
  const openingOptions = (openingsQuery.data?.items ?? []).map((opening) => ({
    id: opening.id,
    name: `${opening.openingNumber} — ${opening.positionTitleAr || opening.positionTitleEn}`,
  }));

  return (
    <MyForm
      open={open}
      title={t("recruitment.applications.newTitle", "تقديم طلب مرشح جديد / New Candidate Application")}
      subtitle={t("recruitment.applications.newSubtitle", "تسجيل بيانات المرشح وربطه بالوظيفة الشاغرة")}
      isSubmitting={createCandidateMutation.isPending || submitAppMutation.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <MySelect
          control={control}
          errors={errors}
          name="jobOpeningId"
          label={t("recruitment.openings.requisition", "الشاغر الوظيفي / Job Opening")}
          dataSource={openingOptions}
          valueMember="id"
          displayMember="name"
          loading={openingsQuery.isLoading}
          required
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="firstName"
              label={t("recruitment.candidate.firstName", "الاسم الأول / First Name")}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="lastName"
              label={t("recruitment.candidate.lastName", "اسم العائلة / Last Name")}
              required
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="email"
              label={t("recruitment.candidate.email", "البريد الإلكتروني / Email Address")}
              type="email"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="phoneNumber"
              label={t("recruitment.candidate.phone", "رقم الهاتف / Phone Number")}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="expectedSalary"
              label={t("recruitment.candidate.expectedSalary", "الراتب المتوقع / Expected Salary")}
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="expectedSalaryCurrencyCode"
              label={t("recruitment.offers.currency", "العملة / Currency")}
              required
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control}
              errors={errors}
              name="source"
              label={t("recruitment.candidate.source", "مصدر الطلب / Application Source")}
              dataSource={sourceOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
        </Grid>

        <MyTextField
          control={control}
          errors={errors}
          fieldName="coverLetter"
          label={t("recruitment.candidate.coverLetter", "خطاب التقديم أو ملاحظات / Cover Letter or Notes")}
          multiline
          rows={3}
        />
      </Stack>
    </MyForm>
  );
}
