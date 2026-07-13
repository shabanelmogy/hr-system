import { Grid, useTheme } from "@mui/material";
import {
  GaugeChart,
  FunnelChart,
  getColorPalette,
} from "@/shared/components/charts";
import { recruitmentFunnel, engagementScore, complianceScore } from "./data";

const HealthPipelineRow = () => {
  const theme = useTheme();
  const funnelColors = getColorPalette("rainbow", theme.palette.mode);
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <GaugeChart
          value={engagementScore}
          maxValue={100}
          colors={[
            theme.palette.error.light,
            theme.palette.warning.main,
            theme.palette.success.main,
          ]}
          thresholds={[60, 80]}
          thickness={24}
          trackColor={
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[200]
          }
          arcGradient
          centerY="62%"
          title="Employee Engagement"
          subtitle="Company-wide engagement index"
          height={320}
          showValue
          showPercentage
          gradient
          formatValue={(v) => String(Math.round(v))}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <GaugeChart
          value={complianceScore}
          maxValue={100}
          colors={[
            theme.palette.error.main,
            theme.palette.warning.light,
            theme.palette.success.dark,
          ]}
          thresholds={[85, 95]}
          thickness={26}
          trackColor={
            theme.palette.mode === "dark"
              ? theme.palette.grey[800]
              : theme.palette.grey[200]
          }
          arcGradient
          centerY="62%"
          title="Policy Compliance"
          subtitle="Mandatory trainings & policy checks"
          height={320}
          showValue
          showPercentage
          gradient
          formatValue={(v) => String(Math.round(v))}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <FunnelChart
          data={recruitmentFunnel}
          title="Recruitment Pipeline"
          subtitle="Application to hire conversion"
          height={300}
          colors={funnelColors}
          showLabels
          labelPosition="right"
          gradient
        />
      </Grid>
    </Grid>
  );
};

export default HealthPipelineRow;
