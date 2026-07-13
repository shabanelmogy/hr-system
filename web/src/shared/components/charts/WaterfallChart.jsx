/* eslint-disable react/prop-types */
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const WaterfallChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  showGrid = true,
  showTooltip = true,
  loading = false,
  error = null,
  gradient = false,
  xKey = 'name',
  valueKey = 'value',
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onBarClick = null,
  positiveColor = null,
  negativeColor = null,
  totalColor = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  // Default colors
  const colors = {
    positive: positiveColor || theme.palette.success.main,
    negative: negativeColor || theme.palette.error.main,
    total: totalColor || theme.palette.primary.main
  };

  // Transform data for waterfall chart
  const transformedData = [];
  let runningTotal = 0;

  data.forEach((item, index) => {
    const value = item[valueKey];
    const isTotal = item.type === 'total';
    const isNegative = value < 0;
    
    if (isTotal) {
      // For total bars, start from 0
      transformedData.push({
        ...item,
        start: 0,
        end: runningTotal,
        value: runningTotal,
        displayValue: value,
        color: colors.total,
        isTotal: true
      });
    } else {
      // For regular bars
      const start = runningTotal;
      runningTotal += value;
      const end = runningTotal;
      
      transformedData.push({
        ...item,
        start: Math.min(start, end),
        end: Math.max(start, end),
        value: Math.abs(value),
        displayValue: value,
        color: isNegative ? colors.negative : colors.positive,
        isTotal: false,
        isNegative
      });
    }
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(label)}</p>
        <p style={{ margin: '4px 0', color: data.color }}>
          Value: {formatValue(data.displayValue)}
        </p>
        {!data.isTotal && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            Running Total: {formatValue(data.end)}
          </p>
        )}
        {data.isTotal && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            Total: {formatValue(data.value)}
          </p>
        )}
      </div>
    );
  };

  // Custom bar shape for waterfall
  const WaterfallBar = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const barHeight = height * (payload.value / (payload.end - payload.start || 1));
    const barY = payload.isTotal ? y + height - (height * (payload.value / payload.value)) : 
                  y + height - (height * ((payload.end - Math.min(...transformedData.map(d => d.start))) / 
                  (Math.max(...transformedData.map(d => d.end)) - Math.min(...transformedData.map(d => d.start)))));

    return (
      <rect
        x={x}
        y={barY}
        width={width}
        height={Math.abs(barHeight)}
        fill={payload.color}
        stroke={theme.palette.background.paper}
        strokeWidth={1}
        onClick={() => onBarClick && onBarClick(payload)}
        style={{ cursor: onBarClick ? 'pointer' : 'default' }}
      />
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
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
        
        {/* Reference line at zero */}
        <ReferenceLine y={0} stroke={theme.palette.divider} strokeDasharray="2 2" />
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        
        <Bar
          dataKey="value"
          shape={<WaterfallBar />}
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
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

export default WaterfallChart;