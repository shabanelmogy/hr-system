import { getBasicDataConfig } from "./basicDataConfig";
import { getWorkforcePlanningConfig } from "./workforcePlanningConfig";
import { getFinanceConfig } from "./financeConfig";
import { getRecruitmentConfig } from "./recruitmentConfig";
import { getAttendanceConfig } from "./attendanceConfig";
import { getExtrasConfig } from "./extrasConfig";
import { getUsersAndRolesConfig } from "./usersAndRolesConfig";
import { getAdvancedToolsConfig } from "./advancedToolsConfig";

export const hrNavigation = [getBasicDataConfig(), getWorkforcePlanningConfig(), getFinanceConfig(), getRecruitmentConfig(), getAttendanceConfig(), getExtrasConfig(), getUsersAndRolesConfig(), getAdvancedToolsConfig()];
