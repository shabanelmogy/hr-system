import {
  Person,
  PersonOff,
  Lock,
  SupervisorAccount,
  Speed,
} from "@mui/icons-material";
import {
  Box,
} from "@mui/material";
import { useMemo } from "react";
import {
  AnimatedStatCard,
  type AnimatedStatCardProps,
} from "@/shared/components/cards";
import type { User } from "../../types";

interface UsersDashboardHeaderProps {
  users: User[];
  loading: boolean;
  t: (key: string) => string;
}

const UsersDashboardHeader = ({ users, loading, t }: UsersDashboardHeaderProps) => {
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

    const activeUsers = users.filter((user) => !user.isDisabled).length;
    const disabledUsers = users.filter((user) => user.isDisabled).length;
    const lockedUsers = users.filter((user) => user.isLocked).length;
    const adminUsers = users.filter((user) =>
      user.roles.some((role) => role.toLowerCase().includes("admin"))
    ).length;

    const completedProfiles = users.filter(
      (user) =>
        user.firstName &&
        user.lastName &&
        user.userName &&
        user.email &&
        user.roles.length > 0
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
  // Stats configuration
  const statsConfig: AnimatedStatCardProps[] = [
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
        {statsConfig.map((stat) => (
          <AnimatedStatCard key={String(stat.title)} {...stat} loading={loading} />
        ))}
      </Box>
    </Box>
  );
};

export default UsersDashboardHeader;
