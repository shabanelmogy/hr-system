"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField, MySelect } from "@/shared/components/forms";
import { showToast } from "@/shared/components/feedback/transient/showToast";
import { scheduleInterviewSchema, type ScheduleInterviewFormData } from "../validation/recruitmentValidation";
import { InterviewType } from "../types";
import { useScheduleInterview } from "../hooks/useRecruitment";

interface ScheduleInterviewDialogProps {
  open: boolean;
  applicationId: number | null;
  onClose: () => void;
}

export default function ScheduleInterviewDialog({
  open,
  applicationId,
  onClose,
}: ScheduleInterviewDialogProps) {
  const { t } = useTranslation();
  const scheduleMutation = useScheduleInterview();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowPlusHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleInterviewFormData>({
    resolver: zodResolver(scheduleInterviewSchema) as any,
    defaultValues: {
      type: InterviewType.Technical,
      startsOn: tomorrow.toISOString().slice(0, 16),
      endsOn: tomorrowPlusHour.toISOString().slice(0, 16),
      locationOrMeetingUrl: "https://meet.google.com/new",
      leadEmployeeId: 1,
    },
  });

  const onSubmit = async (data: ScheduleInterviewFormData) => {
    if (!applicationId) return;

    try {
      await scheduleMutation.mutateAsync({
        employmentApplicationId: applicationId,
        type: data.type,
        startsOn: new Date(data.startsOn).toISOString(),
        endsOn: new Date(data.endsOn).toISOString(),
        locationOrMeetingUrl: data.locationOrMeetingUrl,
        leadEmployeeId: data.leadEmployeeId,
      });

      showToast.success(t("recruitment.interviews.scheduledSuccess", "تمت جدولة المقابلة بنجاح"));
      reset();
      onClose();
    } catch (err: any) {
      showToast.error(err, t("common.error", "حدث خطأ أثناء جدولة المقابلة"));
    }
  };

  const interviewTypeOptions = [
    { id: InterviewType.Phone, name: t("recruitment.interviewTypes.phone", "فرز هاتفي / Phone Screening") },
    { id: InterviewType.Video, name: t("recruitment.interviewTypes.videoCall", "مكالمة فيديو / Video Call") },
    { id: InterviewType.OnSite, name: t("recruitment.interviewTypes.onSite", "مقابلة بالفرع / On-Site") },
    { id: InterviewType.HumanResources, name: t("recruitment.interviewTypes.hr", "مقابلة الموارد البشرية / HR Interview") },
    { id: InterviewType.Technical, name: t("recruitment.interviewTypes.technical", "مقابلة تقنية / Technical Interview") },
    { id: InterviewType.Panel, name: t("recruitment.interviewTypes.panel", "مقابلة لجنة / Panel Interview") },
  ];

  return (
    <MyForm
      open={open}
      title={t("recruitment.interviews.scheduleTitle", "جدولة مقابلة شخصية / Schedule Interview")}
      subtitle={t("recruitment.interviews.scheduleSubtitle", "تحديد موعد المقابلة وطبيعتها ورابط الاجتماع")}
      isSubmitting={scheduleMutation.isPending}
      onSubmit={handleSubmit(onSubmit as any) as any}
      onClose={onClose}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
        <MySelect
          control={control as any}
          errors={errors as any}
          name="type"
          label={t("recruitment.interviews.type", "نوع المقابلة / Interview Type")}
          dataSource={interviewTypeOptions}
          valueMember="id"
          displayMember="name"
          required
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="startsOn"
              label={t("recruitment.interviews.startsOn", "وقت البدء / Starts On")}
              type="datetime-local"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <MyTextField
              control={control as any}
              errors={errors as any}
              fieldName="endsOn"
              label={t("recruitment.interviews.endsOn", "وقت الانتهاء / Ends On")}
              type="datetime-local"
              required
            />
          </Grid>
        </Grid>

        <MyTextField
          control={control as any}
          errors={errors as any}
          fieldName="locationOrMeetingUrl"
          label={t("recruitment.interviews.locationOrUrl", "المكان أو رابط الاجتماع / Meeting URL or Location")}
          placeholder="https://meet.google.com/..."
        />
      </Stack>
    </MyForm>
  );
}
