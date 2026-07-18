import { Chip } from "@mui/material";
import { CircleAlert, CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HealthStatus } from "../types/healthCheck";

interface HealthStatusChipProps {
  status: HealthStatus;
}

const statusConfig = {
  Healthy: { color: "success", icon: CircleCheck },
  Degraded: { color: "warning", icon: TriangleAlert },
  Unhealthy: { color: "error", icon: CircleAlert },
  Unknown: { color: "default", icon: CircleHelp },
} as const;

export default function HealthStatusChip({ status }: HealthStatusChipProps) {
  const { t } = useTranslation();
  const { color, icon: Icon } = statusConfig[status];

  return (
    <Chip
      color={color}
      icon={<Icon size={16} />}
      label={t(`healthCheck.statuses.${status.toLowerCase()}`)}
      size="small"
      variant="outlined"
    />
  );
}
