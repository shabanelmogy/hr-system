import type { ElementType, ReactNode } from "react";
import {
  Add as AddIcon,
  BarChartOutlined as EmptyChartIcon,
  QueryStatsOutlined as ChartIcon,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import type { SvgIconProps, SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ChartContainer } from "../../charts";
import { FeedbackState } from "./FeedbackState";

export interface EmptyChartStateProps {
  title: ReactNode;
  message?: ReactNode;
  subtitle?: ReactNode;
  chartIcon?: ElementType<SvgIconProps>;
  emptyIcon?: ElementType<SvgIconProps>;
  height?: number;
  actionText?: string;
  onAction?: () => void;
  actions?: ReactNode;
  sx?: SxProps<Theme>;
}

export function EmptyChartState({
  title,
  message,
  subtitle,
  chartIcon: HeaderIcon = ChartIcon,
  emptyIcon: EmptyIcon = EmptyChartIcon,
  height = 400,
  actionText,
  onAction,
  actions,
  sx,
}: EmptyChartStateProps) {
  const { t } = useTranslation();
  const primaryAction =
    actionText && onAction ? (
      <Button variant="contained" onClick={onAction} startIcon={<AddIcon />}>
        {actionText}
      </Button>
    ) : null;

  return (
    <ChartContainer
      title={title}
      icon={HeaderIcon}
      height={height}
      actions={actions}
      sx={sx}
    >
      <FeedbackState
        icon={<EmptyIcon />}
        title={message ?? t("feedback.emptyChart.title")}
        description={subtitle ?? t("feedback.emptyChart.description")}
        actions={primaryAction}
        sx={{ height: "100%", minHeight: 0, py: 3 }}
      />
    </ChartContainer>
  );
}

export default EmptyChartState;
