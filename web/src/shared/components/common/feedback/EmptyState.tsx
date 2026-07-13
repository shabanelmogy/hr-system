import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  SvgIconProps,
  Stack,
  Divider
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Inbox,
  Add,
  Refresh
} from '@mui/icons-material';

interface EmptyStateProps {
  /** The icon to display - can be a MUI icon component or custom icon */
  icon?: React.ComponentType<SvgIconProps>;
  /** Main title text */
  title: string;
  /** Subtitle or description text */
  subtitle?: string;
  /** Primary action button text */
  actionText?: string;
  /** Primary action button handler */
  onAction?: () => void;
  /** Custom action element (takes precedence over actionText/onAction) */
  action?: React.ReactNode;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Secondary action button handler */
  onSecondaryAction?: () => void;
  /** Whether to show the component in a Paper container */
  withPaper?: boolean;
  /** Custom styling for the container */
  sx?: object;
  /** Size variant for the icon */
  iconSize?: 'small' | 'medium' | 'large';
  /** Whether to show a refresh button */
  showRefresh?: boolean;
  /** Refresh button handler */
  onRefresh?: () => void;
  /** Optional list of suggestions/tips to help users get started */
  tips?: string[];
  /** Compact layout spacing */
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent = Inbox,
  title,
  subtitle,
  actionText,
  onAction,
  action,
  secondaryActionText,
  onSecondaryAction,
  withPaper = true,
  sx = {},
  iconSize = 'large',
  showRefresh = false,
  onRefresh,
  tips,
  compact = false
}) => {
  const theme = useTheme();

  const getIconSize = () => {
    switch (iconSize) {
      case 'small': return 32;
      case 'medium': return 40;
      case 'large': return 64;
      default: return 64;
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: compact ? 4 : 6,
        px: 3,
        minHeight: compact ? 160 : 200,
        ...sx
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.12)
              : alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <IconComponent
          sx={{
            fontSize: getIconSize(),
            color: theme.palette.primary.main,
            opacity: 0.9
          }}
        />
      </Box>
      
      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        {title}
      </Typography>
      
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 560, opacity: 0.9 }}
        >
          {subtitle}
        </Typography>
      )}
      
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {action ? (
          action
        ) : (
          actionText && onAction && (
            <Button
              variant="contained"
              onClick={onAction}
              startIcon={<Add />}
              sx={{ minWidth: 120 }}
            >
              {actionText}
            </Button>
          )
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
      </Stack>

      {tips && tips.length > 0 && (
        <>
          <Divider sx={{ my: 3, width: '100%', maxWidth: 560 }} />
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Suggestions
            </Typography>
            <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2, textAlign: 'left' }}>
              {tips.map((tip, idx) => (
                <Typography component="li" key={idx} variant="body2" color="text.secondary">
                  {tip}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );

  if (withPaper) {
    return (
      <Paper
        variant="outlined"
        elevation={0}
        sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.9)
            : theme.palette.grey[50],
          backgroundImage: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.06)} 0%, ${alpha(theme.palette.common.white, 0.02)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
          borderColor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.divider, 0.3)
            : theme.palette.divider,
          borderRadius: 2
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
};

export default EmptyState;