import { permissions } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
export interface AttendancePermissions {
  canView: boolean;
  canCreateDevice: boolean;
  canEditDevice: boolean;
  canSetStatus: boolean;
  canEditCredentials: boolean;
  canCreateAgent: boolean;
  canDetect: boolean;
  canTest: boolean;
  canPullUsers: boolean;
  canPullAttendance: boolean;
  canViewRaw: boolean;
}
export const getAttendancePermissions = (claims: readonly string[], isReadOnly: boolean): AttendancePermissions => ({
  canView: hasPermission(claims, permissions.ViewAttendanceDevices),
  canCreateDevice: !isReadOnly && hasPermission(claims, permissions.CreateAttendanceDevices),
  canEditDevice: !isReadOnly && hasPermission(claims, permissions.EditAttendanceDevices),
  canSetStatus: !isReadOnly && hasPermission(claims, permissions.SetAttendanceDeviceStatus),
  canEditCredentials: !isReadOnly && hasPermission(claims, permissions.EditAttendanceDeviceCredentials),
  canCreateAgent: !isReadOnly && hasPermission(claims, permissions.CreateAttendanceAgents),
  canDetect: !isReadOnly && hasPermission(claims, permissions.DetectAttendanceDevices),
  canTest: !isReadOnly && hasPermission(claims, permissions.TestAttendanceDevices),
  canPullUsers: !isReadOnly && hasPermission(claims, permissions.PullAttendanceDeviceUsers),
  canPullAttendance: !isReadOnly && hasPermission(claims, permissions.PullAttendance),
  canViewRaw: hasPermission(claims, permissions.ViewRawAttendanceDevices),
});
