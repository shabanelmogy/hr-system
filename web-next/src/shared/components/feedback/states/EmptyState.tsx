import type { ElementType, ReactNode } from "react";
import { Add as AddIcon, InboxOutlined as EmptyIcon } from "@mui/icons-material";
import { Button } from "@mui/material";
import type { SvgIconProps, SxProps, Theme } from "@mui/material";
import { FeedbackState } from "./FeedbackState";

export interface EmptyStateProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ElementType<SvgIconProps>;
  actionText?: string;
  onAction?: () => void;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export function EmptyState({
  title,
  subtitle,
  icon: Icon = EmptyIcon,
  actionText,
  onAction,
  action,
  sx,
}: EmptyStateProps) {
  const primaryAction =
    action ??
    (actionText && onAction ? (
      <Button variant="contained" onClick={onAction} startIcon={<AddIcon />}>
        {actionText}
      </Button>
    ) : null);

  return (
    <FeedbackState
      icon={<Icon />}
      title={title}
      description={subtitle}
      actions={primaryAction}
      sx={sx}
    />
  );
}

export default EmptyState;
