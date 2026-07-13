/* eslint-disable react/prop-types */
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Grid,
  Divider,
  Chip,
  Skeleton,
  Avatar,
  LinearProgress
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { formatNumber, formatPercentage } from './chartUtils';

const StatCard = ({
  stats = [],
  title,
  subtitle,
  height = 'auto',
  loading = false,
  error = null,
  gradient = false,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  showDividers = true,
  cardElevation = 1,
  variant = 'default', // 'default', 'elevated', 'outlined', 'filled'
  size = 'medium', // 'small', 'medium', 'large'
  onClick = null,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Loading state
  if (loading) {
    return (
      <Card
        elevation={cardElevation}
        sx={{
          height: height === 'auto' ? 'auto' : height,
          borderRadius: 3,
          ...props.sx
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {title && <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />}
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} lg={columns.lg} key={index}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2, mx: 'auto' }} />
                  <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1, mx: 'auto' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        elevation={cardElevation}
        sx={{
          height: height === 'auto' ? 'auto' : height,
          borderRadius: 3,
          ...props.sx
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error Loading Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error.message || 'An unexpected error occurred'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { p: 1.5, iconSize: 24, titleVariant: 'h6', valueVariant: 'h5' };
      case 'large':
        return { p: 3, iconSize: 48, titleVariant: 'h5', valueVariant: 'h3' };
      default: // medium
        return { p: 2.5, iconSize: 36, titleVariant: 'h6', valueVariant: 'h4' };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderStat = (stat, index) => {
    const {
      label,
      value,
      unit = '',
      color = 'primary',
      icon: Icon = null,
      trend = null,
      trendDirection = null, // 'up', 'down', 'neutral'
      subtitle: statSubtitle = null,
      formatValue: customFormat = null,
      progress = null, // Progress bar value (0-100)
      description = null
    } = stat;

    const themeColor = theme.palette[color] || theme.palette.primary;
    const formatFn = customFormat || formatNumber;

    const getTrendIcon = () => {
      switch (trendDirection) {
        case 'up': return <ArrowUpward fontSize="small" />;
        case 'down': return <ArrowDownward fontSize="small" />;
        default: return <Remove fontSize="small" />;
      }
    };

    const getTrendColor = () => {
      switch (trendDirection) {
        case 'up': return theme.palette.success.main;
        case 'down': return theme.palette.error.main;
        default: return theme.palette.text.secondary;
      }
    };

    const cardStyles = {
      p: sizeStyles.p,
      textAlign: 'center',
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: 2,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: variant === 'filled'
        ? `linear-gradient(135deg, ${alpha(themeColor.main, 0.08)} 0%, ${alpha(themeColor.main, 0.04)} 100%)`
        : 'transparent',
      border: variant === 'outlined' ? `1px solid ${alpha(themeColor.main, 0.2)}` : 'none',
      '&::before': variant === 'elevated' ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${themeColor.main}, ${alpha(themeColor.main, 0.6)})`,
        borderRadius: '2px 2px 0 0'
      } : {},
      '&:hover': {
        transform: onClick ? 'translateY(-4px)' : 'translateY(-2px)',
        boxShadow: theme.shadows[8],
        '& .stat-icon': {
          transform: 'scale(1.1)',
          color: themeColor.main
        },
        '& .stat-value': {
          color: themeColor.dark || themeColor.main
        }
      }
    };

    return (
      <Grid item xs={columns.xs} sm={columns.sm} md={columns.md} lg={columns.lg} key={index}>
        <Box sx={cardStyles} onClick={() => onClick && onClick(stat, index)}>
          {/* Icon with Avatar background */}
          {Icon && (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: sizeStyles.iconSize + 16,
                  height: sizeStyles.iconSize + 16,
                  background: `linear-gradient(135deg, ${alpha(themeColor.main, 0.1)} 0%, ${alpha(themeColor.main, 0.05)} 100%)`,
                  border: `2px solid ${alpha(themeColor.main, 0.2)}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon
                  className="stat-icon"
                  sx={{
                    fontSize: sizeStyles.iconSize,
                    color: alpha(themeColor.main, 0.7),
                    transition: 'all 0.3s ease'
                  }}
                />
              </Avatar>
            </Box>
          )}

          {/* Main value with enhanced typography */}
          <Typography
            variant={sizeStyles.valueVariant}
            className="stat-value"
            sx={{
              fontWeight: 700,
              color: themeColor.main,
              mb: 0.5,
              lineHeight: 1.2,
              transition: 'color 0.3s ease',
              textShadow: isDark ? `0 0 10px ${alpha(themeColor.main, 0.3)}` : 'none'
            }}
          >
            {formatFn(value)}
            {unit && (
              <Typography
                component="span"
                variant="body2"
                sx={{
                  fontWeight: 400,
                  color: alpha(themeColor.main, 0.7),
                  ml: 0.5
                }}
              >
                {unit}
              </Typography>
            )}
          </Typography>

          {/* Label */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              mb: statSubtitle || trend || progress ? 1 : 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.75rem'
            }}
          >
            {label}
          </Typography>

          {/* Subtitle */}
          {statSubtitle && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                mb: trend || progress ? 1 : 0,
                fontSize: '0.7rem'
              }}
            >
              {statSubtitle}
            </Typography>
          )}

          {/* Progress bar */}
          {progress !== null && (
            <Box sx={{ mt: 1, mb: trend ? 1 : 0 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(Math.max(progress, 0), 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(themeColor.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${themeColor.main}, ${alpha(themeColor.main, 0.8)})`,
                    borderRadius: 3
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 0.5, color: theme.palette.text.secondary }}>
                {progress}%
              </Typography>
            </Box>
          )}

          {/* Enhanced Trend Indicator */}
          {trend !== null && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 1,
                p: 0.5,
                borderRadius: 1,
                backgroundColor: alpha(getTrendColor(), 0.08),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                minWidth: 60
              }}
            >
              <Box sx={{ color: getTrendColor(), mr: 0.5 }}>
                {getTrendIcon()}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: getTrendColor(),
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              >
                {formatPercentage(Math.abs(trend))}
              </Typography>
            </Box>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                mt: 1,
                fontSize: '0.65rem',
                lineHeight: 1.3
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Grid>
    );
  };

  return (
    <Card
      elevation={cardElevation}
      sx={{
        background: gradient
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
          : theme.palette.background.paper,
        height: height === 'auto' ? 'auto' : height,
        borderRadius: 3,
        border: variant === 'outlined' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[cardElevation + 2]
        },
        ...props.sx
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Enhanced Header */}
        {(title || subtitle) && (
          <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
            {title && (
              <Typography
                variant="h5"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 700,
                  mb: subtitle ? 1 : 0,
                  textShadow: isDark ? `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  opacity: 0.8
                }}
              >
                {subtitle}
              </Typography>
            )}
            {/* Decorative line */}
            <Box
              sx={{
                width: 60,
                height: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 1.5,
                mx: 'auto',
                mt: 2,
                opacity: 0.6
              }}
            />
          </Box>
        )}

        {/* Enhanced Stats Grid */}
        <Grid
          container
          spacing={3}
          sx={{
            '& .MuiGrid-item': {
              display: 'flex',
              justifyContent: 'center'
            }
          }}
        >
          {stats.map((stat, index) => renderStat(stat, index))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatCard;