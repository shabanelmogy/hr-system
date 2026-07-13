// shared/components/DataGridCellRenderers.jsx
import { AttachMoney, Flag, Phone, PersonOff, Person, Lock, LockOpen } from "@mui/icons-material";
import { Avatar, Box, Chip, Typography } from "@mui/material";
import dayjs from "dayjs";

// Country name renderer with optional flag
export const renderCountryName =
  (showFlag = true) =>
    (params) => {
      if (!params.value) return "";

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: 1,
          }}
        >
          {showFlag && <Flag sx={{ fontSize: 16, color: "primary.main" }} />}
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      );
    };

// Corrected version
export const renderDate = (params) => {
  if (!params) return "";
  return dayjs(params).format("YYYY-MM-DD"); // Example format
};


export const renderDateTime = (params) => {
  if (!params) return "";
  return dayjs(params).format("YYYY-MM-DD HH:mm:ss"); // Example format
};

// Phone code renderer
export const renderPhoneCode = (params) => {
  if (!params.value) return "";
  return (
    <Chip
      label={`+${params.value}`}
      size="small"
      variant="outlined"
      color="primary"
      sx={{ p: 0.5 }}
      icon={<Phone sx={{ fontSize: 12 }} />}
    />
  );
};

// Currency code renderer
export const renderCurrencyCode = (params) => {
  if (!params.value) return "";
  return (
    <Chip
      label={params.value}
      size="small"
      variant="filled"
      color="secondary"
      icon={<AttachMoney sx={{ fontSize: 12 }} />}
    />
  );
};

// Alpha code renderer (for country codes)
export const renderAlphaCode = (params) => {
  if (!params?.value) return "";
  return (
    <Chip
      label={params.value}
      size="small"
      variant="outlined"
      color="secondary"
      sx={{
        fontFamily: "monospace",
        fontWeight: "bold",
        letterSpacing: 1,
      }}
    />
  );
};

// State name renderer (Arabic or English based on flag)
export const renderStateName = (isArabic = false) => (params) => {
  const name = isArabic ? params.row?.nameAr : params.row?.nameEn;
  return (
    <div style={{ fontWeight: 500, textAlign: "center" }}>
      {name || "-"}
    </div>
  );
};

// Country info renderer (English on top, Arabic below)
export const renderCountryInfo = (params) => {
  const country = params.row?.country || params.value;
  if (!country) return "-";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 500 }}>{country.nameEn}</div>
      <div style={{ fontSize: "0.8em", color: "#666" }}>{country.nameAr}</div>
    </div>
  );
};

// List renderer with customizable options
export const renderList = (options = {}) => (params) => {
  if (!params.value || !Array.isArray(params.value) || params.value.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {options.emptyText || "No items"}
      </Typography>
    );
  }

  const {
    displayType = "chips", // "chips", "text", "badges", "tags"
    maxItems = 3,
    colorMap = {},
    defaultColor = "primary",
    variant = "outlined",
    size = "small",
    separator = ", ",
    showCount = true,
    chipProps = {},
  } = options;

  const items = params.value;
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;
  const remainingCount = items.length - visibleItems.length;

  // Get color for item based on colorMap or default
  const getItemColor = (item) => {
    return colorMap[item] || defaultColor;
  };

  if (displayType === "chips") {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
        {visibleItems.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size={size}
            variant={variant}
            color={getItemColor(item)}
            {...chipProps}
          />
        ))}
        {remainingCount > 0 && showCount && (
          <Chip
            label={`+${remainingCount}`}
            size={size}
            variant="outlined"
            color="default"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>
    );
  }

  if (displayType === "badges") {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
        {visibleItems.map((item, index) => (
          <Chip
            key={index}
            label={item}
            size={size}
            variant="filled"
            color={getItemColor(item)}
            sx={{
              borderRadius: '12px',
              fontSize: '0.75rem',
              ...chipProps?.sx
            }}
            {...chipProps}
          />
        ))}
        {remainingCount > 0 && showCount && (
          <Typography variant="caption" color="text.secondary">
            +{remainingCount} more
          </Typography>
        )}
      </Box>
    );
  }

  if (displayType === "tags") {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
        {visibleItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: `${getItemColor(item)}.light`,
              color: `${getItemColor(item)}.contrastText`,
              fontSize: '0.75rem',
              fontWeight: 'medium',
            }}
          >
            {item}
          </Box>
        ))}
        {remainingCount > 0 && showCount && (
          <Typography variant="caption" color="text.secondary">
            +{remainingCount}
          </Typography>
        )}
      </Box>
    );
  }

  // Default to text display
  const displayText = visibleItems.join(separator);
  const suffix = remainingCount > 0 && showCount ? ` (+${remainingCount} more)` : '';

  return (
    <Typography
      variant="body2"
      noWrap
      title={items.join(separator)} // Show full list on hover
      sx={{ maxWidth: '100%' }}
    >
      {displayText}{suffix}
    </Typography>
  );
};

// Specific renderer for roles (commonly used)
export const renderRoles = (params) => {
  return renderList({
    displayType: "chips",
    maxItems: 2,
    colorMap: {
      admin: "error",
      manager: "warning",
      user: "primary",
      editor: "info",
      viewer: "secondary"
    },
    variant: "outlined",
    showCount: true,
  })(params);
};

// Specific renderer for tags/categories
export const renderTags = (params) => {
  return renderList({
    displayType: "tags",
    maxItems: 3,
    defaultColor: "info",
    showCount: true,
  })(params);
};

// Specific renderer for permissions
export const renderPermissions = (params) => {
  return renderList({
    displayType: "badges",
    maxItems: 2,
    size: "small",
    defaultColor: "secondary",
    showCount: true,
  })(params);
};

// Status renderer
export const renderStatus = (t) => (params) => {
  if (!params.value) return "";

  const statusColors = {
    active: "success",
    inactive: "error",
    pending: "warning",
    draft: "info",
  };

  return (
    <Chip
      label={t ? t(`status.${params.value}`) : params.value}
      size="small"
      color={statusColors[params.value] || "default"}
      variant="filled"
    />
  );
};

// User Disabled Status Renderer
export const renderDisabledStatus = (t) => (params) => {
  const isDisabled = params.value;

  if (isDisabled === true) {
    return (
      <Chip
        label={t ? t("users.disabled") : "Disabled"}
        color="error"
        variant="filled"
        size="small"
        icon={<PersonOff sx={{ fontSize: 16 }} />}
      />
    );
  }

  return (
    <Chip
      label={t ? t("users.enabled") : "Enabled"}
      color="success"
      variant="outlined"
      size="small"
      icon={<Person sx={{ fontSize: 16 }} />}
    />
  );
};

// User Locked Status Renderer
export const renderLockedStatus = (t) => (params) => {
  const isLocked = params.value;

  if (isLocked === true) {
    return (
      <Chip
        label={t ? t("users.locked") : "Locked"}
        color="warning"
        variant="filled"
        size="small"
        icon={<Lock sx={{ fontSize: 16 }} />}
      />
    );
  }

  return (
    <Chip
      label={t ? t("users.unlocked") : "Unlocked"}
      color="info"
      variant="outlined"
      size="small"
      icon={<LockOpen sx={{ fontSize: 16 }} />}
    />
  );
};

// Combined User Status Renderer (shows most critical status)
export const renderUserStatus = (t) => (params) => {
  const { isDisabled, isLocked } = params.row;

  // Priority: Disabled status first, then locked status
  if (isDisabled === true) {
    return (
      <Chip
        label={t ? t("users.disabled") : "Disabled"}
        color="error"
        variant="filled"
        size="small"
        icon={<PersonOff sx={{ fontSize: 16 }} />}
      />
    );
  }

  if (isLocked === true) {
    return (
      <Chip
        label={t ? t("users.locked") : "Locked"}
        color="warning"
        variant="filled"
        size="small"
        icon={<Lock sx={{ fontSize: 16 }} />}
      />
    );
  }

  // User is active (not disabled and not locked)
  return (
    <Chip
      label={t ? t("users.active") : "Active"}
      color="success"
      variant="filled"
      size="small"
      icon={<Person sx={{ fontSize: 16 }} />}
    />
  );
};

// Date formatter
export const formatDate = (dateFormat) => (params) => {
  if (!params?.value) return "";
  try {
    return dayjs(params.value).format(dateFormat);
  } catch (error) {
    console.warn("Invalid date format:", params.value);
    return "Invalid Date";
  }
};

// Boolean renderer
export const renderBoolean = (params) => {
  if (params.value === null || params.value === undefined) return "";
  return (
    <Chip
      label={params.value ? "Yes" : "No"}
      size="small"
      color={params.value ? "success" : "error"}
      variant="outlined"
    />
  );
};

// Avatar renderer (for user names with initials)
export const renderAvatar = (params) => {
  if (!params.value) return "";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
        {getInitials(params.value)}
      </Avatar>
      <Typography variant="body2" noWrap>
        {params.value}
      </Typography>
    </Box>
  );
};

// Number formatter with custom options
export const renderNumber =
  (options = {}) =>
    (params) => {
      if (!params.value && params.value !== 0) return "";

      const {
        decimals = 0,
        prefix = "",
        suffix = "",
        thousandSeparator = ",",
      } = options;

      const formatted = Number(params.value)
        .toFixed(decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

      return `${prefix}${formatted}${suffix}`;
    };

// Email renderer with mailto link
export const renderEmail = (params) => {
  if (!params.value) return "";
  return (
    <Typography
      variant="body2"
      component="a"
      href={`mailto:${params.value}`}
      sx={{
        color: "primary.main",
        textDecoration: "none",
        "&:hover": { textDecoration: "underline" },
      }}
    >
      {params.value}
    </Typography>
  );
};

// URL renderer with external link
export const renderUrl = (params) => {
  if (!params.value) return "";
  return (
    <Typography
      variant="body2"
      component="a"
      href={params.value}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        color: "primary.main",
        textDecoration: "none",
        "&:hover": { textDecoration: "underline" },
      }}
    >
      {params.value}
    </Typography>
  );
};

// Progress bar renderer
export const renderProgress = (params) => {
  if (!params.value && params.value !== 0) return "";

  const value = Math.min(Math.max(params.value, 0), 100);

  return (
    <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: "100%",
          height: 8,
          bgcolor: "grey.300",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${value}%`,
            height: "100%",
            bgcolor:
              value < 30
                ? "error.main"
                : value < 70
                  ? "warning.main"
                  : "success.main",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ minWidth: 35 }}>
        {value}%
      </Typography>
    </Box>
  );
};