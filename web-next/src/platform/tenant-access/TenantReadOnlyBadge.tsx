"use client";

import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import { Chip, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

export function TenantReadOnlyBadge({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();

  if (!isReadOnly) return null;

  const label = t("tenantAccess.readOnlyBadge");

  return (
    <Tooltip title={label} enterDelay={500}>
      <Chip
        aria-label={label}
        color="warning"
        icon={<LockClockRoundedIcon />}
        label={label}
        onClick={notifyBlockedAction}
        size="small"
        sx={{
          maxWidth: compact ? 96 : 150,
          height: 30,
          fontWeight: 800,
          "& .MuiChip-icon": {
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
