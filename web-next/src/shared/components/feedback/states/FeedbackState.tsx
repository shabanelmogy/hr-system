import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface FeedbackStateProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  sx?: SxProps<Theme>;
  role?: "status" | "alert";
}

export function FeedbackState({
  icon,
  title,
  description,
  actions,
  children,
  sx,
  role = "status",
}: FeedbackStateProps) {
  const rootSx = [
    {
      minHeight: 200,
      px: 3,
      py: 5,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
    ...(Array.isArray(sx) ? sx : [sx]),
  ];

  return (
    <Box component="section" role={role} sx={rootSx}>
      <Box
        aria-hidden="true"
        sx={{
          width: 56,
          height: 56,
          mb: 2,
          display: "grid",
          placeItems: "center",
          borderRadius: 2,
          bgcolor: "action.hover",
          color: "primary.main",
          "& .MuiSvgIcon-root": { fontSize: 32 },
        }}
      >
        {icon}
      </Box>

      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {description && (
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ mt: 0.75, maxWidth: 560, lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      )}

      {children}

      {actions && (
        <Box
          sx={{
            mt: 2.5,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
