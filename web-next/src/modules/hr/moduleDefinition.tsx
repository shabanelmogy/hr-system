import { hrNavigation } from "./navigation";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import DatasetRoundedIcon from "@mui/icons-material/DatasetRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import type { FrontendModuleDefinition } from "@/platform/modules";

const definition: FrontendModuleDefinition = {
  navigation: hrNavigation,
  code: "hr",
  name: "HR",
  icon: <GroupsRoundedIcon />,
  tone: "primary",
  accentColor: "#6366F1",
  requiredDependencies: [],
  optionalDependencies: [],
  translationNamespace: "module-hr",
  loadTranslations: async (language) => (
    language === "ar"
      ? (await import("./locales/ar.json")).default
      : (await import("./locales/en.json")).default
  ),
  submodules: [
    {
      code: "analytics",
      name: "Analytics",
      icon: <AnalyticsRoundedIcon />,
      tone: "success",
      requiredPermissions: [
        permissions.ViewChangeLogs,
        permissions.ViewHangfireDashboard,
        permissions.ViewCrystalReports,
        permissions.ManageCrystalReportAccess,
      ],
      entryCandidates: [
        appRoutes.kpis,
        appRoutes.trends,
        appRoutes.healthPipeline,
        appRoutes.attendanceTrends,
        appRoutes.auth.crystalReportsPage,
        appRoutes.advancedTools.trackChanges,
        appRoutes.advancedTools.hangfireDashboard,
      ],
      navigation: [],
      routePrefixes: [
        appRoutes.attendanceTrends,
        appRoutes.kpis,
        appRoutes.trends,
        appRoutes.healthPipeline,
        appRoutes.auth.crystalReportsPage,
        appRoutes.advancedTools.trackChanges,
        appRoutes.advancedTools.hangfireDashboard,
      ],
    },
    {
      code: "basic-data",
      name: "Basic data",
      icon: <DatasetRoundedIcon />,
      tone: "info",
      requiredPermissions: [
        permissions.ViewAddressTypes,
        permissions.ViewCompanyGeographicScope,
        permissions.ViewOrganizationalStructure,
        permissions.ViewLocalizations,
      ],
      entryCandidates: [appRoutes.basicData.index],
      navigation: [],
      routePrefixes: [appRoutes.advancedTools.localizationApi, appRoutes.basicData.index],
    },
    {
      code: "recruitment",
      name: "Recruitment",
      icon: <PersonSearchRoundedIcon />,
      tone: "secondary",
      requiredPermissions: [permissions.ViewRecruitment],
      entryCandidates: [appRoutes.recruitment],
      navigation: [],
      routePrefixes: [appRoutes.recruitment],
    },
    {
      code: "workforce",
      name: "Workforce planning",
      icon: <BadgeRoundedIcon />,
      tone: "primary",
      requiredPermissions: [
        permissions.ViewFiscalYears,
        permissions.ViewWorkforcePlans,
        permissions.ViewWorkforceBudgets,
        permissions.ViewPositionEnvelopes,
        permissions.ViewStaffingRequests,
        permissions.ViewEnvelopeAmendments,
        permissions.ViewWorkforceTrace,
      ],
      entryCandidates: [appRoutes.workforcePlanning.index, appRoutes.finance.fiscalYears],
      navigation: [],
      routePrefixes: [appRoutes.workforcePlanning.index, appRoutes.finance.fiscalYears],
    },
    {
      code: "attendance",
      name: "Attendance",
      icon: <FingerprintRoundedIcon />,
      tone: "warning",
      requiredPermissions: [permissions.ViewAttendanceDevices],
      entryCandidates: [appRoutes.attendanceDevices.index],
      navigation: [],
      routePrefixes: [appRoutes.attendanceDevices.index, "/attendance"],
    },
    {
      code: "administration",
      name: "Administration",
      icon: <AdminPanelSettingsRoundedIcon />,
      tone: "error",
      requiredPermissions: [
        permissions.ViewRoles,
        permissions.ViewUsers,
        permissions.ManageOfflineOperations,
      ],
      entryCandidates: [
        appRoutes.auth.rolesPage,
        appRoutes.auth.usersPage,
        appRoutes.auth.invitationsPage,
        appRoutes.auth.offlineOperationsPage,
        appRoutes.advancedTools.healthCheck,
        appRoutes.advancedTools.apiEndpoints,
        appRoutes.extras.filesManager,
        appRoutes.extras.appointments,
      ],
      navigation: [],
      routePrefixes: ["/administration", "/advanced-tools", appRoutes.extras.filesManager, appRoutes.extras.appointments],
    },
    {
      code: "collaboration",
      name: "Collaboration",
      icon: <ForumRoundedIcon />,
      tone: "info",
      requiredPermissions: [],
      entryCandidates: [],
      navigation: [],
      routePrefixes: [],
    },
  ],
};

// Section links, their permissions and titles have one source. Submodule
// navigation is projected by the same most-specific route ownership rule.
export const hrModuleDefinition: FrontendModuleDefinition = {
  ...definition,
  submodules: definition.submodules.map(submodule => ({
    ...submodule,
    navigation: hrNavigation.flatMap(section => {
      const collect = (items: typeof section.items): import("@/platform/modules").FrontendNavigationEntry[] => (items ?? []).flatMap(item => [
        ...(item.path ? [{ titleKey: item.title, path: item.path, requiredPermissions: item.permissions, requiredRoles: item.roles }] : []),
        ...collect(item.items),
      ]);
      const entries = collect(section.items).filter(entry => {
        const owner = definition.submodules.flatMap(candidate => candidate.routePrefixes.map(prefix => ({ candidate, prefix })))
          .filter(({ prefix }) => entry.path === prefix || entry.path.startsWith(prefix + "/"))
          .sort((left, right) => right.prefix.length - left.prefix.length)[0]?.candidate;
        return owner?.code === submodule.code;
      });
      return entries.length ? [{ id: section.id, titleKey: section.title, entries }] : [];
    }),
  })),
};
