"use client";

import RouterRoundedIcon from "@mui/icons-material/RouterRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import type {
  AttendanceAgent,
  AttendanceBranch,
  AttendanceDeviceListItem,
  CreateAttendanceDeviceRequest,
  ProviderCatalogItem,
} from "../types/attendanceDevices";
import {
  getAttendanceDeviceFormSchema,
  type AttendanceDeviceFormValues,
} from "../utils/validation";

interface DeviceFormDialogProps {
  open: boolean;
  device: AttendanceDeviceListItem | null;
  providers: ProviderCatalogItem[];
  branches: AttendanceBranch[];
  agents: AttendanceAgent[];
  disabled: boolean;
  onClose: () => void;
  onSubmit: (request: CreateAttendanceDeviceRequest) => void;
}

export function DeviceFormDialog({
  open,
  device,
  providers,
  branches,
  agents,
  disabled,
  onClose,
  onSubmit,
}: DeviceFormDialogProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => getAttendanceDeviceFormSchema(t), [t]);
  const defaultValues = useMemo<AttendanceDeviceFormValues>(() => ({
    name: device?.name ?? "",
    providerId: device?.providerId ?? providers[0]?.providerId ?? "",
    host: device?.host ?? "",
    port: device?.port ?? 4370,
    timeZoneId: device?.timeZoneId ?? "Africa/Cairo",
    branchId: device?.branchId ?? null,
    attendanceAgentId: device?.attendanceAgentId ?? agents.find((agent) => agent.isActive)?.id ?? "",
  }), [agents, device, providers]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AttendanceDeviceFormValues>({
    resolver: zodResolver(schema) as Resolver<AttendanceDeviceFormValues>,
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (open) reset(defaultValues);
  }, [defaultValues, open, reset]);

  return (
    <MyForm
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit((values) => onSubmit({ ...values, connectionMode: "tcp" }))}
      title={device ? t("attendanceDevices.editDevice") : t("attendanceDevices.addDevice")}
      subtitle={t("attendanceDevices.deviceFormSubtitle")}
      submitButtonText={device ? t("actions.save") : t("attendanceDevices.addDevice")}
      icon={<RouterRoundedIcon />}
      isSubmitting={disabled}
      isDirty={isDirty}
      focusFieldName="name"
      overlayActionType={device ? "update" : "create"}
      overlayMessage={device ? t("attendanceDevices.updatingDevice") : t("attendanceDevices.creatingDevice")}
      errors={getErrorMessages(errors)}
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <MyTextField
          control={control}
          errors={errors}
          fieldName="name"
          label={t("attendanceDevices.deviceName")}
          required
          maxLength={100}
          showCounter
          loading={disabled}
        />
        <MySelect<ProviderCatalogItem, AttendanceDeviceFormValues>
          control={control}
          errors={errors}
          name="providerId"
          label={t("attendanceDevices.provider")}
          required
          loading={disabled}
          dataSource={providers.filter((provider) => provider.configured)}
          valueMember="providerId"
          displayMember="displayName"
          noOptionsText={t("attendanceDevices.noConfiguredProvider")}
        />
        <MySelect<AttendanceAgent, AttendanceDeviceFormValues>
          control={control}
          errors={errors}
          name="attendanceAgentId"
          label={t("attendanceDevices.siteAgent")}
          required
          loading={disabled}
          dataSource={agents.filter((agent) => agent.isActive)}
          valueMember="id"
          displayMember="name"
          noOptionsText={t("attendanceDevices.noActiveAgent")}
        />
        <MySelect<AttendanceBranch, AttendanceDeviceFormValues>
          control={control}
          errors={errors}
          name="branchId"
          label={t("attendanceDevices.branchOptional")}
          loading={disabled}
          showClearButton
          dataSource={branches}
          valueMember="id"
          displayMember="nameEn"
          noOptionsText={t("attendanceDevices.noBranches")}
        />
        <MyTextField
          control={control}
          errors={errors}
          fieldName="host"
          label={t("attendanceDevices.host")}
          required
          maxLength={255}
          loading={disabled}
          helperText={t("attendanceDevices.hostHint")}
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <MyTextField
            control={control}
            errors={errors}
            fieldName="port"
            label={t("attendanceDevices.port")}
            type="number"
            required
            minValue={1}
            maxValue={65535}
            loading={disabled}
          />
          <MyTextField
            control={control}
            errors={errors}
            fieldName="timeZoneId"
            label={t("attendanceDevices.timeZone")}
            required
            maxLength={100}
            loading={disabled}
          />
        </Stack>
      </Stack>
    </MyForm>
  );
}

function getErrorMessages(errors: Record<string, unknown>): Record<string, string> {
  return Object.entries(errors).reduce<Record<string, string>>((messages, [field, error]) => {
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
      messages[field] = error.message;
    }
    return messages;
  }, {});
}
