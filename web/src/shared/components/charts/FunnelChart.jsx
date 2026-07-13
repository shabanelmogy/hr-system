/* eslint-disable react/prop-types */
import {
  ResponsiveContainer,
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  Cell,
} from "recharts";
import { useTheme, Typography } from "@mui/material";
import { getChartTheme } from "./chartThemes";
import {
  COLOR_PALETTES,
  formatNumber,
  formatPercentage,
  getColorPalette,
} from "./chartUtils";
import ChartContainer from "./ChartContainer";

const FunnelChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showTooltip = true,
  showLabels = true,
  loading = false,
  error = null,
  gradient = false,
  dataKey = "value",
  nameKey = "name",
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onSegmentClick = null,
  labelPosition = "center", // 'center', 'insideStart', 'insideEnd'
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  const chartMargin = { top: 20, right: 30, left: 20, bottom: 5 };

  const firstValue = data && data.length ? Number(data[0][dataKey]) : 0;
  const colorPalette = Array.isArray(colors)
    ? colors
    : colors?.light || colors?.dark
    ? theme.palette.mode === "dark"
      ? colors.dark
      : colors.light
    : [];
  const resolvedPalette =
    colorPalette && colorPalette.length
      ? colorPalette
      : getColorPalette("primary", theme.palette.mode);

  // Calculate conversion rates
  const dataWithConversion = data.map((item, index) => {
    const base = firstValue;
    const conversionRate =
      base > 0 ? (index === 0 ? 100 : (Number(item[dataKey]) / base) * 100) : 0;
    return {
      ...item,
      conversionRate,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: "bold" }}>
          {formatLabel(data[nameKey])}
        </p>
        <p style={{ margin: "4px 0", color: payload[0].color }}>
          Value: {formatValue(data[dataKey])}
        </p>
        <p style={{ margin: "4px 0", color: payload[0].color }}>
          Conversion:{" "}
          {formatPercentage(
            Number(
              data.conversionRate ??
                (firstValue > 0
                  ? (Number(data[dataKey]) / firstValue) * 100
                  : 0)
            )
          )}
        </p>
      </div>
    );
  };

  const getContrastColor = (hex) => {
    if (!hex) return theme.palette.text.primary;
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // Perceived luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#111" : "#fff";
  };
  const getLuminance = (hex) => {
    if (!hex) return null;
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const renderCustomLabel = ({ x, y, index, payload }) => {
    if (!showLabels) return null;
    const base = firstValue;
    const item =
      Array.isArray(dataWithConversion) && index != null
        ? dataWithConversion[index]
        : payload || {};
    const name = formatLabel(item?.[nameKey] ?? "");
    const val = Number(item?.[dataKey] ?? 0);
    const conv = base > 0 ? (index === 0 ? 100 : (val / base) * 100) : 0;
    const anchor =
      labelPosition === "right"
        ? "start"
        : labelPosition === "left"
        ? "end"
        : "middle";
    const offset =
      labelPosition === "right" ? 30 : labelPosition === "left" ? 15 : 0;
    const textX =
      labelPosition === "right"
        ? Number(x) + offset
        : labelPosition === "left"
        ? Number(x) - offset
        : x;
    return (
      <text
        x={textX}
        y={Number(y) + 15}
        textAnchor={anchor}
        dominantBaseline="central"
        fill={
          theme.palette.mode === "dark"
            ? theme.palette.info.dark // 💙 أزرق فاتح في الوضع الداكن
            : theme.palette.text.primary // 💙 أزرق عادي في الوضع الفاتح
        }
        fontSize={theme.typography.pxToRem(12)}
        fontWeight={theme.typography.fontWeightBold}
        fontFamily={theme.typography.fontFamily}
      >
        {`${name} (${formatPercentage(conv)})`}
      </text>
    );
  };

  const handleSegmentClick = (data, index) => {
    if (onSegmentClick) {
      onSegmentClick(data, index);
    }
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart>
        <Funnel
          dataKey={dataKey}
          data={dataWithConversion}
          isAnimationActive
          onClick={handleSegmentClick}
          sx={{ border: "3px solid red" }}
        >
          {dataWithConversion.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={resolvedPalette[index % resolvedPalette.length]}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
            />
          ))}
          {showLabels && (
            <LabelList
              position={labelPosition}
              fill={theme.palette.text.primary}
              stroke="none"
              fontSize={12}
              fontFamily={theme.typography.fontFamily}
              content={renderCustomLabel}
            />
          )}
        </Funnel>
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default FunnelChart;
