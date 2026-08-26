import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";
import { NavigationColors, NavigationSectionId } from "../navigationTypes";

export const getAttendanceConfig = () => createNavSection(
  NavigationSectionId.HR_MANAGEMENT,
  "attendanceDevices.title",
  createColoredIcon(<FingerprintRoundedIcon />, NavigationColors.GREEN),
  [
    createNavItem("attendanceDevices.devices", createColoredIcon(<FingerprintRoundedIcon />, NavigationColors.LIGHT_GREEN), appRoutes.attendanceDevices.index, undefined, [permissions.ViewAttendanceDevices]),
  ],
  undefined,
  [permissions.ViewAttendanceDevices],
);
