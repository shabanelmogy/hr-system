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
import { formatDisplayDate } from "@/shared/utils/dateUtils";
import type { ChartContainerProps } from "./ChartContainer";
import type { ChartInteractionHandler, TimelineChartBaseProps } from "./types";
import { getChartValue } from "./types";

export type SimpleTimelineChartProps = TimelineChartBaseProps &
  Omit<ChartContainerProps, keyof TimelineChartBaseProps | "children"> & {
    showDates?: boolean;
  };

const toDateValue = (value: unknown): string | number | Date | null =>
  typeof value === "string" || typeof value === "number" || value instanceof Date ? value : null;

const SimpleTimelineChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  loading = false,
  error,
  gradient = false,
  showDates = true,
  showConnectors = true,
  dateKey = "date",
  titleKey = "title",
  descriptionKey = "description",
  statusKey = "status",
  valueKey = "value",
  formatValue = formatNumber,
  formatDate = formatDisplayDate,
  onItemClick,
  ...props
}: SimpleTimelineChartProps) => {
  const theme = useTheme();

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string): string => {
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

  const handleItemClick: ChartInteractionHandler = (item, index) => {
    onItemClick?.(item, index);
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
          const status = String(getChartValue(item, statusKey) || "default");
          const dateValue = toDateValue(getChartValue(item, dateKey));
          const itemValue = getChartValue(item, valueKey);
          const category = getChartValue(item, "category");
          const priority = getChartValue(item, "priority");
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
                  {showDates && dateValue !== null && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mb: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}>
                      {formatDate(dateValue)}
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
                      {String(getChartValue(item, titleKey) ?? '')}
                    </Typography>

                    {/* Description */}
                    {getChartValue(item, descriptionKey) != null && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mb: 1.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.4
                        }}>
                        {String(getChartValue(item, descriptionKey))}
                      </Typography>
                    )}

                    {/* Value */}
                    {itemValue != null && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={formatValue(itemValue)}
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

                      {category != null && (
                        <Chip
                          label={String(category)}
                          size="small"
                          variant="outlined"
                        />
                      )}

                      {priority != null && (
                        <Chip
                          label={String(priority)}
                          size="small"
                          variant="outlined"
                          color={
                            priority === "high"
                              ? "error"
                              : priority === "medium"
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
