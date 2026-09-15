import { apiRoutes } from "@/config";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";
import { apiService } from "@/shared/services";
import type { User } from "../types";
import { parseUsersPageResponse } from "../utils/apiResponse";

export const userPageKeys = {
  all: ["users"] as const,
  page: (query: ManagementPageQuery) => [...userPageKeys.all, "page", query] as const,
};

export async function getUsersPage(
  query: ManagementPageQuery,
): Promise<ManagementPageResponse<User>> {
  const response = await apiService.get<unknown>(apiRoutes.users.getPage, { ...query });
  return parseUsersPageResponse(response);
}
