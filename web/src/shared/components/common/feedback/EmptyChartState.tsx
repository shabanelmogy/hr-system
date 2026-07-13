import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  SvgIconProps
} from '@mui/material';
import {
  BarChart,
  Add,
  Refresh,
  TrendingUp
} from '@mui/icons-material';
import { ChartContainer } from '../../charts';

interface EmptyChartStateProps {
  /** Chart title */
  title: string;
  /** Empty state message */
  message?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Icon to display in the chart header */
  chartIcon?: React.ComponentType<SvgIconProps>;
  /** Icon to display in the empty state */
  emptyIcon?: React.ComponentType<SvgIconProps>;
  /** Height of the chart container */
  height?: number;
  /** Primary action button text */
  actionText?: string;
  /** Primary action button handler */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Secondary action button handler */
  onSecondaryAction?: () => void;
  /** Whether to show refresh button */
  showRefresh?: boolean;
  /** Refresh button handler */
  onRefresh?: () => void;
  /** Custom styling for the container */
  sx?: object;
  /** Paper elevation */
  elevation?: number;
  /** Whether to use gradient background */
  gradient?: boolean;
  /** Additional actions to show in header */
  actions?: React.ReactNode;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({
  title,
  message,
  subtitle,
  chartIcon: ChartIcon = TrendingUp,
  emptyIcon: EmptyIcon = BarChart,
  height = 400,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  showRefresh = false,
  onRefresh,
  sx = {},
  elevation = 2,
  gradient = false,
  actions
}) => {
  const theme = useTheme();

  const getDefaultMessage = () => {
    if (message) return message;
    return 'No data available for chart';
  };

  const getDefaultSubtitle = () => {
    if (subtitle) return subtitle;
    return 'Add some data to see analytics and insights';
  };

  const emptyContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
        py: 4
      }}
    >
      <EmptyIcon
        sx={{
          fontSize: 64,
          color: 'text.secondary',
          mb: 2,
          opacity: 0.7
        }}
      />
      
      <Typography
        variant="h6"
        color="text.secondary"
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {getDefaultMessage()}
      </Typography>
      
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400, opacity: 0.8 }}
      >
        {getDefaultSubtitle()}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionText && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            startIcon={<Add />}
            sx={{ minWidth: 120 }}
          >
            {actionText}
          </Button>
        )}
        
        {secondaryActionText && onSecondaryAction && (
          <Button
            variant="outlined"
            onClick={onSecondaryAction}
            sx={{ minWidth: 120 }}
          >
            {secondaryActionText}
          </Button>
        )}
        
        {showRefresh && onRefresh && (
          <Button
            variant="text"
            onClick={onRefresh}
            startIcon={<Refresh />}
            sx={{ minWidth: 100 }}
          >
            Refresh
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <ChartContainer
      title={title}
      icon={ChartIcon}
      height={height}
      elevation={elevation}
      gradient={gradient}
      actions={actions}
      sx={sx}
    >
      {emptyContent}
    </ChartContainer>
  );
};

export default EmptyChartState;