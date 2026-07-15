import {
  AttachMoney,
  Flag,
  Lock,
  LockOpen,
  Person,
  PersonOff,
  Phone,
} from "@mui/icons-material";
import { Avatar, Box, Chip, Typography, type ChipProps } from "@mui/material";
import dayjs from "dayjs";
import type { ReactNode } from "react";

interface CellParams<TValue = unknown> {
  value?: TValue;
  row?: object;
}

type Translator = (key: string) => string;
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
  prefix?: string;
  suffix?: string;
  thousandSeparator?: string;
}

export const renderCountryName =
  (showFlag = true) =>
  function CountryNameCell({ value }: CellParams): ReactNode {
    if (value == null || value === "") return "";
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 1 }}>
        {showFlag && <Flag sx={{ fontSize: 16, color: "primary.main" }} />}
        <Typography variant="body2" noWrap>{String(value)}</Typography>
      </Box>
    );
  };

export const renderDate = (value: unknown): string =>
  value == null || value === "" ? "" : dayjs(toDateInput(value)).format("YYYY-MM-DD");

export const renderDateTime = (value: unknown): string =>
  value == null || value === "" ? "" : dayjs(toDateInput(value)).format("YYYY-MM-DD HH:mm:ss");

export const renderPhoneCode = ({ value }: CellParams): ReactNode =>
  value == null || value === "" ? "" : (
    <Chip label={`+${String(value)}`} size="small" variant="outlined" color="primary" sx={{ p: 0.5 }} icon={<Phone sx={{ fontSize: 12 }} />} />
  );

export const renderCurrencyCode = ({ value }: CellParams): ReactNode =>
  value == null || value === "" ? "" : (
    <Chip label={String(value)} size="small" variant="filled" color="secondary" icon={<AttachMoney sx={{ fontSize: 12 }} />} />
  );

export const renderAlphaCode = ({ value }: CellParams): ReactNode =>
  value == null || value === "" ? "" : (
    <Chip label={String(value)} size="small" variant="outlined" color="secondary" sx={{ fontFamily: "monospace", fontWeight: "bold", letterSpacing: 1 }} />
  );

export const renderStateName =
  (isArabic = false) =>
  function StateNameCell({ row }: CellParams): ReactNode {
    const record = asRecord(row);
    const name = record?.[isArabic ? "nameAr" : "nameEn"];
    return <div style={{ fontWeight: 500, textAlign: "center" }}>{toText(name) || "-"}</div>;
  };

export const renderCountryInfo = ({ row, value }: CellParams): ReactNode => {
  const country = asRecord(asRecord(row)?.country) ?? asRecord(value);
  if (!country) return "-";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 500 }}>{toText(country.nameEn)}</div>
      <div style={{ fontSize: "0.8em", color: "#666" }}>{toText(country.nameAr)}</div>
    </div>
  );
};

export const renderList =
  ({
    emptyText = "No items",
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
          {visibleItems.map((item, index) => (
            <Chip
              {...chipProps}
              key={`${String(item)}-${index}`}
              label={String(item)}
              size={size}
              variant={displayType === "badges" ? "filled" : variant}
              color={itemColor(item)}
              sx={displayType === "badges" ? { borderRadius: "12px", fontSize: "0.75rem", ...asSxRecord(chipProps.sx) } : chipProps.sx}
            />
          ))}
          {remainingCount > 0 && showCount && (
            displayType === "chips"
              ? <Chip label={`+${remainingCount}`} size={size} variant="outlined" color="default" sx={{ fontWeight: "bold" }} />
              : <Typography variant="caption" color="text.secondary">+{remainingCount} more</Typography>
          )}
        </Box>
      );
    }

    if (displayType === "tags") {
      return (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
          {visibleItems.map((item, index) => {
            const color = itemColor(item) ?? "primary";
            return <Box key={`${String(item)}-${index}`} sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: `${color}.light`, color: `${color}.contrastText`, fontSize: "0.75rem", fontWeight: "medium" }}>{String(item)}</Box>;
          })}
          {remainingCount > 0 && showCount && <Typography variant="caption" color="text.secondary">+{remainingCount}</Typography>}
        </Box>
      );
    }

    const text = visibleItems.map(String).join(separator);
    const suffix = remainingCount > 0 && showCount ? ` (+${remainingCount} more)` : "";
    return <Typography variant="body2" noWrap title={value.map(String).join(separator)} sx={{ maxWidth: "100%" }}>{text}{suffix}</Typography>;
  };

export const renderRoles = (params: CellParams<readonly ListItem[]>): ReactNode =>
  renderList({ displayType: "chips", maxItems: 2, colorMap: { admin: "error", manager: "warning", user: "primary", editor: "info", viewer: "secondary" }, variant: "outlined", showCount: true })(params);

export const renderTags = (params: CellParams<readonly ListItem[]>): ReactNode =>
  renderList({ displayType: "tags", maxItems: 3, defaultColor: "info", showCount: true })(params);

export const renderPermissions = (params: CellParams<readonly ListItem[]>): ReactNode =>
  renderList({ displayType: "badges", maxItems: 2, size: "small", defaultColor: "secondary", showCount: true })(params);

export const renderStatus = (t?: Translator) => function StatusCell({ value }: CellParams): ReactNode {
  const status = toText(value);
  if (!status) return "";
  const colors: Record<string, ChipProps["color"]> = { active: "success", inactive: "error", pending: "warning", draft: "info" };
  return <Chip label={t ? t(`status.${status}`) : status} size="small" color={colors[status] ?? "default"} variant="filled" />;
};

export const renderDisabledStatus = (t?: Translator) => function DisabledStatusCell({ value }: CellParams<boolean>): ReactNode {
  return (
  value === true
    ? <Chip label={t ? t("users.disabled") : "Disabled"} color="error" variant="filled" size="small" icon={<PersonOff sx={{ fontSize: 16 }} />} />
    : <Chip label={t ? t("users.enabled") : "Enabled"} color="success" variant="outlined" size="small" icon={<Person sx={{ fontSize: 16 }} />} />
  );
};

export const renderLockedStatus = (t?: Translator) => function LockedStatusCell({ value }: CellParams<boolean>): ReactNode {
  return (
  value === true
    ? <Chip label={t ? t("users.locked") : "Locked"} color="warning" variant="filled" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />
    : <Chip label={t ? t("users.unlocked") : "Unlocked"} color="info" variant="outlined" size="small" icon={<LockOpen sx={{ fontSize: 16 }} />} />
  );
};

export const renderUserStatus = (t?: Translator) => function UserStatusCell({ row }: CellParams): ReactNode {
  const user = asRecord(row);
  if (user?.isDisabled === true) return <Chip label={t ? t("users.disabled") : "Disabled"} color="error" variant="filled" size="small" icon={<PersonOff sx={{ fontSize: 16 }} />} />;
  if (user?.isLocked === true) return <Chip label={t ? t("users.locked") : "Locked"} color="warning" variant="filled" size="small" icon={<Lock sx={{ fontSize: 16 }} />} />;
  return <Chip label={t ? t("users.active") : "Active"} color="success" variant="filled" size="small" icon={<Person sx={{ fontSize: 16 }} />} />;
};

export const formatDate = (dateFormat: string) => ({ value }: CellParams): string => {
  if (value == null || value === "") return "";
  const formatted = dayjs(toDateInput(value));
  return formatted.isValid() ? formatted.format(dateFormat) : "Invalid Date";
};

export const renderBoolean = ({ value }: CellParams<boolean>): ReactNode =>
  value == null ? "" : <Chip label={value ? "Yes" : "No"} size="small" color={value ? "success" : "error"} variant="outlined" />;

export const renderAvatar = ({ value }: CellParams): ReactNode => {
  const name = toText(value);
  if (!name) return "";
  const initials = name.split(" ").filter(Boolean).map((word) => word[0]).join("").toUpperCase().slice(0, 2);
  return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{initials}</Avatar><Typography variant="body2" noWrap>{name}</Typography></Box>;
};

export const renderNumber =
  ({ decimals = 0, prefix = "", suffix = "", thousandSeparator = "," }: NumberRendererOptions = {}) =>
  ({ value }: CellParams): string => {
    if (value == null || value === "") return "";
    const formatted = Number(value).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    return `${prefix}${formatted}${suffix}`;
  };

export const renderEmail = ({ value }: CellParams): ReactNode => {
  const email = toText(value);
  return email ? <Typography variant="body2" component="a" href={`mailto:${email}`} sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{email}</Typography> : "";
};

export const renderUrl = ({ value }: CellParams): ReactNode => {
  const url = toText(value);
  return url ? <Typography variant="body2" component="a" href={url} target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>{url}</Typography> : "";
};

export const renderProgress = ({ value }: CellParams): ReactNode => {
  if (value == null || value === "") return "";
  const progress = Math.min(Math.max(Number(value), 0), 100);
  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: "100%", height: 8, bgcolor: "grey.300", borderRadius: 1, overflow: "hidden" }}>
        <Box sx={{ width: `${progress}%`, height: "100%", bgcolor: progress < 30 ? "error.main" : progress < 70 ? "warning.main" : "success.main", transition: "width 0.3s ease" }} />
      </Box>
      <Typography variant="caption" sx={{ minWidth: 35 }}>{progress}%</Typography>
    </Box>
  );
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : undefined;
}

function asSxRecord(value: unknown): Record<string, unknown> {
  return asRecord(value) ?? {};
}

function toText(value: unknown): string {
  return value == null ? "" : String(value);
}

function toDateInput(value: unknown): string | number | Date {
  return value instanceof Date || typeof value === "string" || typeof value === "number" ? value : String(value);
}
