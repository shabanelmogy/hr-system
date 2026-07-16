import { ResponsiveContainer, ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getChartTheme } from '../core/chartTheme';
import { COLOR_PALETTES, formatNumber, resolveChartColors } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { CartesianChartProps, ChartData, ChartInteractionHandler, ChartTooltipProps } from '../core/types';
import { getChartValue } from '../core/types';
import { useChartMotion } from '../core/useChartMotion';

export interface ScatterSeries {
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
  colors = COLOR_PALETTES.primary,
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
  const { t } = useTranslation();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const isAnimationActive = useChartMotion();
  const dataCount = multiSeries.length > 0
    ? multiSeries.reduce((count, series) => count + series.data.length, 0)
    : data.length;

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
            {t('chartCommon.size')}: {formatValue(getChartValue(data, zKey))}
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
          isAnimationActive={isAnimationActive}
        />
      ));
    }

    return (
      <Scatter
        name={t('chartCommon.dataPoints')}
        data={data}
        fill={colorPalette[0]}
        onClick={onDotClick ? handleDotClick : undefined}
        shape={{ r: dotSize }}
        isAnimationActive={isAnimationActive}
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
      dataCount={dataCount}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default ScatterChart;
