/* eslint-disable react/prop-types */
import { Box, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber, formatPercentage } from './chartUtils';
import ChartContainer from './ChartContainer';

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
  error = null,
  gradient = false,
  thickness = 20,
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  thresholds = [33, 66], // Percentage thresholds for color changes
  centerY = '64%', // vertical position of center content
  trackColor = null, // optional custom track color
  arcGradient = true, // use gradient fill for active arc
  ...props
}) => {
  const theme = useTheme();

  // Calculate percentage
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  
  // Determine color based on percentage and thresholds
  const getColor = () => {
    if (percentage <= thresholds[0]) return colors[0]; // Red
    if (percentage <= thresholds[1]) return colors[1]; // Yellow
    return colors[2]; // Green
  };

  const activeColor = getColor();
  const gradId = `gaugeGrad-${(title || 'gauge').toString().replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
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
        <Typography variant="h3" fontWeight="bold" color="primary.main">
          {formatValue(value)}
        </Typography>
      )}
      {showPercentage && (
        <Typography variant="h6" color="text.secondary">
          {formatPercentage(percentage)}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        of {formatValue(maxValue)}
      </Typography>
    </Box>
  );

  const chartContent = (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
            innerRadius={60}
            outerRadius={60 + thickness}
            dataKey="value"
            stroke="none"
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
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default GaugeChart;