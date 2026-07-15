import type { ReactNode } from "react";

import { Box, Typography } from "@mui/material";
import PieChart, { type PieChartProps } from "./PieChart";
import { formatNumber, type ChartColors } from "./chartUtils";
import { getChartNumber } from "./types";

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
  colors = "primary" as ChartColors,
  showLegend = true,
  showTooltip = true,
  showLabels = false, // Usually false for donut charts
  loading = false,
  error,
  innerRadius = 60,
  outerRadius = 120,
  gradient = false,
  centerContent, // Custom content for center
  showCenterValue = true, // Show total value in center
  centerLabel = "Total",
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onSliceClick,
  ...props
}: DonutChartProps) => {

  const total = data.reduce((sum, item) => sum + getChartNumber(item, valueKey), 0);

  const defaultCenterContent = showCenterValue ? (
    <Box
      sx={{
        position: "absolute",
        top: "58%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>
        {centerLabel}
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
    <Box sx={{ position: "relative" }}>
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
        {...props}
      />
      {centerContent || defaultCenterContent}
    </Box>
  );
};

export default DonutChart;
