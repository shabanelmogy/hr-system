"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ContextBadge, type ContextBadgeTone } from "./ContextBadge";

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
  /** Value displayed while no item is selected. */
  emptyLabel?: string;
  /** Optional trigger icon. The selected item's icon is used when omitted. */
  icon?: ReactNode;
  /** Reduces the trigger width for dense toolbar layouts. */
  compact?: boolean;
  /** Shows only the icon while preserving the full accessible name. */
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  tone?: ContextBadgeTone;
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
  emptyLabel,
  icon,
  compact = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  error = false,
  tone = "primary",
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

  const handleChange = async (nextValue: TValue) => {
    closeMenu();
    if (Object.is(nextValue, value)) return;
    await onChange(nextValue);
  };

  return (
    <>
      <ContextBadge
        compact={compact}
        disabled={disabled}
        error={error}
        expandable={canOpen}
        expanded={Boolean(anchorEl)}
        icon={selectedIcon}
        iconOnly={iconOnly}
        label={label}
        loading={loading}
        onClick={canOpen ? openMenu : undefined}
        tone={tone}
        value={selected?.label ?? emptyLabel ?? label}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 240, maxWidth: 360, borderRadius: 2 } } }}
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
