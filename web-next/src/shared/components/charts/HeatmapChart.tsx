import { Box, Typography, useTheme } from '@mui/material';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';
import type { ChartContainerProps } from './ChartContainer';
import type { ChartData, ChartFormatter } from './types';
import { getChartNumber, getChartValue } from './types';

type HeatmapAxisValue = string | number;

export type HeatmapChartProps = Omit<ChartContainerProps, 'children' | 'height'> & {
  data?: ChartData;
  height?: number;
  colors?: readonly [string, string] | string[];
  showLabels?: boolean;
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onCellClick?: (cellData: object) => void;
  cellSize?: 'auto' | number;
  borderRadius?: number;
  showColorScale?: boolean;
};

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const toAxisValue = (value: unknown): HeatmapAxisValue =>
  typeof value === 'number' ? value : String(value ?? '');

const HeatmapChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = ['#ffffff', '#1976d2'], // From light to dark
  showLabels = true,
  loading = false,
  error,
  gradient = false,
  xKey = 'x',
  yKey = 'y',
  valueKey = 'value',
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onCellClick,
  cellSize = 'auto', // 'auto' or number
  borderRadius = 4,
  showColorScale = true,
  ...props
}: HeatmapChartProps) => {
  const theme = useTheme();

  // Get unique x and y values
  const xValues = [...new Set(data.map(d => toAxisValue(getChartValue(d, xKey))))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  const yValues = [...new Set(data.map(d => toAxisValue(getChartValue(d, yKey))))].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  
  // Get min and max values for color scaling
  const values = data.map(d => getChartNumber(d, valueKey));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Create a map for quick lookup
  const dataMap = new Map<string, object>();
  data.forEach(d => {
    const key = `${getChartValue(d, xKey)}-${getChartValue(d, yKey)}`;
    dataMap.set(key, d);
  });

  // Calculate cell size
  const containerHeight = height - 40; // Account for labels
  const calculatedCellSize = cellSize === 'auto' 
    ? Math.min(
        (containerHeight - 60) / yValues.length,
        300 / xValues.length
      )
    : cellSize;

  // Color interpolation function
  const getColor = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return theme.palette.grey[100];
    }
    
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    
    // Simple linear interpolation between two colors
    const startColor = colors[0] ?? '#ffffff';
    const endColor = colors[1] ?? '#1976d2';
    
    // Convert hex to RGB
    const hexToRgb = (hex: string): RgbColor | null => {
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
  const getNormalizedValue = (value: number | null | undefined): number => {
    if (value === null || value === undefined) return 0;
    return (value - minValue) / (maxValue - minValue);
  };

  const handleCellClick = (cellData: object | undefined) => {
    if (onCellClick && cellData) {
      onCellClick(cellData);
    }
  };

  const renderColorScale = () => {
    if (!showColorScale) return null;
    
    
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
            {yValues.map((yValue) => (
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
            {yValues.map((yValue) => (
              <Box key={yValue} sx={{ display: 'flex' }}>
                {xValues.map((xValue) => {
                  const cellData = dataMap.get(`${xValue}-${yValue}`);
                  const value = cellData ? getChartNumber(cellData, valueKey) : null;
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
