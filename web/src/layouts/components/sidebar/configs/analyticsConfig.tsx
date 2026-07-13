// analyticsConfig.tsx
import AssessmentIcon from "@mui/icons-material/Assessment";
import { appRoutes } from "../../../../routes/appRoutes";
import { NavigationColors, NavigationTitles, NavigationSectionId } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getAnalyticsConfig = () => {
  const sectionIcon = createColoredIcon(<AssessmentIcon />, NavigationColors.ANALYTICS_GREEN);
  const itemIcon = createColoredIcon(<AssessmentIcon />, NavigationColors.LIGHT_ANALYTICS_GREEN);

  const analyticsItems = [
    createNavItem(NavigationTitles.ANALYTICS_DASHBOARD, itemIcon, appRoutes.analytics.mainDashboard),
    createNavItem(NavigationTitles.PERFORMANCE_ANALYTICS, itemIcon, appRoutes.analytics.performanceAnalytics),
    createNavItem(NavigationTitles.TIME_ATTENDANCE_ANALYTICS, itemIcon, appRoutes.analytics.timeAttendanceAnalytics),
    createNavItem(NavigationTitles.EMPLOYEE_ENGAGEMENT, itemIcon, appRoutes.analytics.employeeEngagement),
    createNavItem(NavigationTitles.DOCUMENT_ANALYTICS, itemIcon, appRoutes.analytics.documentAnalytics),
    createNavItem(NavigationTitles.CUSTOM_REPORTS, itemIcon, appRoutes.analytics.customReports),
    createNavItem(NavigationTitles.DATA_EXPORT, itemIcon, appRoutes.analytics.dataExport),
  ];

  return createNavSection(NavigationSectionId.ANALYTICS, NavigationTitles.ANALYTICS, sectionIcon, analyticsItems);
};