import { 
  Box, 
  Typography, 
  useTheme, 
  Paper,
  Chip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { 
  CheckCircle, 
  RadioButtonUnchecked, 
  Warning, 
  Error as ErrorIcon,
  Info
} from '@mui/icons-material';
import { formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';
import { formatDisplayDate } from '@/shared/utils/dateUtils';
import type { ChartContainerProps } from './ChartContainer';
import type { ChartInteractionHandler, TimelineChartBaseProps } from './types';
import { getChartValue } from './types';

export type TimelineChartProps = TimelineChartBaseProps &
  Omit<ChartContainerProps, keyof TimelineChartBaseProps | 'children'> & {
    showOppositeContent?: boolean;
  };

const toDateValue = (value: unknown): string | number | Date | null =>
  typeof value === 'string' || typeof value === 'number' || value instanceof Date ? value : null;

const TimelineChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  loading = false,
  error,
  gradient = false,
  showOppositeContent = true,
  showConnectors = true,
  dateKey = 'date',
  titleKey = 'title',
  descriptionKey = 'description',
  statusKey = 'status',
  valueKey = 'value',
  formatValue = formatNumber,
  formatDate = formatDisplayDate,
  onItemClick,
  ...props
}: TimelineChartProps) => {
  const theme = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'error':
      case 'failed':
        return <ErrorIcon />;
      case 'info':
        return <Info />;
      default:
        return <RadioButtonUnchecked />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
      case 'failed':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[400];
    }
  };

  const handleItemClick: ChartInteractionHandler = (item, index) => {
    onItemClick?.(item, index);
  };

  const chartContent = (
    <Box sx={{ p: 2 }}>
      <Timeline position="alternate">
        {data.map((item, index) => {
          const status = String(getChartValue(item, statusKey) || 'default');
          const dateValue = toDateValue(getChartValue(item, dateKey));
          const itemValue = getChartValue(item, valueKey);
          const category = getChartValue(item, 'category');
          const priority = getChartValue(item, 'priority');
          const statusColor = getStatusColor(status);
          const isLast = index === data.length - 1;

          return (
            <TimelineItem key={index}>
              {/* Opposite content (date/time) */}
              {showOppositeContent && (
                <TimelineOppositeContent
                  align={index % 2 === 0 ? 'right' : 'left'}
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    m: 'auto 0',
                    flex: 0.3,
                    minWidth: 100
                  }}>
                  {dateValue !== null && formatDate(dateValue)}
                  {itemValue != null && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={formatValue(itemValue)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </TimelineOppositeContent>
              )}
              {/* Separator with dot and connector */}
              <TimelineSeparator>
                <TimelineDot 
                  sx={{ 
                    backgroundColor: statusColor,
                    color: theme.palette.getContrastText(statusColor),
                    cursor: onItemClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': onItemClick ? {
                      transform: 'scale(1.2)',
                      boxShadow: `0 0 0 4px ${statusColor}20`
                    } : {}
                  }}
                  onClick={() => handleItemClick(item, index)}
                >
                  {getStatusIcon(status)}
                </TimelineDot>
                {showConnectors && !isLast && (
                  <TimelineConnector 
                    sx={{ 
                      backgroundColor: theme.palette.divider,
                      width: 2
                    }} 
                  />
                )}
              </TimelineSeparator>
              {/* Main content */}
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    cursor: onItemClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': onItemClick ? {
                      elevation: 3,
                      borderColor: statusColor,
                      transform: 'translateY(-1px)'
                    } : {}
                  }}
                  onClick={() => handleItemClick(item, index)}
                >
                  {/* Title */}
                  <Typography 
                    variant="h6" 
                    component="h3"
                    sx={{ 
                      color: statusColor,
                      fontWeight: 'bold',
                      mb: 1
                    }}
                  >
                    {String(getChartValue(item, titleKey) ?? '')}
                  </Typography>

                  {/* Description */}
                  {getChartValue(item, descriptionKey) != null && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 1
                      }}>
                      {String(getChartValue(item, descriptionKey))}
                    </Typography>
                  )}

                  {/* Additional metadata */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    <Chip
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      size="small"
                      sx={{
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                        fontWeight: 'bold'
                      }}
                    />
                    
                    {category != null && (
                      <Chip
                        label={String(category)}
                        size="small"
                        variant="outlined"
                      />
                    )}

                    {priority != null && (
                      <Chip
                        label={`Priority: ${String(priority)}`}
                        size="small"
                        variant="outlined"
                        color={priority === 'high' ? 'error' :
                               priority === 'medium' ? 'warning' : 'default'}
                      />
                    )}
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
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

export default TimelineChart;
