/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, LinearProgress } from '@mui/material';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const BulletChart = ({
  data = [],
  title,
  subtitle,
  height = 300,
  loading = false,
  error = null,
  gradient = false,
  valueKey = 'value',
  targetKey = 'target',
  nameKey = 'name',
  maxKey = 'max',
  rangesKey = 'ranges', // Array of range objects: [{ value: 50, color: '#color', label: 'Poor' }]
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  showLabels = true,
  showTarget = true,
  onBarClick = null,
  ...props
}) => {
  const theme = useTheme();

  const renderHorizontalBullet = (item, index) => {
    const value = item[valueKey] || 0;
    const target = item[targetKey] || 0;
    const max = item[maxKey] || Math.max(value, target) * 1.2;
    const ranges = item[rangesKey] || [];
    const name = item[nameKey] || `Item ${index + 1}`;

    const valuePercent = (value / max) * 100;
    const targetPercent = (target / max) * 100;

    return (
      <Box key={index} sx={{ mb: 3 }}>
        {showLabels && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {formatLabel(name)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatValue(value)} / {formatValue(max)}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ position: 'relative', height: 40 }}>
          {/* Background ranges */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', display: 'flex' }}>
            {ranges.map((range, rangeIndex) => {
              const rangePercent = (range.value / max) * 100;
              return (
                <Box
                  key={rangeIndex}
                  sx={{
                    width: `${rangePercent}%`,
                    height: '100%',
                    backgroundColor: range.color || theme.palette.grey[200 + rangeIndex * 100],
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {range.label && (
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      {range.label}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Value bar */}
          <Box
            sx={{
              position: 'absolute',
              top: '25%',
              height: '50%',
              width: `${Math.min(valuePercent, 100)}%`,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onBarClick ? {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scaleY(1.1)'
              } : {}
            }}
            onClick={() => onBarClick && onBarClick(item, index)}
          />
          
          {/* Target line */}
          {showTarget && target > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: `${Math.min(targetPercent, 100)}%`,
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: theme.palette.error.main,
                transform: 'translateX(-50%)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -4,
                  left: -2,
                  width: 7,
                  height: 7,
                  backgroundColor: theme.palette.error.main,
                  transform: 'rotate(45deg)'
                }
              }}
              title={`Target: ${formatValue(target)}`}
            />
          )}
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Current: {formatValue(value)}
          </Typography>
          {showTarget && (
            <Typography variant="caption" color="error.main">
              Target: {formatValue(target)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderVerticalBullet = (item, index) => {
    const value = item[valueKey] || 0;
    const target = item[targetKey] || 0;
    const max = item[maxKey] || Math.max(value, target) * 1.2;
    const ranges = item[rangesKey] || [];
    const name = item[nameKey] || `Item ${index + 1}`;

    const valuePercent = (value / max) * 100;
    const targetPercent = (target / max) * 100;

    return (
      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
        {/* Chart */}
        <Box sx={{ position: 'relative', width: 60, height: 200, mb: 2 }}>
          {/* Background ranges */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
            {ranges.map((range, rangeIndex) => {
              const rangePercent = (range.value / max) * 100;
              return (
                <Box
                  key={rangeIndex}
                  sx={{
                    height: `${rangePercent}%`,
                    width: '100%',
                    backgroundColor: range.color || theme.palette.grey[200 + rangeIndex * 100],
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {range.label && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.6rem',
                        transform: 'rotate(-90deg)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {range.label}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Value bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '25%',
              width: '50%',
              height: `${Math.min(valuePercent, 100)}%`,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
              cursor: onBarClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': onBarClick ? {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scaleX(1.1)'
              } : {}
            }}
            onClick={() => onBarClick && onBarClick(item, index)}
          />
          
          {/* Target line */}
          {showTarget && target > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: `${Math.min(targetPercent, 100)}%`,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: theme.palette.error.main,
                transform: 'translateY(50%)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: -4,
                  top: -2,
                  width: 7,
                  height: 7,
                  backgroundColor: theme.palette.error.main,
                  transform: 'rotate(45deg)'
                }
              }}
              title={`Target: ${formatValue(target)}`}
            />
          )}
        </Box>
        
        {/* Labels */}
        {showLabels && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
              {formatLabel(name)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatValue(value)}
            </Typography>
            {showTarget && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                Target: {formatValue(target)}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  const chartContent = (
    <Box sx={{ p: 2 }}>
      {orientation === 'horizontal' ? (
        <Box>
          {data.map((item, index) => renderHorizontalBullet(item, index))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {data.map((item, index) => renderVerticalBullet(item, index))}
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

export default BulletChart;