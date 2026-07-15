import { ResponsiveContainer, ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber, resolveChartColors, type ChartColors } from './chartUtils';
import ChartContainer from './ChartContainer';
import type { ChartContainerProps } from './ChartContainer';
import type { CartesianChartProps, ChartData, ChartInteractionHandler, ChartTooltipProps } from './types';
import { getChartValue } from './types';

interface ScatterSeries {
  name: string;
  data: ChartData;
  color?: string;
}

export type ScatterChartProps = Omit<CartesianChartProps, 'multiSeries'> &
  Omit<ChartContainerProps, keyof CartesianChartProps | 'children'> & {
    zKey?: string;
    dotSize?: number;
    multiSeries?: readonly ScatterSeries[];
    onDotClick?: ChartInteractionHandler;
  };

const ScatterChart = ({
  data = [],
  xKey = 'x',
  yKey = 'y',
  zKey, // For bubble size
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary as ChartColors,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  loading = false,
  error,
  dotSize = 6,
  gradient = false,
  multiSeries = [], // Array of objects: [{ data: [], name: 'Series 1', color: '#color' }]
  formatValue = formatNumber,
  onDotClick,
  ...props
}: ScatterChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data || typeof data !== 'object') return null;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {String(getChartValue(data, 'name') || `Point ${getChartValue(data, 'index') || ''}`)}
        </p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          X: {formatValue(getChartValue(data, xKey))}
        </p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          Y: {formatValue(getChartValue(data, yKey))}
        </p>
        {zKey && (
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Size: {formatValue(getChartValue(data, zKey))}
          </p>
        )}
      </div>
    );
  };

  const handleDotClick: ChartInteractionHandler = (data, index) => {
    onDotClick?.(data, index);
  };

  const renderScatters = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => (
        <Scatter
          key={series.name}
          name={series.name}
          data={series.data}
          fill={series.color || colorPalette[index % colorPalette.length]}
          onClick={onDotClick ? handleDotClick : undefined}
          shape={{ r: dotSize }}
        />
      ));
    }

    return (
      <Scatter
        name="Data Points"
        data={data}
        fill={colorPalette[0]}
        onClick={onDotClick ? handleDotClick : undefined}
        shape={{ r: dotSize }}
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={colorPalette[index % colorPalette.length]}
          />
        ))}
      </Scatter>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid.stroke}
            strokeOpacity={chartTheme.grid.strokeOpacity}
          />
        )}
        
        <XAxis
          type="number"
          dataKey={xKey}
          name={xKey}
          tick={chartTheme.axis.tick}
          axisLine={{ stroke: chartTheme.axis.line.stroke }}
          tickFormatter={formatValue}
        />
        <YAxis
          type="number"
          dataKey={yKey}
          name={yKey}
          tick={chartTheme.axis.tick}
          axisLine={{ stroke: chartTheme.axis.line.stroke }}
          tickFormatter={formatValue}
        />
        
        {showTooltip && <Tooltip content={CustomTooltip} />}
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />}
        
        {renderScatters()}
      </RechartsScatterChart>
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

export default ScatterChart;
