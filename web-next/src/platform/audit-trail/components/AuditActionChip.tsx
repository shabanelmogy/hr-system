"use client";

import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { AuditAction } from "../types/auditTrail";
import { actionColors, actionLabel } from "./auditTrailFormat";

export function AuditActionChip({ action }: { action: AuditAction }) {
  const { t } = useTranslation();
  return (
    <Chip
      color={actionColors[action]}
      label={actionLabel(t, action)}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600, minWidth: 84 }}
    />
  );
}
