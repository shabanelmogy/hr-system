// chatConfig.tsx
import ChatIcon from '@mui/icons-material/Chat';
import { appRoutes } from "../../../../routes/appRoutes";
import { NavigationColors, NavigationTitles, NavigationSectionId } from "../navigationTypes";
import { createColoredIcon, createNavItem, createNavSection } from "../navigationUtils";

export const getChatConfig = () => {
  const sectionIcon = createColoredIcon(<ChatIcon />, NavigationColors.GREEN);
  const itemIcon = createColoredIcon(<ChatIcon />, NavigationColors.LIGHT_GREEN);

  const chatItems = [
    createNavItem(NavigationTitles.CHAT_INTERFACE, itemIcon, appRoutes.chat),
  ];

  return createNavSection(NavigationSectionId.CHAT, NavigationTitles.CHAT, sectionIcon, chatItems);
};