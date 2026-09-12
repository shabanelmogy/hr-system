import type { ServerListState } from "@/shared/hooks/useServerListState";
import type { AttendanceDeviceQuery, AttendanceDeviceSort } from "../types/attendanceDevices";
export const toAttendanceDeviceQuery = (state: Pick<ServerListState<AttendanceDeviceSort, Record<string, never>>, "page" | "pageSize" | "columnName" | "sortDirection">, search: string): AttendanceDeviceQuery => ({ pageNumber: state.page + 1, pageSize: state.pageSize, search: search.trim() || undefined, sortBy: state.columnName, sortDirection: state.sortDirection.toLowerCase() as "asc" | "desc" });
export const clearSelectionOnDeviceChange = <T extends { id: number }>(current: T | null, next: T | null): boolean => current?.id !== next?.id;
