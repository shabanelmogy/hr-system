import { z } from "zod";
import type { TFunction } from "i18next";

const optionalBranchId = z
  .number()
  .nullable()
  .optional()
  .transform((value) => value ?? null);

export const getAttendanceDeviceFormSchema = (t: TFunction) => z.object({
  name: z.string().trim().min(1, t("attendanceDevices.validation.nameRequired")).max(100),
  providerId: z.string().min(1, t("attendanceDevices.validation.providerRequired")),
  host: z.string().trim().min(1, t("attendanceDevices.validation.hostRequired")).max(255),
  port: z.coerce.number().int().min(1, t("attendanceDevices.validation.portRange")).max(65535, t("attendanceDevices.validation.portRange")),
  timeZoneId: z.string().trim().min(1, t("attendanceDevices.validation.timeZoneRequired")).max(100),
  branchId: optionalBranchId,
  attendanceAgentId: z.string().uuid(t("attendanceDevices.validation.agentRequired")),
});

export type AttendanceDeviceFormValues = z.infer<ReturnType<typeof getAttendanceDeviceFormSchema>>;

export const getAttendanceAgentFormSchema = (t: TFunction) => z.object({
  name: z.string().trim().min(1, t("attendanceDevices.validation.agentNameRequired")).max(100),
});

export type AttendanceAgentFormValues = z.infer<ReturnType<typeof getAttendanceAgentFormSchema>>;
