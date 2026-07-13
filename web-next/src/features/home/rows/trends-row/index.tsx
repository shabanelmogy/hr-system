import {
  AreaChart,
  BarChart,
  ComposedChart,
  DonutChart,
  FunnelChart,
  LineChart,
  ScatterChart,
  getColorPalette,
} from "@/shared/components/charts";
import { Grid, useTheme } from "@mui/material";
import {
  departmentDistribution,
  monthlyNetAdds,
  monthlySeriesKeys,
  monthlyTrend,
} from "./data";

type TrendsRowProps = { showAll?: boolean };

const TrendsRow = ({ showAll = false }: TrendsRowProps) => {
  const theme = useTheme();
  const monthlySeries = [
    {
      key: monthlySeriesKeys[0].key,
      name: monthlySeriesKeys[0].name,
      color: theme.palette.primary.main,
    },
    {
      key: monthlySeriesKeys[1].key,
      name: monthlySeriesKeys[1].name,
      color: theme.palette.success.main,
    },
    {
      key: monthlySeriesKeys[2].key,
      name: monthlySeriesKeys[2].name,
      color: theme.palette.error.main,
    },
  ];

  const deptSorted = [...departmentDistribution].sort(
    (a, b) => b.value - a.value
  );
  const funnelColors = getColorPalette("rainbow", theme.palette.mode);
  const hiresPos = monthlyTrend.filter((m) => m.hires >= m.attrition);
  const hiresNeg = monthlyTrend.filter((m) => m.hires < m.attrition);

  return (
    <Grid container spacing={2}>
      {/* Row 1: Existing trends */}
      <Grid size={{ xs: 12, md: 7 }}>
        <LineChart
          data={monthlyTrend}
          xKey="month"
          height={320}
          title="Headcount & Hiring Trends"
          subtitle="Track headcount growth with hires and attrition"
          multiSeries={monthlySeries}
          showLegend
          showGrid
          gradient
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <DonutChart
          data={departmentDistribution}
          title="Workforce by Department"
          subtitle="Distribution across key functions"
          height={320}
          colors={funnelColors}
          showLegend
          centerLabel="Employees"
          gradient
        />
      </Grid>

      {showAll && (
        <>
          {/* Row 2: Additional trends */}
          <Grid size={{ xs: 12, md: 7 }}>
            <AreaChart
              data={monthlyNetAdds}
              xKey="month"
              yKey="net"
              title="Monthly Net Adds"
              subtitle="Hires minus attrition"
              height={280}
              showGrid
              smooth
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <BarChart
              data={monthlyTrend}
              xKey="month"
              title="Hires vs Attrition"
              subtitle="Monthly comparison"
              height={280}
              showGrid
              showLegend
              multiSeries={[
                {
                  key: "hires",
                  name: "Hires",
                  color: theme.palette.success.main,
                },
                {
                  key: "attrition",
                  name: "Attrition",
                  color: theme.palette.error.main,
                },
              ]}
              stacked={false}
              gradient
            />
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <ComposedChart
              data={monthlyTrend}
              xKey="month"
              title="Headcount with Hires and Attrition"
              subtitle="Combined view: bars + line"
              height={300}
              showGrid
              showLegend
              series={[
                {
                  type: "bar",
                  key: "hires",
                  name: "Hires",
                  color: theme.palette.success.main,
                  yAxisId: "left",
                  barSize: 18,
                },
                {
                  type: "bar",
                  key: "attrition",
                  name: "Attrition",
                  color: theme.palette.error.main,
                  yAxisId: "left",
                  barSize: 18,
                },
                {
                  type: "line",
                  key: "headcount",
                  name: "Headcount",
                  color: theme.palette.primary.main,
                  yAxisId: "right",
                  strokeWidth: 2,
                },
              ]}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <FunnelChart
              data={deptSorted}
              title="Department Size Funnel"
              subtitle="Largest to smallest departments"
              height={300}
              showTooltip
              showLabels={false}
              labelPosition="center"
              colors={funnelColors}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ScatterChart
              xKey="hires"
              yKey="attrition"
              title="Hires vs Attrition Scatter"
              subtitle="Net growth vs loss months"
              height={280}
              showGrid
              showLegend
              dotSize={8}
              multiSeries={[
                {
                  name: "Net Growth",
                  data: hiresPos,
                  color: theme.palette.success.main,
                },
                {
                  name: "Net Loss",
                  data: hiresNeg,
                  color: theme.palette.error.main,
                },
              ]}
              gradient
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default TrendsRow;
