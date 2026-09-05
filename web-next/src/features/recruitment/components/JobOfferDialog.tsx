"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { jobOfferSchema, type JobOfferFormData } from "../validation/recruitmentValidation";
import { PayFrequency, EmploymentType, WorkArrangement } from "../types";
import { useCreateJobOffer, useIssueJobOffer } from "../hooks/useRecruitment";

interface JobOfferDialogProps {
  open: boolean;
  applicationId: number | null;
  positionId?: number;
  branchId?: number;
  departmentId?: number;
  onClose: () => void;
}

export default function JobOfferDialog({
  open,
  applicationId,
  positionId = 1,
  branchId = 1,
  departmentId = 1,
  onClose,
}: JobOfferDialogProps) {
  const { t } = useTranslation();
  const createOfferMutation = useCreateJobOffer();
  const issueOfferMutation = useIssueJobOffer();

  const twoWeeksLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema) as any,
    defaultValues: {
      baseSalary: 25000,
      currencyCode: "EGP",
      payFrequency: PayFrequency.Monthly,
      proposedStartDate: twoWeeksLater.toISOString().split("T")[0],
      termsAndConditions: "Standard 3-month probation period with full health coverage.",
    },
  });

  const onSubmit = async (data: JobOfferFormData) => {
    if (!applicationId) return;

    try {
      const offer = await createOfferMutation.mutateAsync({
        employmentApplicationId: applicationId,
        positionId,
        branchId,
        departmentId,
        baseSalary: data.baseSalary,
        currencyCode: data.currencyCode,
        payFrequency: data.payFrequency,
        employmentType: EmploymentType.FullTime,
        workArrangement: WorkArrangement.Hybrid,
        proposedStartDate: data.proposedStartDate,
        termsAndConditions: data.termsAndConditions,
      });

      // Auto issue offer
      await issueOfferMutation.mutateAsync(offer.id);

      showToast.success(t("recruitment.offers.offerCreatedSuccess", "تم إصدار عرض العمل بنجاح"));
      reset();
      onClose();
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء إصدار عرض العمل"));
    }
  };

  const payFrequencyOptions = [
    { id: PayFrequency.Monthly, name: t("recruitment.pay.monthly", "شهري / Monthly") },
    { id: PayFrequency.Weekly, name: t("recruitment.pay.weekly", "أسبوعي / Weekly") },
    { id: PayFrequency.Annual, name: t("recruitment.pay.annually", "سنوي / Annually") },
    { id: PayFrequency.Daily, name: t("recruitment.pay.daily", "يومي / Daily") },
    { id: PayFrequency.Hourly, name: t("recruitment.pay.hourly", "بالساعة / Hourly") },
  ];

  return (
    <MyForm
      open={open}
      title={t("recruitment.offers.createTitle", "إصدار عرض عمل رسمي / Make Job Offer")}
      subtitle={t("recruitment.offers.createSubtitle", "تحديد الراتب الأساسي وتاريخ بدء العمل والشروط")}
      isSubmitting={createOfferMutation.isPending || issueOfferMutation.isPending}
      onSubmit={handleSubmit(onSubmit as any) as any}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="baseSalary"
              label={t("recruitment.offers.baseSalary", "الراتب الأساسي / Base Salary")}
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="currencyCode"
              label={t("recruitment.offers.currency", "العملة / Currency")}
              required
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control as any}
              errors={errors as any}
              name="payFrequency"
              label={t("recruitment.offers.payFrequency", "دورية الدفع / Pay Frequency")}
              dataSource={payFrequencyOptions}
              valueMember="id"
              displayMember="name"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="proposedStartDate"
              label={t("recruitment.offers.startDate", "تاريخ بدء العمل المقترح / Start Date")}
              type="date"
              required
            />
          </Grid>
        </Grid>

        <MyTextField
          control={control as any}
          errors={errors as any}
          fieldName="termsAndConditions"
          label={t("recruitment.offers.terms", "الشروط والأحكام / Terms and Conditions")}
          multiline
          rows={3}
        />
      </Stack>
    </MyForm>
  );
}
