import { getWorkforcePlanningConfig } from "./workforcePlanningConfig";
import { getRecruitmentConfig } from "./recruitmentConfig";
import { getAttendanceConfig } from "./attendanceConfig";
import { getOrganizationalStructureConfig } from "./organizationalStructureConfig";

export const hrNavigation = [
  getOrganizationalStructureConfig(),
  getWorkforcePlanningConfig(),
  getRecruitmentConfig(),
  getAttendanceConfig(),
];
