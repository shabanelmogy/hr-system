"use client";

import { Box, Card, CardContent, Grid, Typography, useTheme, Skeleton } from "@mui/material";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useTranslation } from "react-i18next";
import { useRecruitmentSummary } from "../hooks/useRecruitment";

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  loading?: boolean;
}

function StatCard({ title, count, icon, color, subtitle, loading }: StatCardProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 24px -4px ${color}25`,
          borderColor: color,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {subtitle}
          </Typography>
        </Box>

        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: -0.5 }}>
            {count}
          </Typography>
        )}

        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function RecruitmentDashboardStats() {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useRecruitmentSummary();

  const stats = [
    {
      title: t("recruitment.stats.openings", "الوظائف المفتوحة / Openings"),
      count: summary?.totalOpenings ?? 0,
      icon: <BusinessCenterOutlinedIcon fontSize="medium" />,
      color: "#2563EB", // Blue
      subtitle: t("recruitment.stats.active", "نشطة / Active"),
    },
    {
      title: t("recruitment.stats.candidates", "المرشحون النشطون / Candidates"),
      count: summary?.totalActiveCandidates ?? 0,
      icon: <PeopleAltOutlinedIcon fontSize="medium" />,
      color: "#7C3AED", // Purple
      subtitle: t("recruitment.stats.inPipeline", "في المراحل / Pipeline"),
    },
    {
      title: t("recruitment.stats.interviews", "المقابلات المجدولة / Interviews"),
      count: summary?.totalScheduledInterviews ?? 0,
      icon: <EventAvailableOutlinedIcon fontSize="medium" />,
      color: "#EA580C", // Amber
      subtitle: t("recruitment.stats.upcoming", "قادمة / Upcoming"),
    },
    {
      title: t("recruitment.stats.offers", "عروض العمل الصادرة / Offers"),
      count: summary?.totalPendingOffers ?? 0,
      icon: <MarkEmailReadOutlinedIcon fontSize="medium" />,
      color: "#0D9488", // Teal
      subtitle: t("recruitment.stats.pendingDecision", "قيد الرد / Pending"),
    },
    {
      title: t("recruitment.stats.hired", "تم تعيينهم / Hired"),
      count: summary?.totalHiredCount ?? 0,
      icon: <CheckCircleOutlineOutlinedIcon fontSize="medium" />,
      color: "#16A34A", // Green
      subtitle: t("recruitment.stats.totalHired", "مكتمل / Hired"),
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {stats.map((stat, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
          <StatCard {...stat} loading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
