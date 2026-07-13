import { Box, Grid, useTheme, Button } from "@mui/material";
import Section from "./components/Section";
import AttendanceTrendsRow from "./rows/05AttendanceTrendsRow";
import { AreaChart, LineChart, ComposedChart } from "@/shared/components/charts";
import { microTrends } from "./rows/05AttendanceTrendsRow/data";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";

const AllAttendanceTrendsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Additional sample datasets for extended charts
  const rollingWeekly = microTrends.map((d, i) => ({
    name: d.name,
    avg7: i < 6 ? null : Math.round(
      microTrends.slice(i - 6, i + 1).reduce((s, x) => s + x.value, 0) / 7
    ),
  }));

  const anomalies = microTrends.map((d) => ({
    ...d,
    expected: 72,
  }));

  return (
    <Box>
      <Section
        title="Attendance & Micro-Trends"
        subtitle="In-depth attendance patterns and breakdowns"
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
        {/* Summary row with more charts */}
        <AttendanceTrendsRow showAll />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AreaChart
              data={microTrends}
              xKey="name"
              yKey="value"
              title="In-office Rate (14d) - Area"
              subtitle="Filled area visualization"
              height={320}
              showGrid
              smooth
              colors={[theme.palette.success.main]}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <LineChart
              data={rollingWeekly}
              xKey="name"
              yKey="avg7"
              title="7-day Rolling Average"
              subtitle="Smoothed short-term trend"
              height={320}
              showGrid
              colors={[theme.palette.info.main]}
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ComposedChart
              data={anomalies}
              xKey="name"
              title="Actual vs Expected Attendance"
              subtitle="Compare actual rate to baseline"
              height={360}
              series={[
                { type: "bar", key: "value", name: "Actual", color: theme.palette.primary.main },
                { type: "line", key: "expected", name: "Expected", color: theme.palette.warning.main, strokeWidth: 2 },
              ]}
              gradient
            />
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default AllAttendanceTrendsPage;
