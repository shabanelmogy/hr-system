// Application route definitions with TypeScript support.
import type { Route } from "next";

export type AppPath = Route;

const toAppPath = (path: string): AppPath => path as AppPath;

export const normalizeAppPath = (path: string): AppPath =>
  toAppPath(`/${path.replace(/^\/+/, "")}`);

export interface AuthenticationRoutes {
  login: AppPath;
  register: AppPath;
  resendEmailConfirmation: AppPath;
  emailConfirmed: AppPath;
  forgetPassword: AppPath;
  resetPassword: AppPath;
  acceptInvitation: AppPath;
  changePassword: AppPath;
}

export interface ShellRoutes {
  home: AppPath;
  basicData: AppPath;
  routeUnavailable: AppPath;
}

export interface PlatformRoutes {
  apps: {
    index: AppPath;
    module: (moduleCode: string) => AppPath;
    submodule: (moduleCode: string, submoduleCode: string) => AppPath;
  };
  profile: AppPath;
  files: {
    manager: AppPath;
    mediaViewer: (
      id: string,
      fileExtension: string,
      storedFileName: string,
      fileName: string,
    ) => AppPath;
  };
  advancedTools: {
    healthCheck: AppPath;
    apiEndpoints: AppPath;
    localizationApi: AppPath;
    hangfireDashboard: AppPath;
  };
  administration: {
    roles: AppPath;
    users: AppPath;
    invitations: AppPath;
    offlineOperations: AppPath;
    rolePermissions: (id: string) => AppPath;
  };
  superAdmin: {
    dashboard: AppPath;
    tenants: AppPath;
    tenantAdmins: AppPath;
  };
  companyGeographicScope: AppPath;
}

export interface OrganizationalStructureRoutes {
  index: AppPath;
  branches: AppPath;
  departments: AppPath;
  divisions: AppPath;
  jobTitles: AppPath;
  jobLevels: AppPath;
  positions: AppPath;
  jobDescriptions: AppPath;
  costCenters: AppPath;
  currencies: AppPath;
  manage: AppPath;
}

export interface WorkforcePlanningRoutes {
  index: AppPath;
  plans: AppPath;
  budgets: AppPath;
  positionEnvelopes: AppPath;
  staffingRequests: AppPath;
  envelopeAmendments: AppPath;
  trace: AppPath;
}

export interface ModuleRoutes {
  hr: {
    organizationalStructure: OrganizationalStructureRoutes;
    attendanceDevices: {
      index: AppPath;
      users: AppPath;
      punches: AppPath;
      pullRuns: AppPath;
    };
    recruitment: AppPath;
    workforcePlanning: WorkforcePlanningRoutes;
  };
  accounting: {
    fiscalYears: AppPath;
  };
  crm: {
    appointments: AppPath;
  };
  referenceData: {
    addressTypes: AppPath;
    geography: {
      countries: AppPath;
      states: AppPath;
      districts: AppPath;
    };
  };
  reporting: {
    crystalReports: AppPath;
  };
}

export interface AppRoutes {
  auth: AuthenticationRoutes;
  shell: ShellRoutes;
  platform: PlatformRoutes;
  modules: ModuleRoutes;
}

export const appRoutes: AppRoutes = {
  auth: {
    login: "/login",
    register: "/register",
    resendEmailConfirmation: "/resend-email-confirmation",
    emailConfirmed: "/confirm-email",
    forgetPassword: "/forget-password",
    resetPassword: "/reset-password",
    acceptInvitation: "/accept-invitation",
    changePassword: "/change-password",
  },

  shell: {
    home: "/",
    basicData: toAppPath("/basic-data"),
    routeUnavailable: toAppPath("/route-unavailable"),
  },

  platform: {
    apps: {
      index: toAppPath("/apps"),
      module: (moduleCode) => toAppPath(`/apps/${moduleCode}`),
      submodule: (moduleCode, submoduleCode) =>
        toAppPath(`/apps/${moduleCode}/${submoduleCode}`),
    },
    profile: "/profile",
    files: {
      manager: "/files",
      mediaViewer: (id, fileExtension, storedFileName, fileName) =>
        toAppPath(`/files/view/${id}/${fileExtension}/${storedFileName}/${fileName}`),
    },
    advancedTools: {
      healthCheck: "/advanced-tools/health-check",
      apiEndpoints: "/advanced-tools/api-endpoints",
      localizationApi: "/advanced-tools/localization-api",
      hangfireDashboard: "/advanced-tools/hangfire-dashboard",
    },
    administration: {
      roles: "/administration/roles",
      users: "/administration/users",
      invitations: toAppPath("/administration/invitations"),
      offlineOperations: toAppPath("/administration/offline-operations"),
      rolePermissions: (id) =>
        toAppPath(`/administration/manage-role-permissions/${id}`),
    },
    superAdmin: {
      dashboard: "/super-admin",
      tenants: "/super-admin/tenants",
      tenantAdmins: "/super-admin/tenant-admins",
    },
    companyGeographicScope: toAppPath(
      "/basic-data/organizational-structure/geographic-scope",
    ),
  },

  modules: {
    hr: {
      organizationalStructure: {
        index: toAppPath("/basic-data/organizational-structure"),
        branches: toAppPath("/basic-data/organizational-structure/branches"),
        departments: toAppPath("/basic-data/organizational-structure/departments"),
        divisions: toAppPath("/basic-data/organizational-structure/divisions"),
        jobTitles: toAppPath("/basic-data/organizational-structure/job-titles"),
        jobLevels: toAppPath("/basic-data/organizational-structure/job-levels"),
        positions: toAppPath("/basic-data/organizational-structure/positions"),
        jobDescriptions: toAppPath(
          "/basic-data/organizational-structure/job-descriptions",
        ),
        costCenters: toAppPath("/basic-data/organizational-structure/cost-centers"),
        currencies: toAppPath("/basic-data/organizational-structure/currencies"),
        manage: toAppPath("/basic-data/organizational-structure/manage"),
      },
      attendanceDevices: {
        index: toAppPath("/attendance-devices"),
        users: toAppPath("/attendance-devices/users"),
        punches: toAppPath("/attendance-devices/punches"),
        pullRuns: toAppPath("/attendance-devices/pull-runs"),
      },
      recruitment: toAppPath("/recruitment"),
      workforcePlanning: {
        index: toAppPath("/workforce-planning"),
        plans: toAppPath("/workforce-planning/plans"),
        budgets: toAppPath("/workforce-planning/budgets"),
        positionEnvelopes: toAppPath("/workforce-planning/position-envelopes"),
        staffingRequests: toAppPath("/workforce-planning/staffing-requests"),
        envelopeAmendments: toAppPath("/workforce-planning/envelope-amendments"),
        trace: toAppPath("/workforce-planning/trace"),
      },
    },
    accounting: {
      fiscalYears: toAppPath("/finance/fiscal-years"),
    },
    crm: {
      appointments: "/appointments",
    },
    referenceData: {
      addressTypes: "/basic-data/address-types",
      geography: {
        countries: toAppPath("/super-admin/geography/countries"),
        states: toAppPath("/super-admin/geography/states"),
        districts: toAppPath("/super-admin/geography/districts"),
      },
    },
    reporting: {
      crystalReports: toAppPath("/administration/crystal-reports"),
    },
  },
} as const;

export type RouteKey = keyof AppRoutes;
export type RouteValue = AppRoutes[RouteKey];

export default appRoutes;
