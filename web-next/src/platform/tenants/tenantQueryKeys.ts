import type { ManagementPageQuery } from "@/lib/api/pagination";

export const tenantKeys = {
  all: ["tenants"] as const,
  dashboardSummary: () => [...tenantKeys.all, "dashboard-summary"] as const,
  pages: () => [...tenantKeys.all, "page"] as const,
  page: (query: ManagementPageQuery) => [...tenantKeys.pages(), query] as const,
};
