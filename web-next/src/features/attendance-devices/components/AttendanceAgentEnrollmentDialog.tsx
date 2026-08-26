"use client";

import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MyTextField } from "@/shared/components/forms";
import type { CreatedAttendanceAgent } from "../types/attendanceDevices";
import {
  getAttendanceAgentFormSchema,
  type AttendanceAgentFormValues,
} from "../utils/validation";

interface AttendanceAgentEnrollmentDialogProps {
  open: boolean;
  disabled: boolean;
  created: CreatedAttendanceAgent | null;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export function AttendanceAgentEnrollmentDialog({
  open,
  disabled,
  created,
  onClose,
  onCreate,
}: AttendanceAgentEnrollmentDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => getAttendanceAgentFormSchema(t), [t]);
  const done = created !== null;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AttendanceAgentFormValues>({
    resolver: zodResolver(schema) as Resolver<AttendanceAgentFormValues>,
    mode: "onSubmit",
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (open && !created) reset({ name: "" });
  }, [created, open, reset]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      onSubmit={done ? onClose : handleSubmit(({ name }) => onCreate(name.trim()))}
      title={done ? t("attendanceDevices.installSiteAgent") : t("attendanceDevices.addSiteAgent")}
      subtitle={done
        ? t("attendanceDevices.installSiteAgentSubtitle")
        : t("attendanceDevices.addSiteAgentSubtitle")}
      submitButtonText={done ? t("attendanceDevices.done") : t("attendanceDevices.createEnrollment")}
      icon={<ComputerRoundedIcon />}
      isSubmitting={disabled}
      isDirty={!done && isDirty}
      focusFieldName="name"
      overlayActionType="create"
      overlayMessage={t("attendanceDevices.creatingEnrollment")}
      errors={getErrorMessages(errors)}
    >
      {done ? (
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            {t("attendanceDevices.copyTokenWarning")}
          </Alert>
          <MyTextField
            fieldName="agent-id"
            label={t("attendanceDevices.agentId")}
            value={created.installConfiguration.agentId}
            readOnly
            showClearButton={false}
          />
          <MyTextField
            fieldName="enrollment-token"
            label={t("attendanceDevices.enrollmentToken")}
            value={created.installConfiguration.enrollmentToken}
            readOnly
            showClearButton={false}
          />
          <Button
            variant="contained"
            startIcon={<DownloadRoundedIcon />}
            onClick={() => downloadAgentConfiguration(created)}
          >
            {t("attendanceDevices.downloadAgentConfiguration")}
          </Button>
          <Button
            component="a"
            href={getAgentInstallerUrl(created)}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<DownloadRoundedIcon />}
          >
            {t("attendanceDevices.downloadWindowsAgent")}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {t("attendanceDevices.installSiteAgentInstructions")}
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            {t("attendanceDevices.agentOutboundInfo")}
          </Alert>
          <MyTextField
            control={control}
            errors={errors}
            fieldName="name"
            label={t("attendanceDevices.agentName")}
            required
            maxLength={100}
            showCounter
            loading={disabled}
            helperText={t("attendanceDevices.agentNameHint")}
          />
        </Stack>
      )}
    </MyForm>
  );
}

function getAgentInstallerUrl(created: CreatedAttendanceAgent) {
  return new URL(
    "downloads/attendance-agent/HrAttendanceAgent-win-x86.zip",
    `${created.installConfiguration.hostedApiBaseUrl}/`,
  ).toString();
}

function downloadAgentConfiguration(created: CreatedAttendanceAgent) {
  const configuration = {
    AttendanceAgent: {
      Enabled: true,
      HostedApiBaseUrl: created.installConfiguration.hostedApiBaseUrl,
      AgentId: created.installConfiguration.agentId,
      EnrollmentToken: created.installConfiguration.enrollmentToken,
      PollIntervalSeconds: created.installConfiguration.pollIntervalSeconds,
      AllowHttpForLocalDevelopment: false,
    },
  };
  const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "agent-config.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function getErrorMessages(errors: Record<string, unknown>): Record<string, string> {
  return Object.entries(errors).reduce<Record<string, string>>((messages, [field, error]) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      messages[field] = error.message;
    }
    return messages;
  }, {});
}
