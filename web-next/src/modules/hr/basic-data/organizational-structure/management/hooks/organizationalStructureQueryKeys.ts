import type {
  OrganizationalResource,
  OrganizationalStructurePageQuery,
} from "../types/OrganizationalStructure";

export const organizationalStructureKeys = {
  all: ["organizational-structure"] as const,
  page: (query: OrganizationalStructurePageQuery) => [...organizationalStructureKeys.all, "page", query] as const,
  lookup: (resource: OrganizationalResource, parentId?: number) => [...organizationalStructureKeys.all, "lookup", resource, parentId ?? "all"] as const,
  changeLogs: (resource: OrganizationalResource, id: number) => [...organizationalStructureKeys.all, "changeLogs", resource, id] as const,
};
