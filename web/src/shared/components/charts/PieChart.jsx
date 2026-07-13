/* eslint-disable react/prop-types */
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { getColorPalette, formatNumber, formatPercentage } from './chartUtils';
import ChartContainer from './ChartContainer';

const PieChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  title,
  subtitle,
  height = 400,
  colors = 'primary', // Now accepts palette name or array
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  loading = false,
  error = null,
  innerRadius = 0, // Set > 0 for donut chart
  outerRadius = 120,
  startAngle = 90,
  endAngle = 450,
  gradient = false,
  labelLine = true,
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  formatPercent = (value, total) => formatPercentage((value / total) * 100),
  onSliceClick = null,
  customLabel = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = Array.isArray(colors) ? colors : getColorPalette(colors, theme.palette.mode);

  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];
    const percentage = formatPercent(data.value, total);

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

  const defaultLabel = ({ name, value, percent }) => {
    if (!showLabels) return '';
    if (customLabel) return customLabel({ name, value, percent });
    return `${formatLabel(name)} (${(percent * 100).toFixed(1)}%)`;
  };

  const handleSliceClick = (data, index) => {
    if (onSliceClick) {
      onSliceClick(data, index);
    }
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
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
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