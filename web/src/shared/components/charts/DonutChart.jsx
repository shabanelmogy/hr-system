/* eslint-disable react/prop-types */
import { Box, Typography, useTheme } from "@mui/material";
import PieChart from "./PieChart";
import { formatNumber } from "./chartUtils";

const DonutChart = ({
  data = [],
  nameKey = "name",
  valueKey = "value",
  title,
  subtitle,
  height = 400,
  colors,
  showLegend = true,
  showTooltip = true,
  showLabels = false, // Usually false for donut charts
  loading = false,
  error = null,
  innerRadius = 60,
  outerRadius = 120,
  gradient = false,
  centerContent = null, // Custom content for center
  showCenterValue = true, // Show total value in center
  centerLabel = "Total",
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onSliceClick = null,
  ...props
}) => {
  const theme = useTheme();

  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

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
      <Typography variant="body2" color="text.secondary">
        {centerLabel}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="primary.main">
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
