// basicDataConfig.tsx
import { appRoutes } from "@/routes/appRoutes";
import {
  NavigationColors,
  NavigationTitles,
  NavigationSectionId,
  UserRoles,
} from "../navigationTypes";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "../navigationUtils";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TuneIcon from "@mui/icons-material/Tune";
import Permissions from "@/constants/appPermissions";

export const getExtrasConfig = () => {
  const sectionIcon = createColoredIcon(
    <TuneIcon />,
    NavigationColors.PRIMARY_BLUE
  );
  const secondaryIcon = (icon: React.ReactElement) =>
    createColoredIcon(icon, NavigationColors.SECONDARY_BLUE);

  const extrasItems = [
    createNavItem(
      NavigationTitles.FILEMANAGER,
      secondaryIcon(<CloudDownloadIcon />),
      appRoutes.extras.filesManager,
      [UserRoles.ADMIN],
      undefined
    ),
    createNavItem(
      NavigationTitles.APPOINTMENTS,
      secondaryIcon(<EventNoteIcon />),
      appRoutes.extras.appointments,
      undefined,
      [Permissions.ViewUsers]
    ),
  ];

  return createNavSection(
    NavigationSectionId.EXTRAS,
    NavigationTitles.EXTRAS,
    sectionIcon,
    extrasItems
  );
};
