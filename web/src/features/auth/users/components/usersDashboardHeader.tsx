import {
  Person,
  PersonOff,
  Lock,
  SupervisorAccount,
  Speed,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";

interface UsersDashboardHeaderProps {
  users: any[];
  loading: boolean;
  t: (key: string) => string;
}

const UsersDashboardHeader = ({ users, loading, t }: UsersDashboardHeaderProps) => {
  const theme = useTheme();

  // Calculate statistics
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        disabledUsers: 0,
        lockedUsers: 0,
        adminUsers: 0,
        completedProfiles: 0,
      };
    }

    const activeUsers = users.filter((u: any) => !u.isDisabled).length;
    const disabledUsers = users.filter((u: any) => u.isDisabled).length;
    const lockedUsers = users.filter((u: any) => u.isLocked).length;
    const adminUsers = users.filter((u: any) => 
      u.roles && u.roles.some((role: any) => 
        typeof role === 'string' 
          ? role.toLowerCase().includes('admin')
          : role.name && role.name.toLowerCase().includes('admin')
      )
    ).length;

    const completedProfiles = users.filter(
      (u: any) =>
        u.firstName &&
        u.lastName &&
        u.userName &&
        u.email &&
        u.roles &&
        u.roles.length > 0
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      disabledUsers,
      lockedUsers,
      adminUsers,
      completedProfiles,
    };
  }, [users]);

  // Get completion percentage
  const completionRate = useMemo(() => {
    if (stats.totalUsers === 0) return 0;
    return Math.round((stats.completedProfiles / stats.totalUsers) * 100);
  }, [stats.completedProfiles, stats.totalUsers]);



  // Animated stat card
  const AnimatedStatCard = ({ icon, title, value, color = "primary" }: any) => (
    <Card
      sx={{
        height: 120,
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${alpha(
          (theme.palette as any)[color].light,
          0.1
        )} 0%, ${alpha((theme.palette as any)[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha((theme.palette as any)[color].main, 0.1)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: `0 12px 40px ${alpha((theme.palette as any)[color].main, 0.15)}`,
          border: `1px solid ${alpha((theme.palette as any)[color].main, 0.3)}`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${(theme.palette as any)[color].main}, ${(theme.palette as any)[color].light})`,
        },
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
            background: `linear-gradient(135deg, ${(theme.palette as any)[color].main}, ${(theme.palette as any)[color].dark})`,
            boxShadow: `0 8px 24px ${alpha((theme.palette as any)[color].main, 0.3)}`,
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
              color: (theme.palette as any)[color].main,
              mb: 0.5,
              background: `linear-gradient(135deg, ${(theme.palette as any)[color].main}, ${(theme.palette as any)[color].dark})`,
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
                  backgroundColor: alpha((theme.palette as any)[color].main, 0.1),
                  borderRadius: 1,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ) : (
              value.toString()
            )}
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Stats configuration
  const statsConfig = [
    {
      icon: <Person />,
      title: t("users.dashboard.totalUsers") || "Total Users",
      value: stats.totalUsers,
      color: "primary",
    },
    {
      icon: <Person />,
      title: t("users.dashboard.activeUsers") || "Active Users",
      value: stats.activeUsers,
      color: "success",
    },
    {
      icon: <PersonOff />,
      title: t("users.dashboard.disabledUsers") || "Disabled Users",
      value: stats.disabledUsers,
      color: "warning",
    },
    {
      icon: <Lock />,
      title: t("users.dashboard.lockedUsers") || "Locked Users",
      value: stats.lockedUsers,
      color: "error",
    },
    {
      icon: <SupervisorAccount />,
      title: t("users.dashboard.adminUsers") || "Admin Users",
      value: stats.adminUsers,
      color: "secondary",
    },
    {
      icon: <Speed />,
      title: t("users.dashboard.profileCompletion") || "Profile Completion",
      value: `${completionRate}%`,
      color:
        completionRate >= 80
          ? "success"
          : completionRate >= 50
          ? "warning"
          : "error",
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(6, 1fr)",
          },
          gap: 2,
        }}
      >
        {statsConfig.map((stat: any, index: number) => (
          <AnimatedStatCard key={index} {...stat} />
        ))}
      </Box>
    </Box>
  );
};

export default UsersDashboardHeader;