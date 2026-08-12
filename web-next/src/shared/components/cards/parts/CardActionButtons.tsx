import type { ReactNode } from "react";
import { IconButton, Stack, Tooltip, alpha, useTheme } from "@mui/material";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

export interface CardActionItem {
  key: string;
  title: string;
  color: "primary" | "secondary" | "success" | "info" | "warning" | "error";
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export interface CardActionButtonsProps {
  actions: readonly CardActionItem[];
}

export const CardActionButtons = ({ actions }: CardActionButtonsProps) => {
  const theme = useTheme();
  const { isReadOnly } = useAppReadOnly();

  return (
    <Stack direction="row" spacing={1}>
      {actions.map((action) => (
        <Tooltip key={action.key} title={action.title} arrow>
          <span>
            <IconButton
              aria-label={action.title}
              size="small"
              color={action.color}
              disabled={action.disabled || (isReadOnly && isWriteAction(action.key))}
              onClick={action.onClick}
              sx={{
                bgcolor: alpha(theme.palette[action.color].main, 0.1),
                border: `1px solid ${alpha(theme.palette[action.color].main, 0.2)}`,
                "&:hover": {
                  bgcolor: alpha(theme.palette[action.color].main, 0.2),
                  transform: "scale(1.1)",
                  borderColor: theme.palette[action.color].main,
                },
                "@media (prefers-reduced-motion: reduce)": {
                  transition: "none",
                  "&:hover": { transform: "none" },
                },
              }}
            >
              {action.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Stack>
  );
};

function isWriteAction(key: string) {
  return ["add", "create", "edit", "update", "delete", "remove", "save"].some(
    (action) => key.toLowerCase().includes(action),
  );
}
