import type { ManagementPageResponse } from "@/lib/api/pagination";

export type AttendanceDeviceId = number;
export type SortDirection = "asc" | "desc";
export type PullOperation = "users" | "attendance";
export type AttendanceDeviceSort = "name" | "providerId" | "host" | "enabled" | "updatedOn";

export interface AttendanceDeviceListItem {
  id: AttendanceDeviceId; name: string; providerId: string; host: string; port: number;
  timeZoneId: string; enabled: boolean; hasCredentials: boolean; lastSeenAtUtc: string | null;
  lastPullAtUtc: string | null; rowVersion: string;
  branchId?: number | null; branchNameEn?: string | null; branchNameAr?: string | null;
  attendanceAgentId?: string | null; attendanceAgentName?: string | null;
  connectionMode?: "tcp";
}
export type AttendanceDeviceDetail = AttendanceDeviceListItem;
export interface ProviderCatalogItem {
  providerId: string; displayName: string; available: boolean; configured: boolean;
  supportsTestConnection: boolean; supportsUsers: boolean; supportsAttendance: boolean;
  supportsDetection: boolean; availabilityDetail: string | null;
}
export interface ConnectorHealth { available: boolean; status: string; architecture?: string; providers?: ProviderCatalogItem[]; message?: string | null; }
export interface DeviceTestResult {
  connected: boolean; serialNumber: string | null; firmwareVersion: string | null;
  platform: string | null; sdkVersion: string | null; errorCode: string | null; message: string | null;
}
export interface DetectDeviceRequest { host: string; port: number; }
export interface DetectDeviceResult { host: string; port: number; detected: boolean; message: string | null; }
export interface AttendanceAgent { id: string; name: string; isActive: boolean; lastSeenAtUtc: string | null; deviceCount: number; }
/** Returned exactly once when an agent is enrolled. Never persist the token in browser state. */
export interface AttendanceAgentInstallConfiguration {
  agentId: string;
  enrollmentToken: string;
  hostedApiBaseUrl: string;
  pollIntervalSeconds: number;
}
export interface CreatedAttendanceAgent {
  agent: AttendanceAgent;
  /** Kept for the one-time display only; use installConfiguration when producing the config file. */
  enrollmentToken: string;
  installConfiguration: AttendanceAgentInstallConfiguration;
}
export interface CreateAttendanceAgentRequest { name: string; }
export interface CreateAttendanceDeviceRequest { name: string; providerId: string; host: string; port: number; timeZoneId: string; branchId?: number | null; connectionMode?: "tcp"; attendanceAgentId?: string | null; }
export type UpdateAttendanceDeviceRequest = CreateAttendanceDeviceRequest;
/** Secrets are write-only and must never be displayed after submission. */
export interface UpdateCredentialsRequest { password?: string; commKey?: string; token?: string; }
export interface AttendanceBranch { id: number; nameEn: string; nameAr: string; branchCode: string; }
export interface StartPullRequest { fromUtc?: string; toUtc?: string; }
export interface AttendanceDeviceQuery { pageNumber: number; pageSize: number; search?: string; sortBy: AttendanceDeviceSort; sortDirection: SortDirection; }
export interface RawDeviceUser { id: number; deviceId: number; deviceName: string; externalCode: string; name: string | null; safeRawPayload: string | null; pulledAtUtc: string; }
export interface RawPunch {
  id: number; deviceId: number; deviceName: string; externalCode: string; name: string | null;
  occurredAtDeviceLocal: string; occurredAtUtc: string; verifyMode: number; inOutMode: number;
  workCode: number; providerEventId: string | null; safeRawPayload: string | null; pulledAtUtc: string;
}
export interface DevicePullRun {
  id: number; deviceId: number; operationType: PullOperation; status: string; operationId: string;
  startedAtUtc: string; finishedAtUtc: string | null; fromUtc: string | null; toUtc: string | null;
  readCount: number; insertedCount: number; duplicateCount: number; skippedCount: number;
  errorCount: number; error: string | null;
}
export interface RawUserQuery { pageNumber: number; pageSize: number; search?: string; sortBy: "externalCode" | "name" | "pulledAtUtc"; sortDirection: SortDirection; }
export interface RawPunchQuery { pageNumber: number; pageSize: number; deviceId?: number; externalCode?: string; fromUtc?: string; toUtc?: string; sortBy: "occurredAtUtc" | "externalCode" | "deviceName" | "occurredAtDeviceLocal" | "pulledAtUtc"; sortDirection: SortDirection; }
export interface PullRunQuery { pageNumber: number; pageSize: number; deviceId?: number; status?: string; operationId?: string; sortBy: "startedAtUtc" | "finishedAtUtc" | "status"; sortDirection: SortDirection; }
export type AttendanceDevicePage = ManagementPageResponse<AttendanceDeviceListItem>;
export type RawUserPage = ManagementPageResponse<RawDeviceUser>;
export type RawPunchPage = ManagementPageResponse<RawPunch>;
export type PullRunPage = ManagementPageResponse<DevicePullRun>;
