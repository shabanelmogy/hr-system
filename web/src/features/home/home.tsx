import { TrendingUp } from "@mui/icons-material";
import {
  alpha,
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

// Shared components and charts
import { appRoutes } from "@/routes";
import { MyHeader } from "@/shared/components";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Section from "./components/Section";
import QuickInsights from "./QuickInsights";
import KpiRow from "./rows/01KpiRow";
import TrendsRow from "./rows/02TrendsRow";
import GlobalPresenceRow from "./rows/03GlobalPresenceRow";
import HealthPipelineRow from "./rows/04HealthPipelineRow";
import AttendanceTrendsRow from "./rows/05AttendanceTrendsRow";

const Home = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const isUpLg = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    // Trigger the fade-in effect on mount
    setIsVisible(true);
  }, []);

  return (
    <Box
      sx={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 600ms ease-in-out",
      }}
    >
      {/* HERO SECTION */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(1200px 300px at 10% -20%, ${alpha(
            theme.palette.primary.main,
            0.18
          )} 0%, transparent 60%), radial-gradient(1000px 300px at 90% -10%, ${alpha(
            theme.palette.secondary.main,
            0.16
          )} 0%, transparent 60%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 12px 40px ${alpha(theme.palette.common.black, 0.5)}`
              : `0 12px 40px ${alpha(theme.palette.primary.main, 0.18)}`,
        }}
      >
        <Grid sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          {isUpLg && (
            <MyHeader
              isDashboard
              title={t("menu.dashboard") || "Global HR Dashboard"}
              subTitle={
                t("menu.welcomeToYourDashboard") ||
                "Welcome to your centralized HR insights"
              }
            />
          )}
          {/* Quick Insights */}
          <QuickInsights />
        </Grid>
      </Box>

      {/* KPI CARDS SECTION */}
      <Section title="Key KPIs" subtitle="At-a-glance performance metrics">
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "flex-end", mb: 1 }}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(appRoutes.kpis)}
          >
             VIEW ALL
          </Button>
        </Stack>
        <KpiRow showAll={false} />
      </Section>

      <Box sx={{ height: 16 }} />

      {/* TRENDS & DISTRIBUTION SECTION */}
      <Section
        title="People Trends & Distribution"
        subtitle="Track workforce growth and department composition"
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="h6">Trends Overview</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(appRoutes.trends)}
          >
            VIEW ALL
          </Button>
        </Stack>
        <TrendsRow />
      </Section>

      <Box sx={{ height: 16 }} />

      {/* GLOBAL PRESENCE & ACTIVITY */}
      <Section
        title="Global Presence & Activity"
        subtitle="World-wide footprint and the latest HR updates"
      >
        <GlobalPresenceRow />
      </Section>

      <Box sx={{ height: 16 }} />

      {/* HEALTH & PIPELINE */}
      <Section
        title="People Health & Hiring Pipeline"
        subtitle="Engagement, compliance and funnel conversion"
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="h6">Health & Pipeline Overview</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(appRoutes.healthPipeline)}
          >
            VIEW ALL
          </Button>
        </Stack>
        <HealthPipelineRow />
      </Section>

      <Box sx={{ height: 16 }} />

      {/* ATTENDANCE & MICRO-TRENDS */}
      <Section
        title="Attendance Heatmap & Micro-Trends"
        subtitle="In-office presence and short-term signals"
      >
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="h6">Attendance Overview</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(appRoutes.attendanceTrends)}
          >
            VIEW ALL
          </Button>
        </Stack>
        <AttendanceTrendsRow />
      </Section>

      {/* Bottom highlight strip */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: `linear-gradient(90deg, ${alpha(
            theme.palette.primary.main,
            0.08
          )} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 6px 20px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      >
        <TrendingUp color="primary" />
        <Typography variant="body2">
          Hiring momentum remains strong this quarter. Keep tracking your
          pipeline and upcoming onboarding tasks.
        </Typography>
      </Box>
    </Box>
  );
};

export default Home;
