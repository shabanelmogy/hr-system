import { Avatar, Box, Chip, Typography, type ChipProps } from "@mui/material";
import dayjs from "dayjs";
import type { ReactNode } from "react";

interface CellParams<TValue = unknown> {
  value?: TValue;
  row?: object;
}

type ListItem = string | number;

interface ListRendererOptions {
  emptyText?: string;
  displayType?: "chips" | "text" | "badges" | "tags";
  maxItems?: number;
  colorMap?: Record<string, ChipProps["color"]>;
  defaultColor?: ChipProps["color"];
  variant?: ChipProps["variant"];
  size?: ChipProps["size"];
  separator?: string;
  showCount?: boolean;
  chipProps?: Omit<ChipProps, "label">;
}

interface NumberRendererOptions {
  decimals?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
}

export const renderDate = (value: unknown): string => formatValueDate(value, "YYYY-MM-DD");

export const renderDateTime = (value: unknown): string =>
  formatValueDate(value, "YYYY-MM-DD HH:mm:ss");

export const formatDate =
  (dateFormat: string) =>
  ({ value }: CellParams): string =>
    formatValueDate(value, dateFormat);

export const renderCode = ({ value }: CellParams): ReactNode =>
  value == null || value === "" ? "" : (
    <Chip
      label={String(value)}
      size="small"
      variant="outlined"
      color="secondary"
      sx={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: 0 }}
    />
  );

export const renderList =
  ({
    emptyText = "-",
    displayType = "chips",
    maxItems = 3,
    colorMap = {},
    defaultColor = "primary",
    variant = "outlined",
    size = "small",
    separator = ", ",
    showCount = true,
    chipProps = {},
  }: ListRendererOptions = {}) =>
  function ListCell({ value }: CellParams<readonly ListItem[]>): ReactNode {
    if (!Array.isArray(value) || value.length === 0) {
      return <Typography variant="body2" color="text.secondary">{emptyText}</Typography>;
    }

    const visibleItems = maxItems > 0 ? value.slice(0, maxItems) : value;
    const remainingCount = value.length - visibleItems.length;
    const itemColor = (item: ListItem) => colorMap[String(item)] ?? defaultColor;

    if (displayType === "chips" || displayType === "badges") {
      return (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
          {visibleItems.map((item) => (
            <Chip
              {...chipProps}
              key={String(item)}
              label={String(item)}
              size={size}
              variant={displayType === "badges" ? "filled" : variant}
              color={itemColor(item)}
              sx={displayType === "badges" ? { borderRadius: 1, fontSize: "0.75rem", ...asSxRecord(chipProps.sx) } : chipProps.sx}
            />
          ))}
          {remainingCount > 0 && showCount ? (
            <Chip label={`+${remainingCount}`} size={size} variant="outlined" color="default" sx={{ fontWeight: 700 }} />
          ) : null}
        </Box>
      );
    }

    if (displayType === "tags") {
      return (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
          {visibleItems.map((item) => (
            <Chip
              key={String(item)}
              label={String(item)}
              size={size}
              color={itemColor(item)}
              variant="filled"
            />
          ))}
          {remainingCount > 0 && showCount ? <Typography variant="caption">+{remainingCount}</Typography> : null}
        </Box>
      );
    }

    const text = visibleItems.map(String).join(separator);
    const suffix = remainingCount > 0 && showCount ? ` (+${remainingCount})` : "";
    return <Typography variant="body2" noWrap title={value.map(String).join(separator)}>{text}{suffix}</Typography>;
  };

export const renderStatus =
  (translate?: (key: string) => string) =>
  function StatusCell({ value }: CellParams): ReactNode {
    const status = toText(value);
    if (!status) return "";
    const colors: Record<string, ChipProps["color"]> = {
      active: "success",
      inactive: "error",
      pending: "warning",
      draft: "info",
    };
    return (
      <Chip
        label={translate ? translate(`status.${status}`) : status}
        size="small"
        color={colors[status] ?? "default"}
      />
    );
  };

export const renderBoolean =
  (trueLabel: string, falseLabel: string) =>
  function BooleanCell({ value }: CellParams<boolean>): ReactNode {
    return value == null ? "" : (
      <Chip
        label={value ? trueLabel : falseLabel}
        size="small"
        color={value ? "success" : "error"}
        variant="outlined"
      />
    );
  };

export const renderAvatar = ({ value }: CellParams): ReactNode => {
  const name = toText(value);
  if (!name) return "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{initials}</Avatar>
      <Typography variant="body2" noWrap>{name}</Typography>
    </Box>
  );
};

export const renderNumber =
  ({ decimals = 0, locale, prefix = "", suffix = "" }: NumberRendererOptions = {}) =>
  ({ value }: CellParams): string => {
    if (value == null || value === "") return "";
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(number);
    return `${prefix}${formatted}${suffix}`;
  };

export const renderEmail = ({ value }: CellParams): ReactNode => {
  const email = toText(value);
  return email ? <Typography variant="body2" component="a" href={`mailto:${email}`} sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{email}</Typography> : "";
};

export const renderUrl = ({ value }: CellParams): ReactNode => {
  const url = getSafeHttpUrl(toText(value));
  return url ? <Typography variant="body2" component="a" href={url} target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{url}</Typography> : "";
};

export const renderProgress = ({ value }: CellParams): ReactNode => {
  if (value == null || value === "") return "";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";
  const progress = Math.min(Math.max(numericValue, 0), 100);
  return (
    <Box
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}
    >
      <Box sx={{ width: "100%", height: 8, bgcolor: "action.disabledBackground", borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ width: `${progress}%`, height: "100%", bgcolor: progress < 30 ? "error.main" : progress < 70 ? "warning.main" : "success.main" }} />
      </Box>
      <Typography variant="caption" sx={{ minWidth: 35 }}>{progress}%</Typography>
    </Box>
  );
};

function formatValueDate(value: unknown, format: string) {
  if (value == null || value === "") return "";
  const parsed = dayjs(toDateInput(value));
  return parsed.isValid() ? parsed.format(format) : "";
}

function getSafeHttpUrl(value: string) {
  if (!value) return "";
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function asSxRecord(value: unknown): Record<string, unknown> {
  return asRecord(value) ?? {};
}

function toText(value: unknown): string {
  return value == null ? "" : String(value);
}

function toDateInput(value: unknown): string | number | Date {
  return value instanceof Date || typeof value === "string" || typeof value === "number"
    ? value
    : String(value);
}
