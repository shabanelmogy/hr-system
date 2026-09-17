import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DatasetRoundedIcon from "@mui/icons-material/DatasetRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type {
  FrontendModuleDefinition,
  FrontendNavigationEntry,
} from "@/platform/modules";
import { hrNavigation } from "./navigation";

const definition: FrontendModuleDefinition = {
  navigation: hrNavigation,
  code: "hr",
  name: "HR",
  icon: <GroupsRoundedIcon />,
  tone: "primary",
  accentColor: "#6366F1",
  requiredDependencies: [],
  optionalDependencies: ["acc"],
  translationNamespace: "module-hr",
  loadTranslations: async (language) => (
    language === "ar"
      ? (await import("./locales/ar.json")).default
      : (await import("./locales/en.json")).default
  ),
  submodules: [
    {
      code: "basic-data",
      name: "Basic data",
      icon: <DatasetRoundedIcon />,
      tone: "info",
      requiredPermissions: [permissions.ViewOrganizationalStructure],
      entryCandidates: [appRoutes.modules.hr.organizationalStructure.index],
      navigation: [],
      routePrefixes: [appRoutes.modules.hr.organizationalStructure.index],
    },
    {
      code: "recruitment",
      name: "Recruitment",
      icon: <PersonSearchRoundedIcon />,
      tone: "secondary",
      requiredPermissions: [permissions.ViewRecruitment],
      entryCandidates: [appRoutes.modules.hr.recruitment],
      navigation: [],
      routePrefixes: [appRoutes.modules.hr.recruitment],
    },
    {
      code: "workforce",
      name: "Workforce planning",
      icon: <BadgeRoundedIcon />,
      tone: "primary",
      requiredPermissions: [
        permissions.ViewWorkforcePlans,
        permissions.ViewWorkforceBudgets,
        permissions.ViewPositionEnvelopes,
        permissions.ViewStaffingRequests,
        permissions.ViewEnvelopeAmendments,
        permissions.ViewWorkforceTrace,
      ],
      entryCandidates: [appRoutes.modules.hr.workforcePlanning.index],
      navigation: [],
      routePrefixes: [appRoutes.modules.hr.workforcePlanning.index],
    },
    {
      code: "attendance",
      name: "Attendance",
      icon: <FingerprintRoundedIcon />,
      tone: "warning",
      requiredPermissions: [permissions.ViewAttendanceDevices],
      entryCandidates: [appRoutes.modules.hr.attendanceDevices.index],
      navigation: [],
      routePrefixes: [appRoutes.modules.hr.attendanceDevices.index],
    },
  ],
};

// Project sidebar links into the server-owned HR submodules. This keeps the
// launcher, route guard and sidebar on the same ownership source.
export const hrModuleDefinition: FrontendModuleDefinition = {
  ...definition,
  submodules: definition.submodules.map((submodule) => ({
    ...submodule,
    navigation: hrNavigation.flatMap((section) => {
      const collect = (items: typeof section.items): FrontendNavigationEntry[] =>
        (items ?? []).flatMap((item) => [
          ...(item.path
            ? [{
              titleKey: item.title,
              path: item.path,
              requiredPermissions: item.permissions,
              requiredRoles: item.roles,
            }]
            : []),
          ...collect(item.items),
        ]);
      const entries = collect(section.items).filter((entry) => {
        const owner = definition.submodules
          .flatMap((candidate) => candidate.routePrefixes.map((prefix) => ({ candidate, prefix })))
          .filter(({ prefix }) => entry.path === prefix || entry.path.startsWith(`${prefix}/`))
          .sort((left, right) => right.prefix.length - left.prefix.length)[0]?.candidate;
        return owner?.code === submodule.code;
      });
      return entries.length
        ? [{ id: section.id, titleKey: section.title, entries }]
        : [];
    }),
  })),
};
