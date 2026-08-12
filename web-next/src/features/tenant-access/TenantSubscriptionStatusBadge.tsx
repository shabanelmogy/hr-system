"use client";

import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import { Chip, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";

type SubscriptionStatusKey =
  | "free"
  | "trial"
  | "active"
  | "pastDue"
  | "suspended"
  | "expired"
  | "cancelled";

type StatusColor = "default" | "primary" | "success" | "warning" | "error" | "info";

const statusAliases: Record<string, SubscriptionStatusKey> = {
  free: "free",
  trial: "trial",
  active: "active",
  pastdue: "pastDue",
  suspended: "suspended",
  expired: "expired",
  cancelled: "cancelled",
  canceled: "cancelled",
};

const statusColors: Record<SubscriptionStatusKey, StatusColor> = {
  free: "primary",
  trial: "info",
  active: "success",
  pastDue: "warning",
  suspended: "error",
  expired: "error",
  cancelled: "default",
};

export function TenantSubscriptionStatusBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { user } = useSession();
  const rawStatus = user?.tenantSubscriptionStatus?.trim() ?? "";
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;

  if (!rawStatus || isSuperAdmin) return null;

  const statusKey = statusAliases[rawStatus.replace(/[\s_-]/g, "").toLowerCase()];
  const label = statusKey ? t(`tenantManagement.statuses.${statusKey}`) : rawStatus;

  return (
    <Tooltip title={label} enterDelay={500}>
      <Chip
        aria-label={label}
        color={statusKey ? statusColors[statusKey] : "default"}
        icon={<CircleRoundedIcon />}
        label={label}
        size="small"
        variant="outlined"
        sx={{
          maxWidth: compact ? 96 : 150,
          height: 30,
          fontWeight: 800,
          bgcolor: "background.paper",
          "& .MuiChip-icon": {
            fontSize: 10,
            marginInlineStart: "7px",
            marginInlineEnd: "-3px",
          },
          "& .MuiChip-label": {
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      />
    </Tooltip>
  );
}
