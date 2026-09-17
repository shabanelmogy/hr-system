import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";
import {
  createColoredIcon,
  createNavItem,
  createNavSection,
} from "@/shared/components/layout/navigation";

const navigation = createNavSection(
  "crm",
  "menu.appointments",
  createColoredIcon(<HandshakeRoundedIcon />, "#7c3aed"),
  [
    createNavItem(
      "menu.appointments",
      createColoredIcon(<EventNoteRoundedIcon />, "#8b5cf6"),
      appRoutes.modules.crm.appointments,
      undefined,
      [permissions.ViewAppointments],
    ),
  ],
  undefined,
  [permissions.ViewAppointments],
);

export const crmModuleDefinition: FrontendModuleDefinition = {
  navigation: [navigation],
  code: "crm",
  name: "CRM",
  icon: <HandshakeRoundedIcon />,
  tone: "secondary",
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: "appointments",
    name: "Appointments",
    icon: <EventNoteRoundedIcon />,
    tone: "secondary",
    requiredPermissions: [permissions.ViewAppointments],
    entryCandidates: [appRoutes.modules.crm.appointments],
    navigation: [{
      id: navigation.id,
      titleKey: navigation.title,
      entries: [{
        titleKey: "menu.appointments",
        path: appRoutes.modules.crm.appointments,
        requiredPermissions: [permissions.ViewAppointments],
      }],
    }],
    routePrefixes: [appRoutes.modules.crm.appointments],
  }],
};
