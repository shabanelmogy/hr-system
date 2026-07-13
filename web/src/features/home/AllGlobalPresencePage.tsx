import { Box, Grid, Button } from "@mui/material";
import Section from "./components/Section";
import GlobalPresenceRow from "./rows/03GlobalPresenceRow";
import {
  DonutChart,
  BarChart,
  TreemapChart,
  AreaChart,
  getColorPalette,
} from "@/shared/components/charts";
import { useTheme } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { worldData } from "./rows/03GlobalPresenceRow/data";

const AllGlobalPresencePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const palette = getColorPalette("rainbow", theme.palette.mode) as any;

  const employeesByTimezone: Record<string, number> = worldData.reduce<Record<string, number>>((acc, c) => {
    const key = c.timezone || "Unknown";
    acc[key] = (acc[key] ?? 0) + (c.employees ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const timezoneData = Object.entries(employeesByTimezone).map(
    ([tz, employees]) => ({ tz, employees })
  );

  const regionalGrowth = [
    { quarter: "Q1", amer: 820, emea: 580, apac: 420 },
    { quarter: "Q2", amer: 840, emea: 600, apac: 450 },
    { quarter: "Q3", amer: 860, emea: 620, apac: 470 },
    { quarter: "Q4", amer: 880, emea: 640, apac: 500 },
  ];

  return (
    <Box>
      <Section
        title="Global Presence & Activity"
        subtitle="Deep-dive into footprint, timelines, and distributions"
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
        {/* Summary row */}
        <GlobalPresenceRow showViewAll={false} />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DonutChart
              data={worldData.map((c) => ({
                name: c.name,
                value: c.employees,
              }))}
              title="Headcount by Country"
              subtitle="All countries"
              height={360}
              colors={"rainbow"}
              showLegend
              centerLabel="Employees"
              gradient
            />
          </Grid>
           <Grid size={{ xs: 12, md: 4 }}>
            <BarChart
              data={worldData.map((c) => ({
                name: c.name,
                offices: c.offices,
              }))}
              title="Offices by Country"
              subtitle="Counts"
              height={360}
              xKey="name"
              yKey="offices"
              colors={[theme.palette.primary.main] as any}
              showLegend={false}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TreemapChart
              data={worldData.map((c) => ({
                name: c.name,
                revenue: c.revenue,
              }))}
              title="Revenue by Country"
              subtitle="Relative contribution"
              height={360}
              dataKey="revenue"
              nameKey="name"
              colors={"rainbow"}
              gradient
            />
          </Grid>

           <Grid size={{ xs: 12, md: 6 }}>
            <BarChart
              data={timezoneData}
              title="Employees by Timezone"
              subtitle="Summed headcount"
              height={360}
              xKey="tz"
              yKey="employees"
              colors={[theme.palette.info.main] as any}
              showLegend={false}
              orientation="horizontal"
              gradient
            />
          </Grid>

           <Grid size={{ xs: 12, md: 6 }}>
            <AreaChart
              data={regionalGrowth}
              title="Regional Growth"
              subtitle="Quarterly headcount trend"
              height={360}
              xKey="quarter"
              multiSeries={[
                {
                  key: "amer",
                  name: "Americas",
                  color: theme.palette.primary.main,
                },
                {
                  key: "emea",
                  name: "EMEA",
                  color: theme.palette.secondary.main,
                },
                {
                  key: "apac",
                  name: "APAC",
                  color: theme.palette.success.main,
                },
              ]}
              showLegend
              gradient
            />
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default AllGlobalPresencePage;
