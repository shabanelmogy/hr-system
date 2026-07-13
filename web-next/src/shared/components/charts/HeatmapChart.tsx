/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, alpha } from '@mui/material';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const HeatmapChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = ['#ffffff', '#1976d2'], // From light to dark
  showTooltip = true,
  showLabels = true,
  loading = false,
  error = null,
  gradient = false,
  xKey = 'x',
  yKey = 'y',
  valueKey = 'value',
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onCellClick = null,
  cellSize = 'auto', // 'auto' or number
  borderRadius = 4,
  showColorScale = true,
  ...props
}) => {
  const theme = useTheme();

  // Get unique x and y values
  const xValues = [...new Set(data.map(d => d[xKey]))].sort();
  const yValues = [...new Set(data.map(d => d[yKey]))].sort();
  
  // Get min and max values for color scaling
  const values = data.map(d => d[valueKey]).filter(v => v !== null && v !== undefined);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Create a map for quick lookup
  const dataMap = new Map();
  data.forEach(d => {
    const key = `${d[xKey]}-${d[yKey]}`;
    dataMap.set(key, d);
  });

  // Calculate cell size
  const containerWidth = '100%';
  const containerHeight = height - 40; // Account for labels
  const calculatedCellSize = cellSize === 'auto' 
    ? Math.min(
        (containerHeight - 60) / yValues.length,
        300 / xValues.length
      )
    : cellSize;

  // Color interpolation function
  const getColor = (value) => {
    if (value === null || value === undefined) {
      return theme.palette.grey[100];
    }
    
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    
    // Simple linear interpolation between two colors
    const startColor = colors[0];
    const endColor = colors[1];
    
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const startRgb = hexToRgb(startColor);
    const endRgb = hexToRgb(endColor);
    
    if (!startRgb || !endRgb) return endColor;
    
    const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * normalizedValue);
    const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * normalizedValue);
    const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * normalizedValue);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Get normalized value for a given value
  const getNormalizedValue = (value) => {
    if (value === null || value === undefined) return 0;
    return (value - minValue) / (maxValue - minValue);
  };

  const handleCellClick = (cellData) => {
    if (onCellClick && cellData) {
      onCellClick(cellData);
    }
  };

  const renderColorScale = () => {
    if (!showColorScale) return null;
    
    const scaleSteps = 5;
    const stepValue = (maxValue - minValue) / (scaleSteps - 1);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ mr: 1 }}>
          {formatValue(minValue)}
        </Typography>
        <Box sx={{ display: 'flex', mr: 1 }}>
          {Array.from({ length: 20 }, (_, i) => {
            const value = minValue + (i / 19) * (maxValue - minValue);
            return (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 20,
                  backgroundColor: getColor(value),
                  border: `1px solid ${theme.palette.divider}`
                }}
              />
            );
          })}
        </Box>
        <Typography variant="caption">
          {formatValue(maxValue)}
        </Typography>
      </Box>
    );
  };

  const chartContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      {/* Heatmap Grid */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Y-axis labels and grid */}
        <Box sx={{ display: 'flex' }}>
          {/* Y-axis labels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1, justifyContent: 'space-around' }}>
            {yValues.map((yValue, yIndex) => (
              <Box
                key={yValue}
                sx={{
                  height: calculatedCellSize,
                  display: 'flex',
                  alignItems: 'center',
                  pr: 1
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {formatLabel(yValue)}
                </Typography>
              </Box>
            ))}
          </Box>
          
          {/* Grid */}
          <Box>
            {/* X-axis labels */}
            <Box sx={{ display: 'flex', mb: 1 }}>
              {xValues.map((xValue) => (
                <Box
                  key={xValue}
                  sx={{
                    width: calculatedCellSize,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'center'
                    }}
                  >
                    {formatLabel(xValue)}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Heatmap cells */}
            {yValues.map((yValue, yIndex) => (
              <Box key={yValue} sx={{ display: 'flex' }}>
                {xValues.map((xValue, xIndex) => {
                  const cellData = dataMap.get(`${xValue}-${yValue}`);
                  const value = cellData ? cellData[valueKey] : null;
                  const cellColor = getColor(value);
                  const normalizedValue = getNormalizedValue(value);
                  
                  return (
                    <Box
                      key={`${xValue}-${yValue}`}
                      sx={{
                        width: calculatedCellSize,
                        height: calculatedCellSize,
                        backgroundColor: cellColor,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: borderRadius / 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: onCellClick ? 'pointer' : 'default',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': onCellClick ? {
                          transform: 'scale(1.05)',
                          boxShadow: theme.shadows[4],
                          zIndex: 1
                        } : {}
                      }}
                      onClick={() => handleCellClick(cellData)}
                      title={cellData ? `${formatLabel(xValue)} - ${formatLabel(yValue)}: ${formatValue(value)}` : ''}
                    >
                      {showLabels && value !== null && value !== undefined && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.7rem',
                            color: normalizedValue > 0.5 ? 'white' : 'black',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatValue(value)}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      
      {/* Color scale */}
      {renderColorScale()}
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

export default HeatmapChart;