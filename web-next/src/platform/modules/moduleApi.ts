import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type { ErpModule } from "./types";

export const moduleKeys = {
  all: ["modules"] as const,
  accessible: () => [...moduleKeys.all, "accessible"] as const,
  installed: () => [...moduleKeys.all, "installed"] as const,
};

export const moduleApi = {
  getAccessible: () => apiService.get<ErpModule[]>(apiRoutes.modules.accessible),
  getInstalled: () => apiService.get<ErpModule[]>(apiRoutes.modules.installed),
};
