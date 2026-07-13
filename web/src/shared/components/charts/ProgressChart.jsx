/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, LinearProgress, CircularProgress } from '@mui/material';
import { formatNumber, formatPercentage } from './chartUtils';
import ChartContainer from './ChartContainer';

const ProgressChart = ({
  data = [],
  title,
  subtitle,
  height = 300,
  loading = false,
  error = null,
  gradient = false,
  orientation = 'horizontal', // 'horizontal' or 'circular'
  showLabels = true,
  showValues = true,
  showPercentages = true,
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onProgressClick = null,
  thickness = 4,
  size = 80, // For circular progress
  ...props
}) => {
  const theme = useTheme();

  const getProgressColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return theme.palette.error.main;
    if (percentage < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const renderHorizontalProgress = (item, index) => {
    const value = item.value || 0;
    const max = item.max || 100;
    const percentage = Math.min((value / max) * 100, 100);
    const color = getProgressColor(value, max);

    return (
      <Box key={index} sx={{ mb: 3 }}>
        {showLabels && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {formatLabel(item.name || `Item ${index + 1}`)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {showValues && (
                <Typography variant="body2" color="text.secondary">
                  {formatValue(value)} / {formatValue(max)}
                </Typography>
              )}
              {showPercentages && (
                <Typography variant="body2" color={color} fontWeight="bold">
                  {formatPercentage(percentage)}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: thickness * 2,
            borderRadius: thickness,
            backgroundColor: theme.palette.grey[200],
            cursor: onProgressClick ? 'pointer' : 'default',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: thickness,
              transition: 'all 0.3s ease-in-out',
            },
            '&:hover': onProgressClick ? {
              transform: 'scaleY(1.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.palette.mode === 'dark' ? 
                  theme.palette.common.white : theme.palette.common.black,
              }
            } : {}
          }}
          onClick={() => onProgressClick && onProgressClick(item, index)}
        />
      </Box>
    );
  };

  const renderCircularProgress = (item, index) => {
    const value = item.value || 0;
    const max = item.max || 100;
    const percentage = Math.min((value / max) * 100, 100);
    const color = getProgressColor(value, max);

    return (
      <Box 
        key={index} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          m: 2,
          cursor: onProgressClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': onProgressClick ? {
            transform: 'scale(1.05)'
          } : {}
        }}
        onClick={() => onProgressClick && onProgressClick(item, index)}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={size}
            thickness={thickness}
            sx={{
              color: theme.palette.grey[200],
              position: 'absolute',
            }}
          />
          <CircularProgress
            variant="determinate"
            value={percentage}
            size={size}
            thickness={thickness}
            sx={{
              color: color,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            {showPercentages && (
              <Typography variant="caption" component="div" color={color} fontWeight="bold">
                {formatPercentage(percentage)}
              </Typography>
            )}
            {showValues && (
              <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                {formatValue(value)}/{formatValue(max)}
              </Typography>
            )}
          </Box>
        </Box>
        
        {showLabels && (
          <Typography variant="body2" align="center" sx={{ maxWidth: size + 20 }}>
            {formatLabel(item.name || `Item ${index + 1}`)}
          </Typography>
        )}
      </Box>
    );
  };

  const chartContent = (
    <Box sx={{ p: 2 }}>
      {orientation === 'horizontal' ? (
        <Box>
          {data.map((item, index) => renderHorizontalProgress(item, index))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {data.map((item, index) => renderCircularProgress(item, index))}
        </Box>
      )}
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

export default ProgressChart;