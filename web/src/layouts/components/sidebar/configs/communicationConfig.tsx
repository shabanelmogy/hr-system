// communicationConfig.tsx
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { appRoutes } from "../../../../routes/appRoutes";
import { NavigationColors, NavigationTitles, NavigationSectionId } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getCommunicationConfig = () => {
  const sectionIcon = createColoredIcon(<ChatIcon />, NavigationColors.COMMUNICATION_PURPLE);
  const itemIcon = createColoredIcon(<ChatIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE);

  const communicationItems = [
    createNavItem(NavigationTitles.MESSAGING, itemIcon, appRoutes.communication.messaging),
    createNavItem(NavigationTitles.ANNOUNCEMENTS, createColoredIcon(<NotificationsIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE), appRoutes.communication.announcements),
    createNavItem(NavigationTitles.FEEDBACK, createColoredIcon(<AssessmentIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE), appRoutes.communication.feedback),
    createNavItem(NavigationTitles.COMMUNICATION_DASHBOARD, createColoredIcon(<AssessmentIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE), appRoutes.communication.dashboard),
    createNavItem(NavigationTitles.NOTIFICATIONS, createColoredIcon(<NotificationsIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE), appRoutes.communication.notifications),
    createNavItem(NavigationTitles.COMMUNICATION_REPORTS, createColoredIcon(<AssessmentIcon />, NavigationColors.LIGHT_COMMUNICATION_PURPLE), appRoutes.communication.reports),
  ];

  return createNavSection(NavigationSectionId.COMMUNICATION, NavigationTitles.COMMUNICATION, sectionIcon, communicationItems);
};