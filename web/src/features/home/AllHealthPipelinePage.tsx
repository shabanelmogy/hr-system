import { Box, Grid, Button } from "@mui/material";
import Section from "./components/Section";
import HealthPipelineRow from "./rows/04HealthPipelineRow";
import {
  DonutChart,
  BarChart,
  AreaChart,
  BulletChart,
  WaterfallChart,
  ComposedChart,
  getColorPalette,
} from "@/shared/components/charts";
import { useTheme } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

const AllHealthPipelinePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const palette = getColorPalette("rainbow", theme.palette.mode);

  // Sample datasets; wire to real data later
  const complianceBreakdown = [
    { name: "Completed", value: 820 },
    { name: "Pending", value: 120 },
    { name: "Overdue", value: 35 },
  ];

  const trainingByDept = [
    { dept: "Engineering", completed: 92 },
    { dept: "Sales", completed: 84 },
    { dept: "HR", completed: 97 },
    { dept: "Ops", completed: 78 },
    { dept: "Finance", completed: 88 },
  ];

  const engagementTrend = [
    { month: "Jan", engagement: 76 },
    { month: "Feb", engagement: 77 },
    { month: "Mar", engagement: 79 },
    { month: "Apr", engagement: 78 },
    { month: "May", engagement: 81 },
    { month: "Jun", engagement: 80 },
    { month: "Jul", engagement: 82 },
    { month: "Aug", engagement: 83 },
    { month: "Sep", engagement: 82 },
    { month: "Oct", engagement: 84 },
    { month: "Nov", engagement: 85 },
    { month: "Dec", engagement: 86 },
  ];

  const timeToFill = [
    {
      name: "Time to Fill (days)",
      value: 28,
      target: 25,
      max: 45,
      ranges: [
        { value: 20, label: "Good", color: theme.palette.success.light },
        { value: 30, label: "OK", color: theme.palette.warning.light },
        { value: 45, label: "Slow", color: theme.palette.error.light },
      ],
    },
  ];

  const dropOff = [
    { name: "Applications", value: 820 },
    { name: "Screening Loss", value: -280 },
    { name: "Interview Loss", value: -180 },
    { name: "Offer Decline", value: -32 },
    { name: "Hires", value: 46 },
  ];

  const offersAcceptance = [
    { month: "Jan", offers: 120, accepted: 80, rate: 66 },
    { month: "Feb", offers: 110, accepted: 72, rate: 65 },
    { month: "Mar", offers: 140, accepted: 90, rate: 64 },
    { month: "Apr", offers: 150, accepted: 100, rate: 67 },
    { month: "May", offers: 160, accepted: 112, rate: 70 },
    { month: "Jun", offers: 170, accepted: 120, rate: 71 },
  ];

  return (
    <Box>
      <Section
        title="People Health & Hiring Pipeline"
        subtitle="Deep-dive charts and diagnostics"
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        }
      >
        {/* Keep summary row for context */}
        <HealthPipelineRow />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DonutChart
              data={complianceBreakdown}
              title="Training Compliance"
              subtitle="Completed vs Pending vs Overdue"
              height={360}
              colors={palette}
              showLegend={true}
              centerLabel="Total"
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <BarChart
              data={trainingByDept}
              title="Training Completion by Dept"
              subtitle="% completed"
              height={360}
              xKey="dept"
              yKey="completed"
              colors={[theme.palette.primary.main]}
              showLegend={false}
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <AreaChart
              data={engagementTrend}
              title="Engagement Trend (12m)"
              subtitle="Company-wide index"
              height={360}
              xKey="month"
              yKey="engagement"
              colors={[theme.palette.success.main]}
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <BulletChart
              data={timeToFill}
              title="Time to Fill vs Target"
              subtitle="Days to fill open roles"
              height={300}
              orientation="horizontal"
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <WaterfallChart
              data={dropOff}
              title="Pipeline Drop-off"
              subtitle="Net changes across stages"
              height={300}
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ComposedChart
              data={offersAcceptance}
              title="Offers vs Acceptance"
              subtitle="Monthly trend with acceptance rate"
              height={360}
              xKey="month"
              series={[
                {
                  type: "bar",
                  key: "offers",
                  name: "Offers",
                  color: theme.palette.info.main,
                },
                {
                  type: "bar",
                  key: "accepted",
                  name: "Accepted",
                  color: theme.palette.primary.main,
                },
                {
                  type: "line",
                  key: "rate",
                  name: "Acceptance %",
                  color: theme.palette.success.main,
                  yAxisId: "right",
                  strokeWidth: 2,
                },
              ]}
              gradient
            />
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default AllHealthPipelinePage;
