import type { ReactElement, ReactNode } from 'react';

import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { formatNumber, formatPercentage, resolveChartColors, type ChartColors } from './chartUtils';
import ChartContainer from './ChartContainer';
import type { ChartContainerProps } from './ChartContainer';
import type { ChartData, ChartFormatter, ChartInteractionHandler, ChartTooltipProps } from './types';
import { getChartNumber } from './types';

interface PieLabelData {
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
};

const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = 'primary' as ChartColors,
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  loading = false,
  error,
  innerRadius = 0, // Set > 0 for donut chart
  outerRadius = 120,
  startAngle = 90,
  endAngle = 450,
  gradient = false,
  labelLine = true,
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  formatPercent = (value, total) => formatPercentage((value / total) * 100),
  onSliceClick,
  customLabel,
  ...props
}: PieChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);

  const total = data.reduce((sum, item) => sum + getChartNumber(item, valueKey), 0);

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = formatPercent(Number(data.value) || 0, total);

    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(data.name)}</p>
        <p style={{ margin: '4px 0', color: data.color }}>
          Value: {formatValue(data.value)}
        </p>
        <p style={{ margin: '4px 0', color: data.color }}>
          Percentage: {percentage}
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
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
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
          onClick={handleSliceClick}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colorPalette[index % colorPalette.length]}
              stroke={theme.palette.background.paper}
              strokeWidth={2}
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

export default PieChart;
