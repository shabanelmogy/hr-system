// Supporting product tools. Authorization mirrors route-access.ts until
// dedicated business permissions are introduced for files and appointments.
import { appRoutes } from "@/config/routes";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TuneIcon from "@mui/icons-material/Tune";
import { permissions } from "@/lib/auth/permissions";

export const getExtrasConfig = () => {
  const sectionIcon = createColoredIcon(
    <TuneIcon />,
    "#4a6da7"
  );
  const secondaryIcon = (icon: React.ReactElement) =>
    createColoredIcon(icon, "#5c7cbc");

  const extrasItems = [
    createNavItem(
      "menu.filemanager",
      secondaryIcon(<CloudDownloadIcon />),
      appRoutes.extras.filesManager,
      ["admin"],
      undefined
    ),
    createNavItem(
      "menu.appointments",
      secondaryIcon(<EventNoteIcon />),
      appRoutes.extras.appointments,
      undefined,
      [permissions.ViewUsers]
    ),
  ];

  return createNavSection(
    "extras",
    "menu.extras",
    sectionIcon,
    extrasItems
  );
};
