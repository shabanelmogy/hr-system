/* eslint-disable react/prop-types */
import { ResponsiveContainer, ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber, resolveChartColors, type ChartColors } from './chartUtils';
import ChartContainer from './ChartContainer';

const ScatterChart = ({
  data = [],
  xKey = 'x',
  yKey = 'y',
  zKey = null, // For bubble size
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary as ChartColors,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  loading = false,
  error = null,
  dotSize = 6,
  gradient = false,
  multiSeries = [], // Array of objects: [{ data: [], name: 'Series 1', color: '#color' }]
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onDotClick = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {data.name || `Point ${data.index || ''}`}
        </p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          X: {formatValue(data[xKey])}
        </p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          Y: {formatValue(data[yKey])}
        </p>
        {zKey && (
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Size: {formatValue(data[zKey])}
          </p>
        )}
      </div>
    );
  };

  const handleDotClick = (data, index) => {
    if (onDotClick) {
      onDotClick(data, index);
    }
  };

  const renderScatters = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => (
        <Scatter
          key={series.name}
          name={series.name}
          data={series.data}
          fill={series.color || colorPalette[index % colorPalette.length]}
          onClick={handleDotClick as any}
        />
      ));
    }

    return (
      <Scatter
        name="Data Points"
        data={data}
        fill={colorPalette[0]}
        onClick={handleDotClick as any}
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
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
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
