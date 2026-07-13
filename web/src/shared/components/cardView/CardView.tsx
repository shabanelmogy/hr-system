import {
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  Fade,
  Typography,
  alpha,
  useTheme
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { ReactNode } from "react";

export interface CardViewProps {
  index?: number; // for staggered Fade
  highlighted?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // Visual customization
  height?: number | string;
  barColor?: string; // top bar color when not highlighted
  sx?: SxProps<Theme>;

  // Content slots
  title: ReactNode;
  subtitle?: ReactNode;
  topRightBadge?: ReactNode; // e.g., quality chip
  leftBadge?: ReactNode;      // e.g., NEW chip
  chips?: ReactNode;          // e.g., code chips
  content?: ReactNode;        // main body content
  footer?: ReactNode;         // actions/footer area
}

const CardView: React.FC<CardViewProps> = ({
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
  topRightBadge,
  leftBadge,
  chips,
  content,
  footer,
}) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;
  const resolvedBar = highlighted ? success : (barColor || primary);

  return (
    <Fade in={true} style={{ transitionDelay: `${index * 50}ms` }}>
      <Card
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          height: height,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
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
        {/* Top Right Badge */}
        {topRightBadge && (
          <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
            {topRightBadge}
          </Box>
        )}

        {/* Left Badge (e.g., NEW) */}
        {leftBadge && (
          <Box sx={{ position: "absolute", top: 12, left: 50, zIndex: 3 }}>
            {leftBadge}
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
                color="text.secondary"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
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

        {/* Footer/Actions */}
        {footer && (
          <CardActions sx={{ justifyContent: "end", px: 2, py: 1.5, minHeight: 64, alignItems: "center" }}>
            {footer}
          </CardActions>
        )}
      </Card>
    </Fade>
  );
};

export default CardView;