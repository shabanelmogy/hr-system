import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { ChartData, ChartFormatter, ChartInteractionHandler } from '../core/types';
import { getChartNumber, getChartValue } from '../core/types';
import { getSafeScaleMax, safePercentage } from '../core/numeric';

interface BulletRange {
  value: number;
  color?: string;
  label?: string;
}

export type BulletChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: ChartData;
  valueKey?: string;
  targetKey?: string;
  nameKey?: string;
  maxKey?: string;
  rangesKey?: string;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showTarget?: boolean;
  onBarClick?: ChartInteractionHandler;
};

const getRanges = (item: object, key: string): BulletRange[] => {
  const ranges = getChartValue(item, key);
  if (!Array.isArray(ranges)) return [];
  return ranges.flatMap((range) => {
    if (!range || typeof range !== 'object') return [];
    const value = getChartNumber(range, 'value');
    const color = getChartValue(range, 'color');
    const label = getChartValue(range, 'label');
    return [{
      value,
      color: typeof color === 'string' ? color : undefined,
      label: typeof label === 'string' ? label : undefined,
    }];
  });
};

const rangeShades = [200, 300, 400, 500] as const;

const BulletChart = ({
  data = [],
  title,
  subtitle,
  height = 300,
  loading = false,
  error,
  gradient = false,
  valueKey = 'value',
  targetKey = 'target',
  nameKey = 'name',
  maxKey = 'max',
  rangesKey = 'ranges', // Array of range objects: [{ value: 50, color: '#color', label: 'Poor' }]
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  orientation = 'horizontal', // 'horizontal' or 'vertical'
  showLabels = true,
  showTarget = true,
  onBarClick,
  ...props
}: BulletChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const renderHorizontalBullet = (item: object, index: number) => {
    const value = getChartNumber(item, valueKey);
    const target = getChartNumber(item, targetKey);
    const configuredMax = getChartNumber(item, maxKey);
    const max = configuredMax > 0
      ? configuredMax
      : getSafeScaleMax(Math.abs(value), Math.abs(target)) * 1.2;
    const ranges = getRanges(item, rangesKey);
    const name = getChartValue(item, nameKey) || `Item ${index + 1}`;

    const valuePercent = safePercentage(value, 0, max);
    const targetPercent = safePercentage(target, 0, max);

    return (
      <Box key={index} sx={{ mb: 3 }}>
        {showLabels && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{
              fontWeight: "medium"
            }}>
              {formatLabel(name)}
            </Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {formatValue(value)} / {formatValue(max)}
            </Typography>
          </Box>
        )}
        <Box sx={{ position: 'relative', height: 40 }}>
          {/* Background ranges */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', display: 'flex' }}>
            {ranges.map((range, rangeIndex) => {
              const rangePercent = safePercentage(range.value, 0, max);
              return (
                <Box
                  key={rangeIndex}
                  sx={{
                    width: `${rangePercent}%`,
                    height: '100%',
                    backgroundColor: range.color || theme.palette.grey[rangeShades[rangeIndex % rangeShades.length]],
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
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              '&:hover': onBarClick ? {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scaleY(1.1)'
              } : {}
            }}
            onClick={onBarClick ? () => onBarClick(item, index) : undefined}
            role={onBarClick ? 'button' : undefined}
            tabIndex={onBarClick ? 0 : undefined}
            aria-label={`${formatLabel(name)}: ${formatValue(value)}`}
            onKeyDown={onBarClick ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onBarClick(item, index);
              }
            } : undefined}
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
              title={`${t('chartCommon.target')}: ${formatValue(target)}`}
            />
          )}
        </Box>
        {/* Legend */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{
            color: "text.secondary"
          }}>
            {t('chartCommon.current')}: {formatValue(value)}
          </Typography>
          {showTarget && (
            <Typography variant="caption" sx={{
              color: "error.main"
            }}>
              {t('chartCommon.target')}: {formatValue(target)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderVerticalBullet = (item: object, index: number) => {
    const value = getChartNumber(item, valueKey);
    const target = getChartNumber(item, targetKey);
    const configuredMax = getChartNumber(item, maxKey);
    const max = configuredMax > 0
      ? configuredMax
      : getSafeScaleMax(Math.abs(value), Math.abs(target)) * 1.2;
    const ranges = getRanges(item, rangesKey);
    const name = getChartValue(item, nameKey) || `Item ${index + 1}`;

    const valuePercent = safePercentage(value, 0, max);
    const targetPercent = safePercentage(target, 0, max);

    return (
      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
        {/* Chart */}
        <Box sx={{ position: 'relative', width: 60, height: 200, mb: 2 }}>
          {/* Background ranges */}
          <Box sx={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
            {ranges.map((range, rangeIndex) => {
              const rangePercent = safePercentage(range.value, 0, max);
              return (
                <Box
                  key={rangeIndex}
                  sx={{
                    height: `${rangePercent}%`,
                    width: '100%',
                    backgroundColor: range.color || theme.palette.grey[rangeShades[rangeIndex % rangeShades.length]],
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
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              '&:hover': onBarClick ? {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scaleX(1.1)'
              } : {}
            }}
            onClick={onBarClick ? () => onBarClick(item, index) : undefined}
            role={onBarClick ? 'button' : undefined}
            tabIndex={onBarClick ? 0 : undefined}
            aria-label={`${formatLabel(name)}: ${formatValue(value)}`}
            onKeyDown={onBarClick ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onBarClick(item, index);
              }
            } : undefined}
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
              title={`${t('chartCommon.target')}: ${formatValue(target)}`}
            />
          )}
        </Box>
        {/* Labels */}
        {showLabels && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "medium",
                mb: 0.5
              }}>
              {formatLabel(name)}
            </Typography>
            <Typography variant="caption" sx={{
              color: "text.secondary"
            }}>
              {formatValue(value)}
            </Typography>
            {showTarget && (
              <Typography
                variant="caption"
                sx={{
                  color: "error.main",
                  display: 'block'
                }}>
                {t('chartCommon.target')}: {formatValue(target)}
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
      dataCount={data.length}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default BulletChart;
