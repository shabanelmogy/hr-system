import { useId } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, Area, AreaChart, BarChart, Bar } from 'recharts';
import { formatNumber } from './chartUtils';
import type { ChartData, ChartFormatter } from './types';
import { getChartNumber } from './types';

export type SparklineChartProps = Omit<BoxProps, 'height' | 'width'> & {
  data?: ChartData;
  type?: 'line' | 'area' | 'bar';
  width?: number | string;
  height?: number | string;
  color?: string;
  strokeWidth?: number;
  showValue?: boolean;
  showTrend?: boolean;
  valueKey?: string;
  formatValue?: ChartFormatter;
};

const SparklineChart = ({
  data = [],
  type = 'line', // 'line', 'area', 'bar'
  width = 100,
  height = 40,
  color,
  strokeWidth = 2,
  showValue = false,
  showTrend = false,
  valueKey = 'value',
  formatValue = formatNumber,
  sx,
  ...boxProps
}: SparklineChartProps) => {
  const theme = useTheme();
  
  const chartColor = color || theme.palette.primary.main;
  const currentValue = data.length > 0 ? getChartNumber(data[data.length - 1], valueKey) : 0;
  const previousValue = data.length > 1 ? getChartNumber(data[data.length - 2], valueKey) : currentValue;
  const trend = currentValue - previousValue;
  const isPositive = trend >= 0;

  const gradientId = `sparkline-gradient-${useId().replace(/:/g, '')}`;

  const renderChart = () => {
    const commonProps = {
      width: '100%' as `${number}%`,
      height: '100%' as `${number}%`,
      data: data,
      margin: { top: 2, right: 2, left: 2, bottom: 2 }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke={chartColor}
              strokeWidth={strokeWidth}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <Bar
              dataKey={valueKey}
              fill={chartColor}
              radius={[1, 1, 0, 0]}
            />
          </BarChart>
        );
      
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={chartColor}
              strokeWidth={strokeWidth}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        );
    }
  };

  return (
    <Box 
      {...boxProps}
      sx={[{
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
      }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {/* Chart */}
      <Box sx={{ width: width, height: height, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
      {/* Value and trend */}
      {(showValue || showTrend) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {showValue && (
            <Typography 
              variant="body2" 
              color={chartColor}
              sx={{
                fontWeight: "bold"
              }}
            >
              {formatValue(currentValue)}
            </Typography>
          )}
          
          {showTrend && data.length > 1 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 'bold'
              }}
            >
              {isPositive ? '+' : ''}{formatValue(trend)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SparklineChart;
