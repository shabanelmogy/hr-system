import { ResponsiveContainer, ComposedChart as RechartsComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from '../core/chartTheme';
import { COLOR_PALETTES, formatNumber, resolveChartColors } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { CartesianChartProps, ChartInteractionHandler, ChartTooltipProps } from '../core/types';
import { useChartMotion } from '../core/useChartMotion';

export interface ComposedSeries {
  type: 'bar' | 'line' | 'area';
  key: string;
  name?: string;
  color?: string;
  yAxisId?: 'left' | 'right' | string;
  barSize?: number;
  strokeWidth?: number;
  fillOpacity?: number;
}

export type ComposedChartProps = Omit<CartesianChartProps, 'multiSeries' | 'yKey'> &
  Omit<ChartContainerProps, keyof CartesianChartProps | 'children'> & {
    series?: readonly ComposedSeries[];
    onElementClick?: ChartInteractionHandler;
  };

const ComposedChart = ({
  data = [],
  xKey = 'name',
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  loading = false,
  error,
  gradient = false,
  series = [], // Array of series config: [{ type: 'bar', key: 'value1', name: 'Series 1', color: '#color', yAxisId: 'left' }]
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onElementClick,
  ...props
}: ComposedChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const isAnimationActive = useChartMotion();

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(label)}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color }}>
            {entry.name}: {formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const handleElementClick: ChartInteractionHandler = (data, index) => {
    onElementClick?.(data, index);
  };

  const renderElements = () => {
    return series.map((seriesConfig, index) => {
      const color = seriesConfig.color || colorPalette[index % colorPalette.length];
      const commonProps = {
        dataKey: seriesConfig.key,
        name: seriesConfig.name,
        yAxisId: seriesConfig.yAxisId || 'left',
      };

      switch (seriesConfig.type) {
        case 'bar':
          return (
            <Bar
              key={seriesConfig.key}
              {...commonProps}
              fill={color}
              radius={[4, 4, 0, 0]}
              maxBarSize={seriesConfig.barSize}
              isAnimationActive={isAnimationActive}
              onClick={onElementClick ? (datum, elementIndex) => handleElementClick(datum, elementIndex) : undefined}
            />
          );
        
        case 'line':
          return (
            <Line
              key={seriesConfig.key}
              {...commonProps}
              type="monotone"
              stroke={color}
              strokeWidth={seriesConfig.strokeWidth || 2}
              dot={{ r: 4, fill: color }}
              activeDot={{ r: 6 }}
              isAnimationActive={isAnimationActive}
              onClick={onElementClick ? (datum) => handleElementClick(datum, index) : undefined}
            />
          );
        
        case 'area':
          return (
            <Area
              key={seriesConfig.key}
              {...commonProps}
              type="monotone"
              stroke={color}
              strokeWidth={seriesConfig.strokeWidth || 2}
              fill={color}
              fillOpacity={seriesConfig.fillOpacity || 0.6}
              isAnimationActive={isAnimationActive}
              onClick={onElementClick ? (datum) => handleElementClick(datum, index) : undefined}
            />
          );
        
        default:
          return null;
      }
    });
  };

  const hasRightAxis = series.some(s => s.yAxisId === 'right');

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsComposedChart
        data={data}
        accessibilityLayer
        margin={{ top: 20, right: hasRightAxis ? 30 : 20, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid.stroke}
            strokeOpacity={chartTheme.grid.strokeOpacity}
          />
        )}
        
        <XAxis
          dataKey={xKey}
          tick={chartTheme.axis.tick}
          axisLine={{ stroke: chartTheme.axis.line.stroke }}
          tickFormatter={formatLabel}
        />
        
        <YAxis
          yAxisId="left"
          tick={chartTheme.axis.tick}
          axisLine={{ stroke: chartTheme.axis.line.stroke }}
          tickFormatter={formatValue}
        />
        
        {hasRightAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={chartTheme.axis.tick}
            axisLine={{ stroke: chartTheme.axis.line.stroke }}
            tickFormatter={formatValue}
          />
        )}
        
        {showTooltip && <Tooltip content={CustomTooltip} />}
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />}
        
        {renderElements()}
      </RechartsComposedChart>
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

export default ComposedChart;
