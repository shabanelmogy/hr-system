/* eslint-disable react/prop-types */
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const TreemapChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showTooltip = true,
  loading = false,
  error = null,
  gradient = false,
  dataKey = 'size',
  nameKey = 'name',
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onRectClick = null,
  strokeWidth = 2,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(data[nameKey])}</p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          Size: {formatValue(data[dataKey])}
        </p>
        {data.category && (
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Category: {data.category}
          </p>
        )}
      </div>
    );
  };

  const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, colors, nameKey, dataKey }) => {
    const nodeName = (payload && (payload[nameKey] ?? payload.name)) || '';
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[index % colors.length] : 'none',
            stroke: theme.palette.background.paper,
            strokeWidth: strokeWidth,
            strokeOpacity: 1,
          }}
          onClick={() => onRectClick && onRectClick(payload, index)}
        />
        {depth === 1 ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill={theme.palette.text.primary}
            fontSize={Math.min(width / 8, height / 8, 14)}
            fontFamily={theme.typography.fontFamily}
          >
            {nodeName}
          </text>
        ) : null}
        {depth === 1 ? (
          <text
            x={x + 4}
            y={y + 18}
            fill={theme.palette.text.secondary}
            fontSize={12}
            fillOpacity={0.9}
            fontFamily={theme.typography.fontFamily}
          >
            {index + 1}
          </text>
        ) : null}
      </g>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey={dataKey}
        aspectRatio={4 / 3}
        stroke={theme.palette.background.paper}
        fill={colors[0]}
        content={<CustomizedContent colors={colors} nameKey={nameKey} dataKey={dataKey} />}
      >
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
      </Treemap>
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

export default TreemapChart;