/* eslint-disable react/prop-types */
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const AreaChart = ({
  data = [],
  xKey = 'name',
  yKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  loading = false,
  error = null,
  strokeWidth = 2,
  fillOpacity = 0.6,
  gradient = true,
  smooth = true,
  stacked = false,
  multiSeries = [], // Array of objects: [{ key: 'series1', name: 'Series 1', color: '#color' }]
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onAreaClick = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

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

  const handleAreaClick = (data, index) => {
    if (onAreaClick) {
      onAreaClick(data, index);
    }
  };

  const createGradient = (color, id) => (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  );

  const renderAreas = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => {
        const color = series.color || colors[index % colors.length];
        const gradientId = `gradient-${series.key}`;
        
        return (
          <Area
            key={series.key}
            type={smooth ? "monotone" : "linear"}
            dataKey={series.key}
            name={series.name}
            stackId={stacked ? "1" : series.key}
            stroke={color}
            strokeWidth={strokeWidth}
            fill={gradient ? `url(#${gradientId})` : color}
            fillOpacity={fillOpacity}
            onClick={handleAreaClick}
          />
        );
      });
    }

    const color = colors[0];
    const gradientId = `gradient-${yKey}`;

    return (
      <Area
        type={smooth ? "monotone" : "linear"}
        dataKey={yKey}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={gradient ? `url(#${gradientId})` : color}
        fillOpacity={fillOpacity}
        onClick={handleAreaClick}
      />
    );
  };

  const renderGradients = () => {
    if (!gradient) return null;

    if (multiSeries.length > 0) {
      return (
        <defs>
          {multiSeries.map((series, index) => {
            const color = series.color || colors[index % colors.length];
            const gradientId = `gradient-${series.key}`;
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            );
          })}
        </defs>
      );
    }

    const color = colors[0];
    const gradientId = `gradient-${yKey}`;
    return (
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
          <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
        </linearGradient>
      </defs>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        {renderGradients()}
        
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
        
        {renderAreas()}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      gradient={false} // We handle gradient internally
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default AreaChart;