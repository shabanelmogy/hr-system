import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "@/shared/components/layout/navigation";
export const getAttendanceConfig = () => createNavSection(
  "hrManagement",
  "attendanceDevices.title",
  createColoredIcon(<FingerprintRoundedIcon />, "hr"),
  [
    createNavItem("attendanceDevices.devices", createColoredIcon(<FingerprintRoundedIcon />, "hr"), appRoutes.modules.hr.attendanceDevices.index, undefined, [permissions.ViewAttendanceDevices]),
  ],
  undefined,
  [permissions.ViewAttendanceDevices],
);
