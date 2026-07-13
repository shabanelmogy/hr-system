/* eslint-disable react/prop-types */
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { getColorPalette, formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const LineChart = ({
  data = [],
  xKey = 'name',
  yKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = 'primary', // Now accepts palette name or array
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  loading = false,
  error = null,
  strokeWidth = 2,
  strokeDasharray = null, // e.g., "5 5" for dashed line
  showDots = true,
  dotSize = 4,
  gradient = false,
  smooth = true, // Use smooth curves
  multiSeries = [], // Array of objects: [{ key: 'series1', name: 'Series 1', color: '#color' }]
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onDotClick = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = Array.isArray(colors) ? colors : getColorPalette(colors, theme.palette.mode);

  const CustomTooltip = ({ active, payload, label }) => {
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

  const handleDotClick = (data, index) => {
    if (onDotClick) {
      onDotClick(data, index);
    }
  };

  const renderLines = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => (
        <Line
          key={series.key}
          type={smooth ? "monotone" : "linear"}
          dataKey={series.key}
          name={series.name}
          stroke={series.color || colorPalette[index % colorPalette.length]}
          strokeWidth={strokeWidth}
          strokeDasharray={series.dasharray || strokeDasharray}
          dot={showDots ? { r: dotSize, fill: series.color || colorPalette[index % colorPalette.length] } : false}
          activeDot={{ r: dotSize + 2, onClick: handleDotClick }}
        />
      ));
    }

    return (
      <Line
        type={smooth ? "monotone" : "linear"}
        dataKey={yKey}
        stroke={colorPalette[0]}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        dot={showDots ? { r: dotSize, fill: colorPalette[0] } : false}
        activeDot={{ r: dotSize + 2, onClick: handleDotClick }}
      />
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
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
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />}
        
        {renderLines()}
      </RechartsLineChart>
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

export default LineChart;