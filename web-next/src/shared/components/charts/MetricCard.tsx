/* eslint-disable react/prop-types */
import { East, North, South } from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { formatNumber, formatPercentage } from "./chartUtils";

const MetricCard = ({
  title,
  value,
  previousValue = null,
  target = null,
  unit = "",
  icon: Icon = null,
  color = "primary",
  showTrend = true,
  showProgress = false,
  showTarget = false,
  formatValue = (value) => formatNumber(value),
  onClick = null,
  elevation = 1,
  gradient = false,
  size = "medium", // 'small', 'medium', 'large'
  variant = "default", // 'default', 'elevated', 'outlined', 'glassmorphism'
  loading = false,
  subtitle = null,
  description = null,
  badge = null, // Additional badge/count indicator
  footerContent = null, // Optional footer content (e.g., sparkline)
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Loading state
  if (loading) {
    return (
      <Card
        elevation={elevation}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          ...props.sx,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
            </Box>
            <Skeleton variant="circular" width={56} height={56} />
          </Box>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={8}
            sx={{ borderRadius: 4 }}
          />
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const trend = previousValue !== null ? value - previousValue : 0;
  const trendPercentage =
    previousValue !== null && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : 0;

  // Calculate progress towards target
  const progress = target !== null ? Math.min((value / target) * 100, 100) : 0;

  // Get trend icon and color
  const getTrendIcon = () => {
    if (trend > 0) return <North fontSize="small" />;
    if (trend < 0) return <South fontSize="small" />;
    return <East fontSize="small" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return theme.palette.success.main;
    if (trend < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  // Enhanced size configurations
  const sizeConfig = {
    small: {
      padding: 2,
      titleVariant: "body2",
      valueVariant: "h6",
      subtitleVariant: "caption",
      iconSize: 28,
      avatarSize: 44,
      badgeSize: "small",
    },
    medium: {
      padding: 3,
      titleVariant: "body1",
      valueVariant: "h4",
      subtitleVariant: "body2",
      iconSize: 36,
      avatarSize: 56,
      badgeSize: "medium",
    },
    large: {
      padding: 4,
      titleVariant: "h6",
      valueVariant: "h3",
      subtitleVariant: "body1",
      iconSize: 44,
      avatarSize: 72,
      badgeSize: "large",
    },
  };

  const config = sizeConfig[size];
  const themeColor = theme.palette[color] || theme.palette.primary;

  // Get variant-specific styles
  const getVariantStyles = () => {
    const baseStyles = {
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      borderRadius: 3,
      position: "relative",
      overflow: "hidden",
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyles,
          background: gradient
            ? `linear-gradient(135deg, ${alpha(
                themeColor.main,
                0.08
              )} 0%, ${alpha(themeColor.main, 0.04)} 100%)`
            : theme.palette.background.paper,
          boxShadow: `0 4px 20px ${alpha(themeColor.main, 0.15)}`,
          border: `1px solid ${alpha(themeColor.main, 0.1)}`,
          "&:hover": {
            transform: onClick
              ? "translateY(-6px) scale(1.02)"
              : "translateY(-2px)",
            boxShadow: `0 12px 40px ${alpha(themeColor.main, 0.25)}`,
          },
        };

      case "outlined":
        return {
          ...baseStyles,
          background: "transparent",
          border: `2px solid ${alpha(themeColor.main, 0.3)}`,
          "&:hover": {
            borderColor: themeColor.main,
            backgroundColor: alpha(themeColor.main, 0.02),
            transform: onClick ? "translateY(-2px)" : "none",
          },
        };

      case "glassmorphism":
        return {
          ...baseStyles,
          background: isDark
            ? `rgba(30, 30, 30, 0.8)`
            : `rgba(255, 255, 255, 0.8)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
          }`,
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            background: isDark
              ? `rgba(30, 30, 30, 0.9)`
              : `rgba(255, 255, 255, 0.9)`,
            transform: onClick ? "translateY(-4px)" : "translateY(-2px)",
          },
        };

      default: // 'default'
        return {
          ...baseStyles,
          background: gradient
            ? `linear-gradient(135deg, ${alpha(
                themeColor.main,
                0.05
              )} 0%, ${alpha(themeColor.main, 0.02)} 100%)`
            : theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          "&:hover": {
            borderColor: alpha(themeColor.main, 0.3),
            boxShadow: theme.shadows[4],
            transform: onClick ? "translateY(-4px)" : "translateY(-2px)",
          },
        };
    }
  };

  return (
    <Card
      elevation={variant === "elevated" ? elevation + 2 : elevation}
      sx={{
        ...getVariantStyles(),
        ...props.sx,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: config.padding, position: "relative" }}>
        {/* Badge indicator */}
        {badge && (
          <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
            <Badge
              badgeContent={badge}
              color={color === "primary" ? "primary" : "secondary"}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  minWidth: 18,
                  height: 18,
                },
              }}
            />
          </Box>
        )}

        {/* Header with icon and title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={config.titleVariant}
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                mb: subtitle ? 0.5 : 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize:
                  size === "small"
                    ? "0.75rem"
                    : size === "large"
                    ? "1rem"
                    : "0.875rem",
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant={config.subtitleVariant}
                sx={{
                  color: alpha(theme.palette.text.primary, 0.7),
                  fontWeight: 500,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {Icon && (
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: config.avatarSize,
                  height: config.avatarSize,
                  background: `linear-gradient(135deg, ${alpha(
                    themeColor.main,
                    0.15
                  )} 0%, ${alpha(themeColor.main, 0.08)} 100%)`,
                  border: `2px solid ${alpha(themeColor.main, 0.2)}`,
                  color: themeColor.main,
                  transition: "all 0.3s ease",
                  boxShadow: `0 4px 12px ${alpha(themeColor.main, 0.15)}`,
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: `0 6px 20px ${alpha(themeColor.main, 0.25)}`,
                  },
                }}
              >
                <Icon sx={{ fontSize: config.iconSize * 0.6 }} />
              </Avatar>

              {/* Pulsing effect for active metrics */}
              {variant === "elevated" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: "50%",
                    background: `linear-gradient(45deg, ${
                      themeColor.main
                    }, ${alpha(themeColor.main, 0.3)})`,
                    opacity: 0.3,
                    animation: "pulse 2s infinite",
                    "@keyframes pulse": {
                      "0%": { transform: "scale(1)", opacity: 0.3 },
                      "50%": { transform: "scale(1.1)", opacity: 0.1 },
                      "100%": { transform: "scale(1)", opacity: 0.3 },
                    },
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Main value with enhanced styling */}
        <Box
          sx={{
            mb:
              showTrend || showProgress || showTarget || description ? 2.5 : 0,
          }}
        >
          <Typography
            variant={config.valueVariant}
            sx={{
              fontWeight: 800,
              color: themeColor.main,
              lineHeight: 1.1,
              mb: 0.5,
              textShadow: isDark
                ? `0 0 20px ${alpha(themeColor.main, 0.3)}`
                : "none",
              background:
                variant === "elevated" && gradient
                  ? `linear-gradient(135deg, ${themeColor.main}, ${alpha(
                      themeColor.main,
                      0.8
                    )})`
                  : "none",
              WebkitBackgroundClip:
                variant === "elevated" && gradient ? "text" : "initial",
              WebkitTextFillColor:
                variant === "elevated" && gradient ? "transparent" : "initial",
              backgroundClip:
                variant === "elevated" && gradient ? "text" : "initial",
            }}
          >
            {formatValue(value)}
            {unit && (
              <Typography
                component="span"
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: alpha(themeColor.main, 0.8),
                  ml: 0.5,
                  fontSize:
                    size === "small"
                      ? "0.8em"
                      : size === "large"
                      ? "0.7em"
                      : "0.75em",
                }}
              >
                {unit}
              </Typography>
            )}
          </Typography>

          {description && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                lineHeight: 1.4,
                mt: 0.5,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* Enhanced Trend indicator */}
        {showTrend && previousValue !== null && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: showProgress ? 2 : 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: getTrendColor(),
                backgroundColor: alpha(getTrendColor(), 0.08),
                border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: alpha(getTrendColor(), 0.12),
                  transform: "scale(1.02)",
                },
              }}
            >
              {getTrendIcon()}
              <Typography
                variant="caption"
                sx={{
                  ml: 0.75,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {formatPercentage(Math.abs(trendPercentage))}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.7rem",
              }}
            >
              vs last period
            </Typography>
          </Box>
        )}

        {/* Enhanced Progress towards target */}
        {showProgress && target !== null && (
          <Box sx={{ mb: showTarget ? 2 : 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Progress to target
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={16}
                  thickness={4}
                  sx={{
                    color: themeColor.main,
                    "& .MuiCircularProgress-circle": {
                      strokeLinecap: "round",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: themeColor.main,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {formatPercentage(progress)}
                </Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(themeColor.main, 0.1),
                boxShadow: `inset 0 1px 3px ${alpha(
                  theme.palette.common.black,
                  0.1
                )}`,
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${
                    themeColor.main
                  }, ${alpha(themeColor.main, 0.8)})`,
                  borderRadius: 4,
                  boxShadow: `0 0 10px ${alpha(themeColor.main, 0.3)}`,
                },
              }}
            />
          </Box>
        )}

        {/* Enhanced Target chip */}
        {showTarget && target !== null && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Chip
              label={`Target: ${formatValue(target)}${unit}`}
              size={config.badgeSize}
              sx={{
                backgroundColor: alpha(themeColor.main, 0.08),
                border: `1px solid ${alpha(themeColor.main, 0.2)}`,
                color: themeColor.main,
                fontWeight: 600,
                fontSize:
                  size === "small"
                    ? "0.7rem"
                    : size === "large"
                    ? "0.85rem"
                    : "0.75rem",
                "&:hover": {
                  backgroundColor: alpha(themeColor.main, 0.12),
                },
              }}
            />
          </Box>
        )}

        {footerContent && (
          <Box sx={{ mt: 1 }}>
            {footerContent}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
