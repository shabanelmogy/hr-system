import React from "react";
import { IconButton, Stack, Tooltip, alpha, useTheme } from "@mui/material";
import AuthorizeView from "@/shared/components/auth/authorizeView";

// CardActionsRow: row of action icon buttons with common styling and optional permissions
export interface CardActionItem {
  key: string;
  title: string;
  color: "primary" | "secondary" | "success" | "info" | "warning" | "error";
  icon: React.ReactNode;
  onClick: () => void;
  requiredPermissions?: string[];
}

export const CardActionsRow: React.FC<{ actions: CardActionItem[] }> = ({ actions }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1}>
      {actions.map((action) => {
        const button = (
          <Tooltip key={action.key} title={action.title} arrow>
            <IconButton
              size="small"
              color={action.color}
              onClick={action.onClick}
              sx={{
                bgcolor: alpha(theme.palette[action.color].main, 0.1),
                border: `1px solid ${alpha(theme.palette[action.color].main, 0.2)}`,
                "&:hover": {
                  bgcolor: alpha(theme.palette[action.color].main, 0.2),
                  transform: "scale(1.1)",
                  borderColor: theme.palette[action.color].main,
                },
              }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        );

        if (action.requiredPermissions && action.requiredPermissions.length > 0) {
          return (
            <AuthorizeView key={action.key} requiredPermissions={action.requiredPermissions}>
              {button}
            </AuthorizeView>
          );
        }
        return button;
      })}
    </Stack>
  );
};
