import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type { AttendanceAgent, AttendanceBranch, AttendanceDeviceDetail, AttendanceDevicePage, AttendanceDeviceQuery, ConnectorHealth, CreateAttendanceAgentRequest, CreateAttendanceDeviceRequest, CreatedAttendanceAgent, DetectDeviceRequest, DetectDeviceResult, DeviceTestResult, ProviderCatalogItem, PullRunPage, PullRunQuery, RawPunchPage, RawPunchQuery, RawUserPage, RawUserQuery, StartPullRequest, UpdateAttendanceDeviceRequest, UpdateCredentialsRequest } from "../types/attendanceDevices";

const trim = (value: string) => value.trim();
export const toDeviceRequest = (request: CreateAttendanceDeviceRequest): CreateAttendanceDeviceRequest => ({ ...request, name: trim(request.name), host: trim(request.host), providerId: trim(request.providerId), timeZoneId: trim(request.timeZoneId) });
export const attendanceDeviceService = {
  getPage: (query: AttendanceDeviceQuery) => apiService.get<AttendanceDevicePage>(apiRoutes.attendanceDevices.page, { ...query }),
  getById: (id: number) => apiService.get<AttendanceDeviceDetail>(apiRoutes.attendanceDevices.getById(id)),
  create: (request: CreateAttendanceDeviceRequest) => apiService.post<AttendanceDeviceDetail>(apiRoutes.attendanceDevices.create, toDeviceRequest(request)),
  update: (id: number, request: UpdateAttendanceDeviceRequest) => apiService.put<AttendanceDeviceDetail>(apiRoutes.attendanceDevices.update(id), toDeviceRequest(request)),
  setEnabled: (id: number, enabled: boolean) => apiService.patch<AttendanceDeviceDetail>(apiRoutes.attendanceDevices.enabled(id), { enabled }),
  updateCredentials: (id: number, request: UpdateCredentialsRequest) => apiService.put<void>(apiRoutes.attendanceDevices.credentials(id), request),
  providers: () => apiService.get<ProviderCatalogItem[]>(apiRoutes.attendanceDevices.providers),
  branches: () => apiService.get<AttendanceBranch[]>(apiRoutes.attendanceDevices.branches),
  agents: () => apiService.get<AttendanceAgent[]>(apiRoutes.attendanceDevices.agents),
  createAgent: (request: CreateAttendanceAgentRequest) => apiService.post<CreatedAttendanceAgent>(apiRoutes.attendanceDevices.agents, { name: trim(request.name) }),
  health: () => apiService.get<ConnectorHealth>(apiRoutes.attendanceDevices.connectorHealth),
  detect: (request: DetectDeviceRequest) => apiService.post<DetectDeviceResult>(apiRoutes.attendanceDevices.detect, { host: trim(request.host), port: request.port }),
  test: (id: number) => apiService.post<DeviceTestResult>(apiRoutes.attendanceDevices.test(id)),
  pullUsers: (id: number) => apiService.post(apiRoutes.attendanceDevices.pullUsers(id), {}),
  pullAttendance: (id: number, request: StartPullRequest) => apiService.post(apiRoutes.attendanceDevices.pullAttendance(id), request),
  users: (query: RawUserQuery) => apiService.get<RawUserPage>(apiRoutes.attendanceDevices.users, { ...query }),
  punches: (query: RawPunchQuery) => apiService.get<RawPunchPage>(apiRoutes.attendanceDevices.punches, { ...query }),
  pullRuns: (query: PullRunQuery) => apiService.get<PullRunPage>(apiRoutes.attendanceDevices.pullRuns, { ...query }),
};
