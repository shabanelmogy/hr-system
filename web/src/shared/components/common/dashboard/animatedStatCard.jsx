// components/AnimatedStatCard.jsx
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";

const AnimatedStatCard = ({
  icon,
  title,
  value,
  color = "primary",
  loading = false,
  height = 120,
  onClick,
  ...cardProps
}) => {
  const theme = useTheme();

  return (
    <Card
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
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.15)}`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.3)}`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        },
        ...cardProps.sx,
      }}
      onClick={onClick}
      {...cardProps}
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
            fontWeight="bold"
            sx={{
              color: theme.palette[color].main,
              mb: 0.5,
              background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {loading ? (
              <Box
                sx={{
                  width: 40,
                  height: 24,
                  backgroundColor: alpha(theme.palette[color].main, 0.1),
                  borderRadius: 1,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ) : typeof value === "number" ? (
              value.toLocaleString()
            ) : (
              value
            )}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnimatedStatCard;
