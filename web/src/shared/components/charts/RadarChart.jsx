/* eslint-disable react/prop-types */
import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const RadarChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  loading = false,
  error = null,
  fillOpacity = 0.6,
  strokeWidth = 2,
  gradient = false,
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

  const renderRadars = () => {
    if (multiSeries.length > 0) {
      return multiSeries.map((series, index) => (
        <Radar
          key={series.key}
          name={series.name}
          dataKey={series.key}
          stroke={series.color || colors[index % colors.length]}
          fill={series.color || colors[index % colors.length]}
          fillOpacity={fillOpacity}
          strokeWidth={strokeWidth}
          onClick={handleAreaClick}
        />
      ));
    }

    // If no multiSeries, assume data has multiple numeric properties
    const numericKeys = Object.keys(data[0] || {}).filter(key => 
      typeof data[0][key] === 'number'
    );

    return numericKeys.map((key, index) => (
      <Radar
        key={key}
        name={formatLabel(key)}
        dataKey={key}
        stroke={colors[index % colors.length]}
        fill={colors[index % colors.length]}
        fillOpacity={fillOpacity}
        strokeWidth={strokeWidth}
        onClick={handleAreaClick}
      />
    ));
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && (
          <PolarGrid 
            stroke={chartTheme.grid.stroke}
            strokeOpacity={chartTheme.grid.strokeOpacity}
          />
        )}
        
        <PolarAngleAxis 
          dataKey="subject" 
          tick={chartTheme.axis.tick}
          tickFormatter={formatLabel}
        />
        <PolarRadiusAxis 
          tick={chartTheme.axis.tick}
          tickFormatter={formatValue}
          angle={90}
          domain={[0, 'dataMax']}
        />
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} />}
        
        {renderRadars()}
      </RechartsRadarChart>
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

export default RadarChart;