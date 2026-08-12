"use client";

import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { Chip, Tooltip, alpha } from "@mui/material";
import { useSession } from "@/lib/auth/SessionContext";

export function TenantPlanBadge({ compact = false }: { compact?: boolean }) {
  const { user } = useSession();
  const planName = user?.tenantPlanName?.trim() ?? "";
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;

  if (!planName || isSuperAdmin) return null;

  return (
    <Tooltip title={planName} enterDelay={500}>
      <Chip
        aria-label={planName}
        icon={<WorkspacePremiumRoundedIcon />}
        label={planName}
        size="small"
        sx={(theme) => ({
          maxWidth: compact ? 96 : 150,
          height: 30,
          color: theme.palette.text.primary,
          bgcolor: alpha(theme.palette.warning.main, 0.12),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.48)}`,
          fontWeight: 800,
          boxShadow: theme.shadows[1],
          "& .MuiChip-icon": {
            color: theme.palette.warning.dark,
            marginInlineStart: "7px",
            marginInlineEnd: "-3px",
          },
          "& .MuiChip-label": {
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        })}
      />
    </Tooltip>
  );
}
