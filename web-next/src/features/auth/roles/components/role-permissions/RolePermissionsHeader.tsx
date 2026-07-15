import { Home, Security } from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

type RolePermissionsHeaderProps = {
  roleName: string;
  selected: number;
  total: number;
  percentage: number;
  onDashboard: () => void;
};

export default function RolePermissionsHeader({
  roleName,
  selected,
  total,
  percentage,
  onDashboard,
}: RolePermissionsHeaderProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.8 : 1)} 0%, ${alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.8 : 1)} 100%)`,
        color: theme.palette.primary.contrastText,
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2} sx={{ alignItems: "center" }}>
        <Grid>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              width: 40,
              height: 40,
              color: theme.palette.primary.contrastText,
            }}
          >
            <Security />
          </Avatar>
        </Grid>
        <Grid>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {roleName}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {selected}/{total} permissions ({percentage.toFixed(1)}%)
          </Typography>
        </Grid>
        <Grid>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                width: 100,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.common.white, 0.2),
                "& .MuiLinearProgress-bar": {
                  bgcolor: alpha(theme.palette.common.white, 0.8),
                },
              }}
            />
            <Tooltip title="Go to Dashboard">
              <IconButton
                aria-label="Go to Dashboard"
                onClick={onDashboard}
                size="small"
                sx={{
                  color: theme.palette.primary.contrastText,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Home />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
