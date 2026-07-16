import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from '../core/chartTheme';
import { formatNumber, resolveChartColors } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type {
  CartesianChartProps,
  ChartInteractionHandler,
  ChartTooltipProps,
} from '../core/types';
import { getChartNumber, getChartValue } from '../core/types';
import { useChartMotion } from '../core/useChartMotion';
import { getBarChartLayout, type BarOrientation } from '../core/layout';

export type BarChartProps = CartesianChartProps &
  Omit<ChartContainerProps, keyof CartesianChartProps | 'children'> & {
    orientation?: BarOrientation;
    barRadius?: number;
    barSize?: number;
    stacked?: boolean;
    onBarClick?: ChartInteractionHandler;
  };

const BarChart = ({
  data = [],
  xKey = 'name',
  yKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = 'primary',
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  loading = false,
  error,
  orientation = 'vertical', // 'vertical' or 'horizontal'
  barRadius = 4,
  barSize,
  gradient = false,
  stacked = false,
  multiSeries = [], // Array of objects: [{ key: 'series1', name: 'Series 1', color: '#color' }]
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onBarClick,
  ...props
}: BarChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const hoverCursor = chartTheme.tooltip.cursor;
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

  const handleBarClick: ChartInteractionHandler = (data, index) => {
    onBarClick?.(data, index);
  };

  const renderBars = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => (
        <Bar
          key={series.key}
          dataKey={series.key}
          name={series.name}
          fill={series.color || colorPalette[index % colorPalette.length]}
          radius={orientation === 'vertical' ? [barRadius, barRadius, 0, 0] : [0, barRadius, barRadius, 0]}
          maxBarSize={barSize}
          stackId={stacked ? 'stack' : undefined}
          isAnimationActive={isAnimationActive}
          onClick={onBarClick ? handleBarClick : undefined}
        />
      ));
    }

    return (
      <Bar
        dataKey={yKey}
        fill={colorPalette[0]}
        radius={orientation === 'vertical' ? [barRadius, barRadius, 0, 0] : [0, barRadius, barRadius, 0]}
        maxBarSize={barSize}
        isAnimationActive={isAnimationActive}
        onClick={onBarClick ? handleBarClick : undefined}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={colorPalette[index % colorPalette.length]}
            role={onBarClick ? 'button' : undefined}
            tabIndex={onBarClick ? 0 : undefined}
            aria-label={`${formatLabel(getChartValue(entry, xKey))}: ${formatValue(getChartNumber(entry, yKey))}`}
            onKeyDown={onBarClick ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onBarClick(entry, index);
              }
            } : undefined}
          />
        ))}
      </Bar>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        layout={getBarChartLayout(orientation)}
        accessibilityLayer
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid.stroke}
            strokeOpacity={chartTheme.grid.strokeOpacity}
          />
        )}
        
        {orientation === 'vertical' ? (
          <>
            <XAxis
              dataKey={xKey}
              tick={chartTheme.axis.tick}
              axisLine={{ stroke: chartTheme.axis.line.stroke }}
              tickFormatter={formatLabel}
            />
            <YAxis
              tick={chartTheme.axis.tick}
              axisLine={{ stroke: chartTheme.axis.line.stroke }}
              tickFormatter={formatValue}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={chartTheme.axis.tick}
              axisLine={{ stroke: chartTheme.axis.line.stroke }}
              tickFormatter={formatValue}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={chartTheme.axis.tick}
              axisLine={{ stroke: chartTheme.axis.line.stroke }}
              tickFormatter={formatLabel}
            />
          </>
        )}
        
        {showTooltip && <Tooltip content={CustomTooltip} cursor={hoverCursor} />}
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />}
        
        {renderBars()}
      </RechartsBarChart>
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

export default BarChart;
