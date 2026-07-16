import type { ReactNode } from "react";

import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PieChart, { type PieChartProps } from "./PieChart";
import { formatNumber } from "../core/chartUtils";
import { getChartNumber } from "../core/types";

export type DonutChartProps = PieChartProps & {
  centerContent?: ReactNode;
  showCenterValue?: boolean;
  centerLabel?: ReactNode;
};

const DonutChart = ({
  data = [],
  nameKey = "name",
  valueKey = "value",
  title,
  subtitle,
  height = 400,
  colors = "primary",
  showLegend = true,
  showTooltip = true,
  showLabels = false, // Usually false for donut charts
  loading = false,
  error,
  innerRadius = "45%",
  outerRadius = "75%",
  gradient = false,
  centerContent, // Custom content for center
  showCenterValue = true, // Show total value in center
  centerLabel,
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onSliceClick,
  ...props
}: DonutChartProps) => {
  const { t } = useTranslation();

  const total = data.reduce((sum, item) => sum + getChartNumber(item, valueKey), 0);

  const defaultCenterContent = showCenterValue ? (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>
        {centerLabel ?? t("chartCommon.total")}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "primary.main"
        }}>
        {formatValue(total)}
      </Typography>
    </Box>
  ) : null;

  return (
    <PieChart
        data={data}
        nameKey={nameKey}
        valueKey={valueKey}
        title={title}
        subtitle={subtitle}
        height={height}
        colors={colors}
        showLegend={showLegend}
        showTooltip={showTooltip}
        showLabels={showLabels}
        loading={loading}
        error={error}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        gradient={gradient}
        formatValue={formatValue}
        formatLabel={formatLabel}
        onSliceClick={onSliceClick}
        centerContent={centerContent || defaultCenterContent}
        {...props}
      />
  );
};

export default DonutChart;
