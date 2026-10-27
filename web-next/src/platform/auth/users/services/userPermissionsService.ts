import { apiService } from "@/shared/services";
import { version } from "@/config/api/constants";
import type { ReplaceUserPermissions, UserCompanyPermissions } from "../types/userPermissions";
import { userCompanyPermissionsSchema } from "../validation/userPermissionsValidation";

const endpoint = (id: string) => `${version}/user-permissions/${encodeURIComponent(id)}`;
export async function getUserCompanyPermissions(userId: string, companyId: number): Promise<UserCompanyPermissions> {
  const response = userCompanyPermissionsSchema.parse(await apiService.get<unknown>(endpoint(userId)));
  if (response.userId !== userId || response.companyId !== companyId)
    throw new Error("Permission response scope mismatch.");
  return response;
}
export async function replaceUserCompanyPermissions(userId: string, request: ReplaceUserPermissions): Promise<void> {
  await apiService.put(endpoint(userId), request);
}
