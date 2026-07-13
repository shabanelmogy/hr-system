/* eslint-disable react/prop-types */
import {
  CheckCircle,
  Error as ErrorIcon,
  Info,
  RadioButtonUnchecked,
  Warning,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ChartContainer from "./ChartContainer";
import { formatNumber } from "./chartUtils";

const SimpleTimelineChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  loading = false,
  error = null,
  gradient = false,
  showDates = true,
  showConnectors = true,
  dateKey = "date",
  titleKey = "title",
  descriptionKey = "description",
  statusKey = "status",
  valueKey = "value",
  formatValue = (value) => formatNumber(value),
  formatDate = (date) => new Date(date).toLocaleDateString(),
  onItemClick = null,
  ...props
}) => {
  const theme = useTheme();

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return <CheckCircle />;
      case "warning":
        return <Warning />;
      case "error":
      case "failed":
        return <ErrorIcon />;
      case "info":
        return <Info />;
      default:
        return <RadioButtonUnchecked />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "success":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "error":
      case "failed":
        return theme.palette.error.main;
      case "info":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[400];
    }
  };

  const handleItemClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const chartContent = (
    <Box
      sx={{
        p: 2,
        maxHeight: height - 30, // Account for container padding and title
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.grey[100],
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.grey[400],
          borderRadius: "3px",
          "&:hover": {
            backgroundColor: theme.palette.grey[600],
          },
        },
      }}
    >
      <Stack spacing={2}>
        {data.map((item, index) => {
          const status = item[statusKey] || "default";
          const statusColor = getStatusColor(status);
          const isLast = index === data.length - 1;

          return (
            <Box key={index} sx={{ position: "relative" }}>
              {/* Timeline Item */}
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                {/* Status Avatar */}
                <Avatar
                  sx={{
                    backgroundColor: statusColor,
                    color: theme.palette.getContrastText(statusColor),
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    cursor: onItemClick ? "pointer" : "default",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": onItemClick
                      ? {
                          transform: "scale(1.1)",
                          boxShadow: `0 0 0 4px ${statusColor}20`,
                        }
                      : {},
                  }}
                  onClick={() => handleItemClick(item, index)}
                >
                  {getStatusIcon(status)}
                </Avatar>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  {/* Date */}
                  {showDates && item[dateKey] && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formatDate(item[dateKey])}
                    </Typography>
                  )}

                  {/* Main Content Card */}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      cursor: onItemClick ? "pointer" : "default",
                      transition: "all 0.2s ease-in-out",
                      border: `1px solid ${theme.palette.divider}`,
                      borderLeft: `4px solid ${statusColor}`,
                      overflow: "hidden",
                      "&:hover": onItemClick
                        ? {
                            elevation: 3,
                            borderColor: statusColor,
                            transform: "translateY(-1px)",
                          }
                        : {},
                    }}
                    onClick={() => handleItemClick(item, index)}
                  >
                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      component="h3"
                      sx={{
                        color: statusColor,
                        fontWeight: "bold",
                        mb: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item[titleKey]}
                    </Typography>

                    {/* Description */}
                    {item[descriptionKey] && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.4,
                        }}
                      >
                        {item[descriptionKey]}
                      </Typography>
                    )}

                    {/* Value */}
                    {item[valueKey] && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={formatValue(item[valueKey])}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {/* Metadata */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        "& .MuiChip-root": {
                          fontSize: "0.7rem",
                          height: "20px",
                        },
                      }}
                    >
                      <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        size="small"
                        sx={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          fontWeight: "bold",
                        }}
                      />

                      {item.category && (
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                        />
                      )}

                      {item.priority && (
                        <Chip
                          label={`${item.priority}`}
                          size="small"
                          variant="outlined"
                          color={
                            item.priority === "high"
                              ? "error"
                              : item.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                        />
                      )}
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* Connector Line */}
              {showConnectors && !isLast && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 19, // Center of smaller avatar
                    top: 40,
                    bottom: -16,
                    width: 2,
                    backgroundColor: theme.palette.divider,
                    zIndex: 0,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
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

export default SimpleTimelineChart;
