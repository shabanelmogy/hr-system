import { useId } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatPercentage } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { ChartFormatter } from '../core/types';
import { clamp, safePercentage } from '../core/numeric';
import { useChartMotion } from '../core/useChartMotion';

export type GaugeChartProps = Omit<ChartContainerProps, 'children'> & {
  value?: number;
  maxValue?: number;
  minValue?: number;
  colors?: readonly [string, string, string] | string[];
  showValue?: boolean;
  showPercentage?: boolean;
  thickness?: number;
  formatValue?: ChartFormatter;
  thresholds?: readonly [number, number] | number[];
  centerY?: number | string;
  trackColor?: string;
  arcGradient?: boolean;
};

const GaugeChart = ({
  value = 0,
  maxValue = 100,
  minValue = 0,
  title,
  subtitle,
  height = 300,
  colors = ['#ff4444', '#ffaa00', '#00aa00'], // Red, Yellow, Green
  showValue = true,
  showPercentage = true,
  loading = false,
  error,
  gradient = false,
  thickness = 20,
  formatValue = formatNumber,
  thresholds = [33, 66], // Percentage thresholds for color changes
  centerY = '64%', // vertical position of center content
  trackColor, // optional custom track color
  arcGradient = true, // use gradient fill for active arc
  ...props
}: GaugeChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isAnimationActive = useChartMotion();

  // Calculate percentage
  const percentage = safePercentage(value, minValue, maxValue);
  
  // Determine color based on percentage and thresholds
  const getColor = () => {
    if (percentage <= (thresholds[0] ?? 33)) return colors[0] ?? '#ff4444';
    if (percentage <= (thresholds[1] ?? 66)) return colors[1] ?? '#ffaa00';
    return colors[2] ?? '#00aa00';
  };

  const activeColor = getColor();
  const gradId = `gauge-${useId().replace(/:/g, '')}`;
  const trackFill = trackColor || (theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200]);

  // Create data for the gauge (semicircle)
  const gaugeData = [
    { name: 'value', value: percentage, fill: arcGradient ? `url(#${gradId})` : activeColor },
    { name: 'empty', value: 100 - percentage, fill: trackFill }
  ];

  const centerContent = (
    <Box
      sx={{
        position: 'absolute',
        top: centerY,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}
    >
      {showValue && (
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "primary.main"
          }}>
          {formatValue(value)}
        </Typography>
      )}
      {showPercentage && (
        <Typography variant="h6" sx={{
          color: "text.secondary"
        }}>
          {formatPercentage(percentage)}
        </Typography>
      )}
      <Typography variant="body2" sx={{
        color: "text.secondary"
      }}>
        {t('pagination.of')} {formatValue(maxValue)}
      </Typography>
    </Box>
  );

  const chartContent = (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer>
          {arcGradient && (
            <defs>
              <linearGradient id={gradId} x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor={activeColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={activeColor} stopOpacity={0.6} />
              </linearGradient>
            </defs>
          )}
          <Pie
            data={gaugeData}
            cx="50%"
            cy="72%"
            startAngle={180}
            endAngle={0}
            innerRadius="50%"
            outerRadius={`${clamp(50 + thickness, 58, 82)}%`}
            dataKey="value"
            stroke="none"
            isAnimationActive={isAnimationActive}
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {centerContent}
    </Box>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      summary={`${formatValue(value)} ${t('pagination.of')} ${formatValue(maxValue)}`}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default GaugeChart;
