import type { ReactNode } from "react";
import { Box, Divider, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface FormSectionProps {
  title: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  divider?: boolean;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

export function FormSection({
  title,
  children,
  description,
  icon,
  action,
  divider = true,
  sx,
  contentSx,
}: FormSectionProps) {
  return (
    <Box
      component="section"
      sx={[{ display: "grid", gap: 2 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        {icon ? (
          <Box
            sx={{
              width: 38,
              height: 38,
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Box>
      <Box sx={contentSx}>{children}</Box>
      {divider ? <Divider /> : null}
    </Box>
  );
}
