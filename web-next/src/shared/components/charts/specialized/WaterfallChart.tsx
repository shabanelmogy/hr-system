import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getChartTheme } from '../core/chartTheme';
import { formatNumber } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { ChartData, ChartFormatter, ChartTooltipProps } from '../core/types';
import { getChartNumber, getChartValue } from '../core/types';
import { useChartMotion } from '../core/useChartMotion';

export interface WaterfallDatum extends Record<string, unknown> {
  range: [number, number];
  start: number;
  end: number;
  value: number;
  displayValue: number;
  color: string;
  isTotal: boolean;
  isNegative?: boolean;
}

export type WaterfallChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: ChartData;
  showGrid?: boolean;
  showTooltip?: boolean;
  xKey?: string;
  valueKey?: string;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onBarClick?: (data: WaterfallDatum) => void;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
};

const WaterfallChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  showGrid = true,
  showTooltip = true,
  loading = false,
  error,
  gradient = false,
  xKey = 'name',
  valueKey = 'value',
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onBarClick,
  positiveColor,
  negativeColor,
  totalColor,
  ...props
}: WaterfallChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartTheme = getChartTheme(theme);
  const isAnimationActive = useChartMotion();

  // Default colors
  const colors = {
    positive: positiveColor || theme.palette.success.main,
    negative: negativeColor || theme.palette.error.main,
    total: totalColor || theme.palette.primary.main
  };

  // Transform data for waterfall chart
  const transformedData: WaterfallDatum[] = [];
  let runningTotal = 0;

  data.forEach((item) => {
    const value = getChartNumber(item, valueKey);
    const isTotal = getChartValue(item, 'type') === 'total';
    const isNegative = value < 0;
    
    if (isTotal) {
      // For total bars, start from 0
      transformedData.push({
        ...(item as Record<string, unknown>),
        range: [Math.min(0, runningTotal), Math.max(0, runningTotal)],
        start: Math.min(0, runningTotal),
        end: runningTotal,
        value: Math.abs(runningTotal),
        displayValue: runningTotal,
        color: colors.total,
        isTotal: true
      });
    } else {
      // For regular bars
      const start = runningTotal;
      runningTotal += value;
      const end = runningTotal;
      
      transformedData.push({
        ...(item as Record<string, unknown>),
        range: [Math.min(start, end), Math.max(start, end)],
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

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data || typeof data !== 'object') return null;
    const color = String(getChartValue(data, 'color') ?? theme.palette.text.primary);
    const displayValue = getChartValue(data, 'displayValue');
    const isTotal = getChartValue(data, 'isTotal') === true;
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(label)}</p>
        <p style={{ margin: '4px 0', color }}>
          {t('chartCommon.value')}: {formatValue(displayValue)}
        </p>
        {!isTotal && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            {t('chartCommon.runningTotal')}: {formatValue(getChartValue(data, 'end'))}
          </p>
        )}
        {isTotal && (
          <p style={{ margin: '4px 0', color: theme.palette.text.secondary }}>
            {t('chartCommon.total')}: {formatValue(displayValue)}
          </p>
        )}
      </div>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
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
        
        {showTooltip && <Tooltip content={CustomTooltip} />}
        
        <Bar
          dataKey="range"
          isAnimationActive={isAnimationActive}
          onClick={onBarClick ? (datum) => {
            const payload = datum && typeof datum === 'object'
              ? getChartValue(datum, 'payload')
              : null;
            if (payload && typeof payload === 'object') onBarClick(payload as WaterfallDatum);
          } : undefined}
        >
          {transformedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              role={onBarClick ? 'button' : undefined}
              tabIndex={onBarClick ? 0 : undefined}
              aria-label={`${formatLabel(getChartValue(entry, xKey))}: ${formatValue(entry.displayValue)}`}
              onKeyDown={onBarClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onBarClick(entry);
                }
              } : undefined}
            />
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
      dataCount={data.length}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default WaterfallChart;
