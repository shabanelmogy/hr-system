import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

import { AppChip, type ColorKey } from "@/shared/components/cards";
import type { SubscriptionStatus } from "../types";

/**
 * Subscription status color. "Active" is the normal state, so it takes the palette primary
 * (a fixed status green looked foreign next to the orange, blue and monochrome palettes);
 * the other states keep their status colors. `null` means neutral.
 */
export function getTenantStatusColor(status: SubscriptionStatus): ColorKey | null {
  if (status === "active") return "primary";
  if (status === "trial") return "info";
  if (status === "pastDue") return "warning";
  if (status === "suspended" || status === "expired" || status === "cancelled") return "error";
  return null;
}

/** Tinted subscription status chip (card badge, grid cell, dashboard list). */
export function TenantSubscriptionChip({ status }: { status: SubscriptionStatus }) {
  const { t } = useTranslation();
  const label = t(`tenantManagement.statuses.${status}`);
  const color = getTenantStatusColor(status);
  return color
    ? <AppChip size="small" bold hoverScale={false} colorKey={color} label={label} />
    : <Chip size="small" label={label} />;
}

/** Enabled/disabled access chip. */
export function TenantAccessChip({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation();
  return isActive
    ? <AppChip size="small" variant="outlined" hoverScale={false} colorKey="primary" label={t("tenantManagement.enabled")} />
    : <Chip size="small" variant="outlined" label={t("tenantManagement.disabled")} />;
}
