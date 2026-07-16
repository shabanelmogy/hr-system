import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  Fade,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

export interface EntityCardProps {
  index?: number;
  highlighted?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  height?: number | string;
  barColor?: string;
  sx?: SxProps<Theme>;
  title: ReactNode;
  subtitle?: ReactNode;
  endBadge?: ReactNode;
  startBadge?: ReactNode;
  chips?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
}

const EntityCard = ({
  index = 0,
  highlighted = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
  height = 350,
  barColor,
  sx,
  title,
  subtitle,
  endBadge,
  startBadge,
  chips,
  content,
  footer,
}: EntityCardProps) => {
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const resolvedBar = highlighted ? success : (barColor || primary);

  return (
    <Fade
      in
      timeout={prefersReducedMotion ? 0 : undefined}
      style={{ transitionDelay: prefersReducedMotion ? "0ms" : `${index * 50}ms` }}
    >
      <Card
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          height: height,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.3s ease",
          background: highlighted
            ? `linear-gradient(135deg, ${alpha(success, 0.1)} 0%, ${alpha(success, 0.05)} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(primary, 0.02)} 100%)`,
          border: `1px solid ${highlighted ? success : alpha(primary, isHovered ? 0.3 : 0.1)}`,
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: `0 16px 48px ${alpha(primary, 0.2)}`,
          },
          ...(highlighted && {
            transform: "translateY(-4px) scale(1.01)",
            boxShadow: `0 12px 32px ${alpha(success, 0.3)}`,
            animation: "pulse 4s ease-in-out infinite",
            "@keyframes pulse": {
              "0%": { boxShadow: `0 12px 32px ${alpha(success, 0.3)}` },
              "50%": { boxShadow: `0 16px 40px ${alpha(success, 0.5)}` },
              "100%": { boxShadow: `0 12px 32px ${alpha(success, 0.3)}` },
            },
          }),
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            transform: "none",
            transition: "none",
            "&:hover": {
              transform: "none",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: highlighted
              ? `linear-gradient(90deg, ${success} 0%, ${theme.palette.success.dark} 100%)`
              : `linear-gradient(90deg, ${resolvedBar} 0%, ${primary} 100%)`,
            opacity: isHovered ? 1 : 0.8,
            transition: "opacity 0.3s ease",
          },
          ...sx,
        }}
      >
        {endBadge && (
          <Box sx={{ position: "absolute", top: 12, insetInlineEnd: 12, zIndex: 2 }}>
            {endBadge}
          </Box>
        )}

        {startBadge && (
          <Box sx={{ position: "absolute", top: 12, insetInlineStart: 50, zIndex: 3 }}>
            {startBadge}
          </Box>
        )}

        <CardContent sx={{ flex: 1, minHeight: 0, overflowY: "auto", pt: 4, pb: 1 }}>
          {/* Title & Subtitle */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                color: theme.palette.primary.main,
                mb: subtitle ? 0.5 : 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Chips/Meta Row */}
          {chips && (
            <Box sx={{ mb: 2 }}>
              {chips}
            </Box>
          )}

          {/* Main Content */}
          {content}
        </CardContent>

        {footer && <Divider />}

        {footer && (
          <CardActions sx={{ justifyContent: "end", px: 2, py: 1.5, minHeight: 64, alignItems: "center" }}>
            {footer}
          </CardActions>
        )}
      </Card>
    </Fade>
  );
};

export default EntityCard;
