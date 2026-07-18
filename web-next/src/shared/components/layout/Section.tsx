import { alpha, Box, Typography, useTheme } from "@mui/material";
import { useId, type ReactNode } from "react";

type SectionProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
};

const Section = ({ children, title, subtitle, actions }: SectionProps) => {
  const theme = useTheme();
  const headingId = useId();
  const hasTitle = Boolean(title);
  const hasHeader = hasTitle || Boolean(subtitle) || Boolean(actions);

  return (
    <Box
      component="section"
      dir={theme.direction}
      aria-labelledby={hasTitle ? headingId : undefined}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        position: "relative",
        background: `linear-gradient(180deg, ${alpha(
          theme.palette.primary.main,
          0.04
        )} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 10px 30px ${alpha(theme.palette.common.black, 0.4)}`
            : `0 10px 30px ${alpha(theme.palette.primary.main, 0.12)}`,
        overflow: "hidden",
      }}
    >
      {hasHeader && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            minWidth: 0,
            mb: title || subtitle ? 1.5 : 0,
          }}
        >
          {(title || subtitle) && (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {title && (
                <Typography id={headingId} component="h2" variant="h6" sx={{ fontWeight: 800 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography component="p" variant="body2" sx={{ color: "text.secondary" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
          {actions && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default Section;
