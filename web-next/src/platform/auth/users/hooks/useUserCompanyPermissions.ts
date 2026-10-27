import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/SessionContext";
import { getUserCompanyPermissions, replaceUserCompanyPermissions } from "../services/userPermissionsService";
import type { ReplaceUserPermissions } from "../types/userPermissions";

export function useUserCompanyPermissions(userId: string, enabled: boolean) {
  const { user } = useSession();
  const cache = useQueryClient();
  const key = ["user-company-permissions", user?.tenantId, user?.companyId, user?.userId, userId] as const;
  const query = useQuery({
    queryKey: key,
    queryFn: () => getUserCompanyPermissions(userId, user!.companyId),
    enabled: enabled && Boolean(user),
  });
  const mutation = useMutation({
    mutationFn: (request: ReplaceUserPermissions) => replaceUserCompanyPermissions(userId, request),
    onSuccess: () => cache.invalidateQueries({ queryKey: key }),
  });
  return { query, mutation };
}
