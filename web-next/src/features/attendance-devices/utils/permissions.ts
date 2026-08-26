import { permissions } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
export interface AttendancePermissions { canView: boolean; canManage: boolean; canCredentials: boolean; canPull: boolean; canViewRaw: boolean; }
export const getAttendancePermissions = (claims: readonly string[], isReadOnly: boolean): AttendancePermissions => ({
  canView: hasPermission(claims, permissions.ViewAttendanceDevices),
  canManage: !isReadOnly && hasPermission(claims, permissions.ManageAttendanceDevices),
  canCredentials: !isReadOnly && hasPermission(claims, permissions.ManageAttendanceDeviceCredentials),
  canPull: !isReadOnly && hasPermission(claims, permissions.PullAttendanceDevices),
  canViewRaw: hasPermission(claims, permissions.ViewAttendanceDeviceRaw),
});
