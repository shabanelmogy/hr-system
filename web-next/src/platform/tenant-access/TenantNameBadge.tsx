"use client";

import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { ContextBadge } from "@/shared/components/layout";

export function TenantNameBadge({
  compact = false,
  iconOnly = false,
}: {
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const { t } = useTranslation();
  const { user } = useSession();
  const tenantName = user?.tenantName?.trim() ?? "";
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;

  if (!tenantName || isSuperAdmin) return null;

  return <ContextBadge
    compact={compact}
    icon={<ApartmentRoundedIcon />}
    iconOnly={iconOnly}
    label={t("auth.currentTenant")}
    tone="secondary"
    value={tenantName}
  />;
}
