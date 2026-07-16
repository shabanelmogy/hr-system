import type { ReactElement, ReactNode } from 'react';

import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getChartTheme } from '../core/chartTheme';
import { formatNumber, formatPercentage, resolveChartColors, type ChartColors } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { ChartData, ChartFormatter, ChartInteractionHandler, ChartTooltipProps } from '../core/types';
import { getChartNumber } from '../core/types';
import { safePercentage } from '../core/numeric';
import { useChartMotion } from '../core/useChartMotion';

export interface PieLabelData {
  name?: unknown;
  value?: unknown;
  percent?: number;
}

export type PieChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: ChartData;
  nameKey?: string;
  valueKey?: string;
  colors?: ChartColors;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
  startAngle?: number;
  endAngle?: number;
  labelLine?: boolean;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  formatPercent?: (value: number, total: number) => string;
  onSliceClick?: ChartInteractionHandler;
  customLabel?: (data: PieLabelData) => ReactElement | string | number;
  centerContent?: ReactNode;
};

const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = 'primary',
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  loading = false,
  error,
  innerRadius = 0, // Set > 0 for donut chart
  outerRadius = '75%',
  startAngle = 90,
  endAngle = 450,
  gradient = false,
  labelLine = true,
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  formatPercent = (value, total) => formatPercentage(safePercentage(value, 0, total)),
  onSliceClick,
  customLabel,
  centerContent,
  ...props
}: PieChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const isAnimationActive = useChartMotion();

  const total = data.reduce((sum, item) => sum + getChartNumber(item, valueKey), 0);

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = formatPercent(Number(data.value) || 0, total);

    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(data.name)}</p>
        <p style={{ margin: '4px 0', color: data.color }}>
          {t('chartCommon.value')}: {formatValue(data.value)}
        </p>
        <p style={{ margin: '4px 0', color: data.color }}>
          {t('chartCommon.percentage')}: {percentage}
        </p>
      </div>
    );
  };

  const defaultLabel = ({ name, value, percent = 0 }: PieLabelData): ReactNode => {
    if (!showLabels) return '';
    if (customLabel) return customLabel({ name, value, percent });
    return `${formatLabel(name)} (${(percent * 100).toFixed(1)}%)`;
  };

  const handleSliceClick: ChartInteractionHandler = (data, index) => {
    onSliceClick?.(data, index);
  };

  const chartContent = (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart accessibilityLayer>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={labelLine}
          label={defaultLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="#8884d8"
          dataKey={valueKey}
          nameKey={nameKey}
          isAnimationActive={isAnimationActive}
          onClick={onSliceClick ? handleSliceClick : undefined}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colorPalette[index % colorPalette.length]}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
              role={onSliceClick ? 'button' : undefined}
              tabIndex={onSliceClick ? 0 : undefined}
              aria-label={`${formatLabel(data[index] ? (data[index] as Record<string, unknown>)[nameKey] : '')}: ${formatValue(data[index] ? getChartNumber(data[index], valueKey) : 0)}`}
              onKeyDown={onSliceClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSliceClick(data[index], index);
                }
              } : undefined}
            />
          ))}
        </Pie>
        
        {showTooltip && <Tooltip content={CustomTooltip} />}
        {showLegend && (
          <Legend 
            wrapperStyle={chartTheme.legend.wrapperStyle}
            formatter={(value) => formatLabel(value)}
          />
        )}
      </RechartsPieChart>
      </ResponsiveContainer>
      {centerContent}
    </Box>
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

export default PieChart;
