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
import { useTranslation } from "react-i18next";
import ChartContainer from "../charts/core/ChartContainer";
import { formatNumber } from "../charts/core/chartUtils";
import type { ChartContainerProps } from "../charts/core/ChartContainer";
import type { ChartInteractionHandler, TimelineChartBaseProps } from "../charts/core/types";

export type TimelineStatus =
  | "completed"
  | "success"
  | "warning"
  | "error"
  | "failed"
  | "info"
  | "default";

export type TimelinePriority = "high" | "medium" | "low";

export interface TimelineRecord extends Record<string, unknown> {
  id: string | number;
  date?: string | number | Date;
  title?: unknown;
  description?: unknown;
  status?: TimelineStatus | string;
  value?: unknown;
  category?: unknown;
  priority?: TimelinePriority | string;
}

type TimelineKey<TItem extends TimelineRecord> = Extract<keyof TItem, string>;
type TimelineBaseProps = Omit<
  TimelineChartBaseProps,
  | "data"
  | "dateKey"
  | "titleKey"
  | "descriptionKey"
  | "statusKey"
  | "valueKey"
  | "formatValue"
  | "formatDate"
  | "onItemClick"
>;

export type TimelineProps<TItem extends TimelineRecord = TimelineRecord> = TimelineBaseProps &
  Omit<ChartContainerProps, keyof TimelineChartBaseProps | "children"> & {
    data?: readonly TItem[];
    showDates?: boolean;
    dateKey?: TimelineKey<TItem>;
    titleKey?: TimelineKey<TItem>;
    descriptionKey?: TimelineKey<TItem>;
    statusKey?: TimelineKey<TItem>;
    valueKey?: TimelineKey<TItem>;
    formatValue?: (value: unknown) => string;
    formatDate?: (value: string | number | Date) => string;
    onItemClick?: ChartInteractionHandler<TItem>;
  };

const toDateValue = (value: unknown): string | number | Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return typeof value === "string" && value.trim() ? value : null;
};

const isTimelineStatus = (value: string): value is TimelineStatus =>
  ["completed", "success", "warning", "error", "failed", "info", "default"].includes(value);

const getItemValue = <TItem extends TimelineRecord>(
  item: TItem,
  key: TimelineKey<TItem>,
): unknown => item[key];

function Timeline<TItem extends TimelineRecord = TimelineRecord>({
  data = [],
  title,
  subtitle,
  height = 400,
  loading = false,
  error,
  gradient = false,
  showDates = true,
  showConnectors = true,
  dateKey = "date" as TimelineKey<TItem>,
  titleKey = "title" as TimelineKey<TItem>,
  descriptionKey = "description" as TimelineKey<TItem>,
  statusKey = "status" as TimelineKey<TItem>,
  valueKey = "value" as TimelineKey<TItem>,
  formatValue: formatValueProp,
  formatDate: formatDateProp,
  onItemClick,
  ...props
}: TimelineProps<TItem>) {
  const theme = useTheme();
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language ?? "en-US";
  const resolvedDateKey = dateKey as TimelineKey<TItem>;
  const resolvedTitleKey = titleKey as TimelineKey<TItem>;
  const resolvedDescriptionKey = descriptionKey as TimelineKey<TItem>;
  const resolvedStatusKey = statusKey as TimelineKey<TItem>;
  const resolvedValueKey = valueKey as TimelineKey<TItem>;
  const formatValue =
    formatValueProp ?? ((value: unknown) => formatNumber(value, locale));
  const formatDate =
    formatDateProp ?? ((value: string | number | Date) => {
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime())
        ? ""
        : new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(date);
    });

  const getStatusIcon = (status: TimelineStatus) => {
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

  const getStatusColor = (status: TimelineStatus): string => {
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

  const chartContent = (
    <Box
      sx={{
        p: 2,
        maxHeight: Math.max(0, height - 30),
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.grey[100],
          borderRadius: "3px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.grey[400],
          borderRadius: "3px",
          "&:hover": { backgroundColor: theme.palette.grey[600] },
        },
      }}
    >
      <Stack spacing={2}>
        {data.map((item, index) => {
          const rawStatus = String(
            getItemValue(item, resolvedStatusKey) ?? "default",
          ).toLowerCase();
          const status: TimelineStatus = isTimelineStatus(rawStatus)
            ? rawStatus
            : "default";
          const dateValue = toDateValue(getItemValue(item, resolvedDateKey));
          const itemValue = getItemValue(item, resolvedValueKey);
          const category = getItemValue(item, "category" as TimelineKey<TItem>);
          const priorityValue = String(
            getItemValue(item, "priority" as TimelineKey<TItem>) ?? "",
          ).toLowerCase();
          const statusColor = getStatusColor(status);
          const isLast = index === data.length - 1;
          const itemTitle = String(getItemValue(item, resolvedTitleKey) ?? "");
          const statusLabel = t(`timeline.status.${status}`, {
            defaultValue: status.charAt(0).toUpperCase() + status.slice(1),
          });
          const priorityLabel = priorityValue
            ? t(`timeline.priority.${priorityValue}`, {
                defaultValue: priorityValue,
              })
            : "";

          return (
            <Box key={String(item.id)} sx={{ position: "relative" }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Avatar
                  sx={{
                    backgroundColor: statusColor,
                    color: theme.palette.getContrastText(statusColor),
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {getStatusIcon(status)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  {showDates && dateValue !== null && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mb: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {formatDate(dateValue)}
                    </Typography>
                  )}

                  <Paper
                    component={onItemClick ? "button" : "div"}
                    type={onItemClick ? "button" : undefined}
                    elevation={1}
                    sx={{
                      width: onItemClick ? "100%" : undefined,
                      p: 1.5,
                      textAlign: "start",
                      font: "inherit",
                      color: "inherit",
                      backgroundColor: "background.paper",
                      cursor: onItemClick ? "pointer" : "default",
                      transition: "all 0.2s ease-in-out",
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                      border: `1px solid ${theme.palette.divider}`,
                      borderInlineStart: `4px solid ${statusColor}`,
                      overflow: "hidden",
                      "&:hover": onItemClick
                        ? {
                            boxShadow: theme.shadows[3],
                            borderColor: statusColor,
                            transform: "translateY(-1px)",
                          }
                        : {},
                    }}
                    aria-label={
                      onItemClick
                        ? itemTitle || t("timeline.untitled")
                        : undefined
                    }
                    onClick={
                      onItemClick ? () => onItemClick(item, index) : undefined
                    }
                  >
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
                      {itemTitle}
                    </Typography>

                    {getItemValue(item, resolvedDescriptionKey) != null && (
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
                          lineHeight: 1.4,
                        }}
                      >
                        {String(getItemValue(item, resolvedDescriptionKey))}
                      </Typography>
                    )}

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
                        label={statusLabel}
                        size="small"
                        sx={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          fontWeight: "bold",
                        }}
                      />

                      {category != null && (
                        <Chip label={String(category)} size="small" variant="outlined" />
                      )}

                      {priorityValue && (
                        <Chip
                          label={priorityLabel}
                          size="small"
                          variant="outlined"
                          color={
                            priorityValue === "high"
                              ? "error"
                              : priorityValue === "medium"
                                ? "warning"
                                : "default"
                          }
                        />
                      )}
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {showConnectors && !isLast && (
                <Box
                  sx={{
                    position: "absolute",
                    insetInlineStart: 19,
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
      dataCount={data.length}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
}

export default Timeline;
