import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceDeviceService } from "../services/attendanceDeviceService";
import type { AttendanceDeviceQuery, CreateAttendanceAgentRequest, CreateAttendanceDeviceRequest, CreatedAttendanceAgent, DeviceTestResult, PullRunQuery, RawPunchQuery, RawUserQuery, UpdateAttendanceDeviceRequest, UpdateCredentialsRequest } from "../types/attendanceDevices";
export const attendanceDeviceKeys = { all: ["attendance-devices"] as const, page: (q: AttendanceDeviceQuery) => [...attendanceDeviceKeys.all, "page", q] as const, providers: () => [...attendanceDeviceKeys.all, "providers"] as const, branches: () => [...attendanceDeviceKeys.all, "branches"] as const, agents: () => [...attendanceDeviceKeys.all, "agents"] as const, health: () => [...attendanceDeviceKeys.all, "health"] as const, users: (q: RawUserQuery) => [...attendanceDeviceKeys.all, "users", q] as const, punches: (q: RawPunchQuery) => [...attendanceDeviceKeys.all, "punches", q] as const, runs: (q: PullRunQuery) => [...attendanceDeviceKeys.all, "runs", q] as const };
export const useAttendanceDevicePage = (query: AttendanceDeviceQuery) => useQuery({ queryKey: attendanceDeviceKeys.page(query), queryFn: () => attendanceDeviceService.getPage(query), placeholderData: (previous) => previous, staleTime: 30_000 });
export const useProviders = () => useQuery({ queryKey: attendanceDeviceKeys.providers(), queryFn: attendanceDeviceService.providers, staleTime: 300_000 });
export const useAttendanceBranches = () => useQuery({ queryKey: attendanceDeviceKeys.branches(), queryFn: attendanceDeviceService.branches, staleTime: 300_000 });
/** The agent heartbeat is the authoritative online state, so refresh it while this page is open. */
export const useAttendanceAgents = () => useQuery({
  queryKey: attendanceDeviceKeys.agents(),
  queryFn: attendanceDeviceService.agents,
  staleTime: 15_000,
  refetchInterval: 30_000,
});
export const useConnectorHealth = () => useQuery({ queryKey: attendanceDeviceKeys.health(), queryFn: attendanceDeviceService.health, staleTime: 30_000 });
export const useRawUsers = (query: RawUserQuery) => useQuery({ queryKey: attendanceDeviceKeys.users(query), queryFn: () => attendanceDeviceService.users(query), placeholderData: (previous) => previous });
export const useRawPunches = (query: RawPunchQuery) => useQuery({ queryKey: attendanceDeviceKeys.punches(query), queryFn: () => attendanceDeviceService.punches(query), placeholderData: (previous) => previous });
export const usePullRuns = (query: PullRunQuery) => useQuery({ queryKey: attendanceDeviceKeys.runs(query), queryFn: () => attendanceDeviceService.pullRuns(query), placeholderData: (previous) => previous });
export const useAttendanceMutation = <T, V>(fn: (value: V) => Promise<T>) => { const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: () => client.invalidateQueries({ queryKey: attendanceDeviceKeys.all }) }); };
export const useCreateDevice = () => useAttendanceMutation(attendanceDeviceService.create);
export const useCreateAttendanceAgent = () => useAttendanceMutation<CreatedAttendanceAgent, CreateAttendanceAgentRequest>(attendanceDeviceService.createAgent);
export const useUpdateDevice = () => useAttendanceMutation<unknown, { id: number; request: UpdateAttendanceDeviceRequest }>(({ id, request }) => attendanceDeviceService.update(id, request));
export const useSetDeviceEnabled = () => useAttendanceMutation<unknown, { id: number; enabled: boolean }>(({ id, enabled }) => attendanceDeviceService.setEnabled(id, enabled));
export const useCredentials = () => useAttendanceMutation<void, { id: number; request: UpdateCredentialsRequest }>(({ id, request }) => attendanceDeviceService.updateCredentials(id, request));
export const useTestDevice = () => useAttendanceMutation<DeviceTestResult, number>(attendanceDeviceService.test);
export const usePullUsers = () => useAttendanceMutation<unknown, number>(attendanceDeviceService.pullUsers);
export const usePullAttendance = () => useAttendanceMutation<unknown, { id: number; request: { fromUtc?: string; toUtc?: string } }>(({ id, request }) => attendanceDeviceService.pullAttendance(id, request));
