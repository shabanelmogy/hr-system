import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';
import type { ChartContainerProps } from './ChartContainer';
import type { ChartData, ChartFormatter, ChartTooltipProps } from './types';
import { getChartNumber, getChartValue } from './types';

interface CandlestickDatum extends Record<string, unknown> {
  bodyLow: number;
  bodyHigh: number;
  wickLow: number;
  wickHigh: number;
  isPositive: boolean;
  bodyHeight: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandlestickShapeProps {
  payload?: CandlestickDatum;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type CandlestickChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: ChartData;
  showGrid?: boolean;
  showTooltip?: boolean;
  xKey?: string;
  openKey?: string;
  highKey?: string;
  lowKey?: string;
  closeKey?: string;
  volumeKey?: string;
  showVolume?: boolean;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onCandleClick?: (data: CandlestickDatum) => void;
};

const CandlestickChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  showGrid = true,
  showTooltip = true,
  loading = false,
  error,
  gradient = false,
  xKey = 'date',
  openKey = 'open',
  highKey = 'high',
  lowKey = 'low',
  closeKey = 'close',
  volumeKey = 'volume',
  showVolume = false,
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onCandleClick,
  ...props
}: CandlestickChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  // Transform data for candlestick representation
  const transformedData: CandlestickDatum[] = data.map(item => {
    const open = getChartNumber(item, openKey);
    const close = getChartNumber(item, closeKey);
    const high = getChartNumber(item, highKey);
    const low = getChartNumber(item, lowKey);
    
    const isPositive = close >= open;
    
    return {
      ...(item as Record<string, unknown>),
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

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data || typeof data !== 'object') return null;
    const open = getChartNumber(data, 'open');
    const close = getChartNumber(data, 'close');
    const change = close - open;
    const changePercent = (open === 0 ? 0 : (change / open) * 100).toFixed(2);

    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(label)}</p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Open: {formatValue(open)}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          High: {formatValue(getChartValue(data, 'high'))}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Low: {formatValue(getChartValue(data, 'low'))}
        </p>
        <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
          Close: {formatValue(close)}
        </p>
        <p style={{ 
          margin: '4px 0', 
          color: getChartValue(data, 'isPositive') ? theme.palette.success.main : theme.palette.error.main,
          fontWeight: 'bold'
        }}>
          Change: {change >= 0 ? '+' : ''}{formatValue(change)} ({changePercent}%)
        </p>
        {showVolume && getChartValue(data, volumeKey) != null && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            Volume: {formatValue(getChartValue(data, volumeKey))}
          </p>
        )}
      </div>
    );
  };

  // Custom candlestick shape
  const CandlestickShape = ({ payload, x, y, width, height: candleHeight }: CandlestickShapeProps) => {
    if (!payload || x == null || y == null || width == null || candleHeight == null) return null;

    const data = payload;
    const candleWidth = Math.max(width * 0.6, 2);
    const wickWidth = Math.max(width * 0.1, 1);
    const centerX = x + width / 2;
    
    const color = data.isPositive ? theme.palette.success.main : theme.palette.error.main;
    const fillColor = data.isPositive ? theme.palette.success.light : theme.palette.error.light;

    // Calculate positions (note: y-axis is inverted in SVG)
    const range = data.wickHigh - data.wickLow || 1;
    const bodyTop = y + candleHeight - ((data.bodyHigh - data.wickLow) / range) * candleHeight;
    const bodyBottom = y + candleHeight - ((data.bodyLow - data.wickLow) / range) * candleHeight;
    const wickTop = y + candleHeight - ((data.wickHigh - data.wickLow) / range) * candleHeight;
    const wickBottom = y + candleHeight - ((data.wickLow - data.wickLow) / range) * candleHeight;

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
        
        {showTooltip && <Tooltip content={CustomTooltip} />}
        
        {/* Invisible bar to capture mouse events and provide positioning */}
        <Bar
          dataKey="wickHigh"
          fill="transparent"
          stroke="transparent"
          shape={CandlestickShape}
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
