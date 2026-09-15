import type { AttendanceDeviceQuery } from "../types/attendanceDevices";
export const toAttendanceDeviceQuery = (state: { page: number; pageSize: number }, search: string): AttendanceDeviceQuery => ({ pageNumber: state.page + 1, pageSize: state.pageSize, search: search.trim() || undefined });
export const clearSelectionOnDeviceChange = <T extends { id: number }>(current: T | null, next: T | null): boolean => current?.id !== next?.id;
