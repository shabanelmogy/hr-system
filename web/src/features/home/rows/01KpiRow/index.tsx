import { MetricCard } from "@/shared/components/charts";
import {
  AccessTime,
  Diversity3,
  LocalHospital,
  MonetizationOn,
  PeopleAlt,
  Public as PublicIcon,
  Savings,
  Schedule,
  School,
  SentimentSatisfiedAlt,
  TrendingDown,
  WorkOutlined,
} from "@mui/icons-material";
import { Grid } from "@mui/material";
import {
  extraKpis,
  kpisCore,
  openPositionsByDept,
  payrollTrend6m,
} from "./data";

type KpiRowProps = { showAll?: boolean };

const KpiRow = ({ showAll = false }: KpiRowProps) => {

  const kpis = kpisCore.map((kpi) => ({
    ...kpi,
    icon:
      kpi.title === "Total Employees"
        ? PeopleAlt
        : kpi.title === "Open Positions"
        ? WorkOutlined
        : kpi.title === "Monthly Payroll"
        ? MonetizationOn
        : PublicIcon,
  }));

  return (
    <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
      {(showAll ? kpis : kpis.slice(0, 4)).map((kpi, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title={kpi.title}
            value={kpi.value}
            previousValue={kpi.previousValue}
            target={kpi.target}
            icon={kpi.icon}
            color={kpi.color}
            showTrend
            showProgress
            showTarget
            gradient
            variant="elevated"
            subtitle={kpi.description}
            sx={{ height: "100%" }}
          />
        </Grid>
      ))}

      {(showAll ? extraKpis : []).map((kpi, idx) => {
        const iconMap: Record<string, typeof PublicIcon> = {
          "Avg Time to Hire": Schedule,
          "Employee Satisfaction": SentimentSatisfiedAlt,
          "Attrition Rate": TrendingDown,
          "Training Completion": School,
          "Overtime Hours": AccessTime,
          "Absence Rate": LocalHospital,
          "Benefits Cost": Savings,
          "Diversity Index": Diversity3,
        };
        const IconComp = iconMap[kpi.title] || PublicIcon;
        return (
          <Grid key={`extra-${idx}`} size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title={kpi.title}
              value={kpi.value}
              previousValue={kpi.previousValue}
              target={kpi.target}
              unit={kpi.unit}
              icon={IconComp}
              color={kpi.color}
              showTrend
              showProgress
              showTarget
              gradient
              variant="elevated"
              subtitle={kpi.description}
              sx={{ height: "100%" }}
            />
          </Grid>
        );
      })}

      {showAll && (
        <>
          {/* Additional KPI charts */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Payroll Trend"
              value={payrollTrend6m[payrollTrend6m.length - 1].value}
              previousValue={payrollTrend6m[payrollTrend6m.length - 2].value}
              target={4_000_000}
              icon={MonetizationOn}
              color="success"
              showTrend
              showProgress
              showTarget
              gradient
              variant="elevated"
              subtitle="Last 6 months"
              sx={{ height: "100%" }}
              description={"Cumulative gross payroll"}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard
              title="Open Roles by Dept"
              value={openPositionsByDept.reduce((s, d) => s + d.value, 0)}
              previousValue={46}
              target={40}
              icon={WorkOutlined}
              color="secondary"
              showTrend
              showProgress
              showTarget
              gradient
              variant="elevated"
              subtitle="Active requisitions"
              sx={{ height: "100%" }}
              description="Distribution across departments"
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default KpiRow;
