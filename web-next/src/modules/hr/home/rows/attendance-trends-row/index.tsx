import React from "react";
import { Grid, useTheme } from "@mui/material";
import { HeatmapChart, BarChart, AreaChart, DonutChart, BulletChart } from "@/shared/components/charts";
import { attendanceHeatmapData, microTrends, formatHeatmapLabel } from "./data";

const AttendanceTrendsRow = ({ showAll = false }) => {
  const theme = useTheme();

  // Aggregations for extended view (used when showAll = true)
  const dayMap = new Map();
  attendanceHeatmapData.forEach((r) => {
    dayMap.set(r.y, (dayMap.get(r.y) || 0) + r.value);
  });
  const checkinsByDay = Array.from(dayMap.entries()).map(([y, sum]) => ({
    day: formatHeatmapLabel(y),
    checkins: sum,
  }));

  const hourMap = new Map();
  attendanceHeatmapData.forEach((r) => {
    hourMap.set(r.x, (hourMap.get(r.x) || 0) + r.value);
  });
  const checkinsByHour = Array.from(hourMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([x, sum]) => ({ hour: formatHeatmapLabel(x), checkins: sum }));

  const presenceBreakdown = [
    { name: "On-site", value: 68 },
    { name: "Remote", value: 22 },
    { name: "Absent", value: 10 },
  ];

  const latestInOffice = microTrends[microTrends.length - 1]?.value ?? 70;
  const absenceRate = Math.max(0, 100 - latestInOffice);
  const absenceRateBullet = [
    {
      name: "Absence %",
      value: absenceRate,
      target: 8,
      max: 25,
      ranges: [
        { value: 6, label: "Good", color: theme.palette.success.light },
        { value: 12, label: "Watch", color: theme.palette.warning.light },
        { value: 25, label: "High", color: theme.palette.error.light },
      ],
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <HeatmapChart
          data={attendanceHeatmapData}
          title="Attendance Heatmap"
          subtitle="Weekday vs hour in-office density"
          height={360}
          xKey="x"
          yKey="y"
          valueKey="value"
          colors={[theme.palette.grey[200], theme.palette.primary.main]}
          formatLabel={formatHeatmapLabel}
          showColorScale
          gradient
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <BarChart
          data={microTrends}
          xKey="name"
          yKey="value"
          title="Micro-Trends (14d)"
          subtitle="In-office rate, last 2 weeks"
          height={360}
          colors="success"
          showGrid
          gradient
        />
      </Grid>

      {showAll && (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <BarChart
              data={checkinsByDay}
              xKey="day"
              yKey="checkins"
              title="Check-ins by Weekday"
              subtitle="Summed over hours"
              height={300}
              orientation="horizontal"
              showGrid
              colors={[theme.palette.info.main]}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BarChart
              data={checkinsByHour}
              xKey="hour"
              yKey="checkins"
              title="Check-ins by Hour"
              subtitle="Summed over weekdays"
              height={300}
              showGrid
              colors={[theme.palette.primary.main]}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AreaChart
              data={microTrends}
              xKey="name"
              yKey="value"
              title="In-office Rate (14d)"
              subtitle="Short-term attendance rate"
              height={300}
              showGrid
              smooth
              colors={[theme.palette.success.main]}
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DonutChart
              data={presenceBreakdown}
              title="Presence Breakdown"
              subtitle="On-site vs Remote vs Absent"
              height={300}
              centerLabel="People"
              showLegend
              gradient
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BulletChart
              data={absenceRateBullet}
              title="Absence Rate vs Target"
              subtitle="Latest day vs thresholds"
              height={220}
              orientation="horizontal"
              gradient
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default AttendanceTrendsRow;
