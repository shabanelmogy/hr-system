/* eslint-disable react/prop-types */
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const CandlestickChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  showGrid = true,
  showTooltip = true,
  loading = false,
  error = null,
  gradient = false,
  xKey = 'date',
  openKey = 'open',
  highKey = 'high',
  lowKey = 'low',
  closeKey = 'close',
  volumeKey = 'volume',
  showVolume = false,
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onCandleClick = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  // Transform data for candlestick representation
  const transformedData = data.map(item => {
    const open = item[openKey];
    const close = item[closeKey];
    const high = item[highKey];
    const low = item[lowKey];
    
    const isPositive = close >= open;
    
    return {
      ...item,
      // Body of the candle
      bodyLow: Math.min(open, close),
      bodyHigh: Math.max(open, close),
      // Wicks
      wickLow: low,
      wickHigh: high,
      // Color determination
      isPositive,
      bodyHeight: Math.abs(close - open),
      // For tooltip
      open,
      close,
      high,
      low
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const change = data.close - data.open;
    const changePercent = ((change / data.open) * 100).toFixed(2);

    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(label)}</p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Open: {formatValue(data.open)}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          High: {formatValue(data.high)}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Low: {formatValue(data.low)}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Close: {formatValue(data.close)}
        </p>
        <p style={{ 
          margin: '4px 0', 
          color: data.isPositive ? theme.palette.success.main : theme.palette.error.main,
          fontWeight: 'bold'
        }}>
          Change: {change >= 0 ? '+' : ''}{formatValue(change)} ({changePercent}%)
        </p>
        {showVolume && data[volumeKey] && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            Volume: {formatValue(data[volumeKey])}
          </p>
        )}
      </div>
    );
  };

  // Custom candlestick shape
  const CandlestickShape = (props) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const data = payload;
    const candleWidth = Math.max(width * 0.6, 2);
    const wickWidth = Math.max(width * 0.1, 1);
    const centerX = x + width / 2;
    
    const color = data.isPositive ? theme.palette.success.main : theme.palette.error.main;
    const fillColor = data.isPositive ? theme.palette.success.light : theme.palette.error.light;

    // Calculate positions (note: y-axis is inverted in SVG)
    const bodyTop = y + height - ((data.bodyHigh - data.wickLow) / (data.wickHigh - data.wickLow)) * height;
    const bodyBottom = y + height - ((data.bodyLow - data.wickLow) / (data.wickHigh - data.wickLow)) * height;
    const wickTop = y + height - ((data.wickHigh - data.wickLow) / (data.wickHigh - data.wickLow)) * height;
    const wickBottom = y + height - ((data.wickLow - data.wickLow) / (data.wickHigh - data.wickLow)) * height;

    return (
      <g onClick={() => onCandleClick && onCandleClick(data)}>
        {/* Upper wick */}
        <line
          x1={centerX}
          y1={wickTop}
          x2={centerX}
          y2={bodyTop}
          stroke={color}
          strokeWidth={wickWidth}
        />
        {/* Lower wick */}
        <line
          x1={centerX}
          y1={bodyBottom}
          x2={centerX}
          y2={wickBottom}
          stroke={color}
          strokeWidth={wickWidth}
        />
        {/* Body */}
        <rect
          x={centerX - candleWidth / 2}
          y={bodyTop}
          width={candleWidth}
          height={Math.max(bodyBottom - bodyTop, 1)}
          fill={data.isPositive ? 'transparent' : fillColor}
          stroke={color}
          strokeWidth={2}
        />
      </g>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
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
          domain={['dataMin', 'dataMax']}
          tick={chartTheme.axis.tick}
          axisLine={{ stroke: chartTheme.axis.line.stroke }}
          tickFormatter={formatValue}
        />
        
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        
        {/* Invisible bar to capture mouse events and provide positioning */}
        <Bar
          dataKey="wickHigh"
          fill="transparent"
          stroke="transparent"
          shape={<CandlestickShape />}
        />
        
        {/* Volume bars if enabled */}
        {showVolume && (
          <Bar
            dataKey={volumeKey}
            yAxisId="volume"
            fill={theme.palette.grey[400]}
            fillOpacity={0.3}
          />
        )}
      </ComposedChart>
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

export default CandlestickChart;