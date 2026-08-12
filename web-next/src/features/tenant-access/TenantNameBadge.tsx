"use client";

import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import { Chip, Tooltip, alpha } from "@mui/material";
import { useSession } from "@/lib/auth/SessionContext";

export function TenantNameBadge({ compact = false }: { compact?: boolean }) {
  const { user } = useSession();
  const tenantName = user?.tenantName?.trim() ?? "";
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  ) ?? false;

  if (!tenantName || isSuperAdmin) return null;

  return (
    <Tooltip title={tenantName} enterDelay={500}>
      <Chip
        aria-label={tenantName}
        icon={<ApartmentRoundedIcon />}
        label={tenantName}
        size="small"
        sx={(theme) => ({
          flexShrink: 1,
          maxWidth: compact ? 96 : 180,
          height: 30,
          color: theme.palette.text.primary,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.38)}`,
          fontWeight: 700,
          boxShadow: theme.shadows[2],
          "& .MuiChip-icon": {
            color: theme.palette.primary.main,
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
