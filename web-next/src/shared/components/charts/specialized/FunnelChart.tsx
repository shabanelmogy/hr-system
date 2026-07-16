import {
  ResponsiveContainer,
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  Cell,
} from "recharts";
import type { LabelProps } from "recharts";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getChartTheme } from "../core/chartTheme";
import {
  COLOR_PALETTES,
  formatNumber,
  formatPercentage,
  getColorPalette,
  resolveChartColors,
  type ChartColors,
} from "../core/chartUtils";
import ChartContainer from "../core/ChartContainer";
import type { ChartContainerProps } from "../core/ChartContainer";
import type { ChartData, ChartFormatter, ChartInteractionHandler, ChartTooltipProps } from "../core/types";
import { getChartNumber, getChartValue } from "../core/types";
import { useChartMotion } from "../core/useChartMotion";

interface FunnelDatum extends Record<string, unknown> {
  conversionRate: number;
}

export type FunnelChartProps = Omit<ChartContainerProps, "children"> & {
  data?: ChartData;
  colors?: ChartColors;
  showTooltip?: boolean;
  showLabels?: boolean;
  dataKey?: string;
  nameKey?: string;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onSegmentClick?: ChartInteractionHandler;
  labelPosition?: "center" | "insideStart" | "insideEnd" | "left" | "right";
};

const FunnelChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showTooltip = true,
  showLabels = true,
  loading = false,
  error,
  gradient = false,
  dataKey = "value",
  nameKey = "name",
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ""),
  onSegmentClick,
  labelPosition = "center", // 'center', 'insideStart', 'insideEnd'
  ...props
}: FunnelChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartTheme = getChartTheme(theme);
  const isAnimationActive = useChartMotion();

  const firstValue = data.length ? getChartNumber(data[0], dataKey) : 0;
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const resolvedPalette =
    colorPalette && colorPalette.length
      ? colorPalette
      : getColorPalette("primary", theme.palette.mode);

  // Calculate conversion rates
  const dataWithConversion: FunnelDatum[] = data.map((item, index) => {
    const base = firstValue;
    const conversionRate =
      base > 0 ? (index === 0 ? 100 : (getChartNumber(item, dataKey) / base) * 100) : 0;
    return {
      ...(item as Record<string, unknown>),
      conversionRate,
    };
  });

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const tooltipData = payload[0].payload;
    if (!tooltipData || typeof tooltipData !== "object") return null;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: "bold" }}>
          {formatLabel(getChartValue(tooltipData, nameKey))}
        </p>
        <p style={{ margin: "4px 0", color: payload[0].color }}>
          {t("chartCommon.value")}: {formatValue(getChartValue(tooltipData, dataKey))}
        </p>
        <p style={{ margin: "4px 0", color: payload[0].color }}>
          {t("chartCommon.conversion")}:{" "}
          {formatPercentage(
            Number(
              getChartValue(tooltipData, "conversionRate") ??
                (firstValue > 0
                  ? (getChartNumber(tooltipData, dataKey) / firstValue) * 100
                  : 0)
            )
          )}
        </p>
      </div>
    );
  };

  const renderCustomLabel = ({ viewBox, index }: LabelProps) => {
    if (!showLabels) return null;
    const base = firstValue;
    const item = index != null ? dataWithConversion[index] : undefined;
    const name = formatLabel(item ? getChartValue(item, nameKey) : "");
    const val = item ? getChartNumber(item, dataKey) : 0;
    const conv = base > 0 ? (index === 0 ? 100 : (val / base) * 100) : 0;
    const x = viewBox && "x" in viewBox ? Number(viewBox.x) : 0;
    const y = viewBox && "y" in viewBox ? Number(viewBox.y) : 0;
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

  const handleSegmentClick: ChartInteractionHandler = (segment, index) => {
    onSegmentClick?.(segment, index);
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsFunnelChart>
        <Funnel
          dataKey={dataKey}
          data={dataWithConversion}
          isAnimationActive={isAnimationActive}
          onClick={onSegmentClick ? (segment, index) => handleSegmentClick(segment, index) : undefined}
        >
          {dataWithConversion.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={resolvedPalette[index % resolvedPalette.length]}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
              role={onSegmentClick ? "button" : undefined}
              tabIndex={onSegmentClick ? 0 : undefined}
              aria-label={`${formatLabel(getChartValue(entry, nameKey))}: ${formatValue(getChartNumber(entry, dataKey))}`}
              onKeyDown={onSegmentClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSegmentClick(entry, index);
                }
              } : undefined}
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
        {showTooltip && <Tooltip content={CustomTooltip} />}
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
      dataCount={data.length}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default FunnelChart;
