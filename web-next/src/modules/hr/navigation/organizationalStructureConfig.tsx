import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

export const getOrganizationalStructureConfig = () => createNavSection(
  "organizationalStructure",
  "menu.organizationalStructure",
  createColoredIcon(<AccountTreeRoundedIcon />, "hr"),
  [
    createNavItem(
      "menu.organizationalStructure",
      createColoredIcon(<AccountTreeRoundedIcon />, "hr"),
      appRoutes.modules.hr.organizationalStructure.index,
      undefined,
      [permissions.ViewOrganizationalStructure],
    ),
  ],
  undefined,
  [permissions.ViewOrganizationalStructure],
);
