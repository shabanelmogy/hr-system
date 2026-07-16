import type { KeyboardEvent, ReactNode } from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import type { CardProps } from "@mui/material/Card";

export type StatCardColor = "primary" | "secondary" | "success" | "info" | "warning" | "error";

export interface AnimatedStatCardProps extends Omit<CardProps, "color" | "onClick" | "title"> {
  icon: ReactNode;
  title: ReactNode;
  value: ReactNode;
  color?: StatCardColor;
  loading?: boolean;
  height?: number | string;
  onClick?: () => void;
}

const AnimatedStatCard = ({
  icon,
  title,
  value,
  color = "primary",
  loading = false,
  height = 120,
  onClick,
  ...cardProps
}: AnimatedStatCardProps) => {
  const theme = useTheme();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onClick();
  };

  return (
    <Card
      {...cardProps}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      sx={{
        height,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette[color].light,
          0.1
        )} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          transform: onClick ? "translateY(-4px) scale(1.02)" : undefined,
          boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.15)}`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          insetInline: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
        ...cardProps.sx,
      }}
    >
      <CardContent
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
            boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.3)}`,
          }}
        >
          {icon}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: "bold",
              color: theme.palette[color].main,
              mb: 0.5,
              background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
            {loading ? (
              <Box
                sx={{
                  width: 40,
                  height: 24,
                  backgroundColor: alpha(theme.palette[color].main, 0.1),
                  borderRadius: 1,
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                }}
              />
            ) : typeof value === "number" ? (
              value.toLocaleString("en-US")
            ) : (
              value
            )}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.primary",
              fontWeight: "medium"
            }}>
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnimatedStatCard;
