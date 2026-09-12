"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  isValidElement,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

export type ContextSwitcherValue = string | number;

export interface ContextSwitcherItem<TValue extends ContextSwitcherValue = string> {
  value: TValue;
  label: string;
  secondaryLabel?: string;
  icon?: ReactNode;
}

export interface ContextSwitcherProps<TValue extends ContextSwitcherValue = string> {
  items: readonly ContextSwitcherItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void | Promise<void>;
  /** Accessible label and tooltip for the trigger. */
  label: string;
  /** Optional heading displayed above the options. */
  menuLabel?: string;
  /** Optional trigger icon. The selected item's icon is used when omitted. */
  icon?: ReactNode;
  /** Reduces the trigger width for dense toolbar layouts. */
  compact?: boolean;
  /** Shows only the icon while preserving the full accessible name. */
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Optional item-level disabled state without taking ownership of menu state. */
  isItemDisabled?: (item: ContextSwitcherItem<TValue>) => boolean;
}

/**
 * Domain-neutral toolbar context switcher. It owns trigger/menu state while
 * callers own the selected value and side effects of changing context.
 */
export function ContextSwitcher<TValue extends ContextSwitcherValue = string>({
  items,
  value,
  onChange,
  label,
  menuLabel,
  icon,
  compact = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  isItemDisabled,
}: ContextSwitcherProps<TValue>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const selected = useMemo(
    () => items.find((item) => Object.is(item.value, value)),
    [items, value],
  );
  const canOpen = !disabled && !loading && items.length > 1;
  const closeMenu = () => setAnchorEl(null);
  const openMenu = (event: MouseEvent<HTMLElement>) => {
    if (canOpen) setAnchorEl(event.currentTarget);
  };
  const selectedIcon = icon ?? selected?.icon ?? <SwapHorizRoundedIcon />;
  const chipIcon = loading
    ? <CircularProgress size={15} />
    : isValidElement(selectedIcon)
      ? selectedIcon
      : <SwapHorizRoundedIcon />;
  const triggerLabel = selected?.label ? `${label}: ${selected.label}` : label;

  const handleChange = async (nextValue: TValue) => {
    closeMenu();
    if (Object.is(nextValue, value)) return;
    await onChange(nextValue);
  };

  const trigger = iconOnly ? (
    <IconButton
      aria-label={triggerLabel}
      aria-haspopup={canOpen ? "menu" : undefined}
      aria-expanded={canOpen ? Boolean(anchorEl) : undefined}
      disabled={disabled || loading}
      onClick={openMenu}
      size="small"
      sx={(theme) => ({
        width: 36,
        height: 36,
        color: theme.palette.text.primary,
        bgcolor: alpha(theme.palette.background.paper, 0.72),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.38)}`,
        boxShadow: theme.shadows[1],
        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
      })}
    >
      {loading ? <CircularProgress size={17} /> : selectedIcon}
    </IconButton>
  ) : (
    <Chip
      aria-label={triggerLabel}
      aria-haspopup={canOpen ? "menu" : undefined}
      aria-expanded={canOpen ? Boolean(anchorEl) : undefined}
      icon={chipIcon}
      deleteIcon={canOpen ? <ExpandMoreRoundedIcon /> : undefined}
      onClick={canOpen ? openMenu : undefined}
      onDelete={canOpen ? openMenu : undefined}
      label={selected?.label ?? label}
      size="small"
      sx={(theme) => ({
        flexShrink: 1,
        maxWidth: compact ? 112 : 210,
        height: 30,
        color: theme.palette.text.primary,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.38)}`,
        fontWeight: 700,
        boxShadow: theme.shadows[1],
        "& .MuiChip-icon": {
          color: theme.palette.primary.main,
          marginInlineStart: "7px",
          marginInlineEnd: "-3px",
        },
        "& .MuiChip-label": {
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
        "& .MuiChip-deleteIcon": {
          color: theme.palette.text.secondary,
          marginInline: "-2px 4px",
        },
      })}
    />
  );

  return (
    <>
      <Tooltip title={canOpen ? label : triggerLabel} enterDelay={500}>
        <Box component="span" sx={{ display: "inline-flex", minWidth: 0 }}>
          {trigger}
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        slotProps={{ paper: { sx: { minWidth: 240, maxWidth: 360 } } }}
      >
        {menuLabel ? (
          <Box sx={{ px: 2, py: 1, color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
            {menuLabel}
          </Box>
        ) : null}
        {items.map((item) => {
          const selectedItem = Object.is(item.value, value);
          const itemDisabled = disabled || loading || isItemDisabled?.(item) === true;
          return (
            <MenuItem
              key={String(item.value)}
              selected={selectedItem}
              disabled={itemDisabled}
              onClick={() => void handleChange(item.value)}
            >
              <ListItemIcon>
                {selectedItem ? <CheckRoundedIcon color="primary" /> : item.icon ?? selectedIcon}
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.secondaryLabel} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
