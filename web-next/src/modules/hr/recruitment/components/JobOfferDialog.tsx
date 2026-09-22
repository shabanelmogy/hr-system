"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Grid, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { jobOfferSchema, type JobOfferFormData, type JobOfferFormInput } from "../validation/recruitmentValidation";
import { PayFrequency } from "../types";
import { useApplication, useCreateJobOffer, useJobOpening, useRecruitmentSettingsQuery, useSubmitJobOffer } from "../hooks/useRecruitment";
import { useCurrencyLookup } from "@/modules/accounting/public";

interface JobOfferDialogProps {
  open: boolean;
  applicationId: number | null;
  onClose: () => void;
}

export default function JobOfferDialog({
  open,
  applicationId,
  onClose,
}: JobOfferDialogProps) {
  const { t } = useTranslation();
  const createOfferMutation = useCreateJobOffer();
  const submitOfferMutation = useSubmitJobOffer();
  const applicationQuery = useApplication(applicationId ?? 0);
  const openingQuery = useJobOpening(applicationQuery.data?.jobOpeningId ?? 0);
  const settingsQuery = useRecruitmentSettingsQuery();
  const currencies = useCurrencyLookup(open);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<JobOfferFormInput, unknown, JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      baseSalary: "",
      currencyCode: "",
      payFrequency: undefined,
      proposedStartDate: "",
      termsAndConditions: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      baseSalary: "",
      currencyCode: "",
      payFrequency: undefined,
      proposedStartDate: "",
      termsAndConditions: "",
    });
  }, [applicationId, open, reset]);

  useEffect(() => {
    const defaultCurrency = settingsQuery.data?.general.defaultCurrency;
    if (open && defaultCurrency) setValue("currencyCode", defaultCurrency);
  }, [open, setValue, settingsQuery.data?.general.defaultCurrency]);

  const onSubmit = async (data: JobOfferFormData) => {
    const opening = openingQuery.data;
    if (!applicationId || !opening) return;

    try {
      const offer = await createOfferMutation.mutateAsync({
        employmentApplicationId: applicationId,
        baseSalary: data.baseSalary,
        currencyCode: data.currencyCode.trim().toUpperCase(),
        payFrequency: data.payFrequency,
        employmentType: opening.employmentType,
        workArrangement: opening.workArrangement,
        proposedStartDate: data.proposedStartDate,
        termsAndConditions: data.termsAndConditions || undefined,
      });

      // Governance: offers start as Draft; issuing requires approval first.
      await submitOfferMutation.mutateAsync(offer.id);

      showToast.success(t("recruitment.offers.offerSubmittedSuccess", "تم إنشاء العرض وإرساله للاعتماد بنجاح"));
      reset();
      onClose();
    } catch (err: unknown) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء إنشاء عرض العمل"));
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
      isSubmitting={createOfferMutation.isPending || submitOfferMutation.isPending || applicationQuery.isFetching || openingQuery.isFetching || settingsQuery.isFetching || currencies.isFetching}
      onSubmit={handleSubmit(onSubmit)}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        {openingQuery.data ? <Alert severity="info">
          {openingQuery.data.openingNumber} · {openingQuery.data.positionTitleAr || openingQuery.data.positionTitleEn}
        </Alert> : null}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <MyTextField
              control={control}
              errors={errors}
              fieldName="baseSalary"
              label={t("recruitment.offers.baseSalary", "الراتب الأساسي / Base Salary")}
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MySelect
              control={control}
              errors={errors}
              name="currencyCode"
              label={t("recruitment.offers.currency", "العملة / Currency")}
              dataSource={(currencies.data ?? []).map(currency => ({ id: currency.currencyCode, name: `${currency.currencyCode} — ${currency.nameEn} (${currency.nameAr})` }))}
              valueMember="id"
              displayMember="name"
              loading={currencies.isLoading}
              required
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MySelect
              control={control}
              errors={errors}
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
              control={control}
              errors={errors}
              fieldName="proposedStartDate"
              label={t("recruitment.offers.startDate", "تاريخ بدء العمل المقترح / Start Date")}
              type="date"
              required
            />
          </Grid>
        </Grid>

        <MyTextField
          control={control}
          errors={errors}
          fieldName="termsAndConditions"
          label={t("recruitment.offers.terms", "الشروط والأحكام / Terms and Conditions")}
          multiline
          rows={3}
        />
      </Stack>
    </MyForm>
  );
}
