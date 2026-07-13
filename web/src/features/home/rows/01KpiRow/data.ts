// KPI Row dummy data
export const kpisCore = [
  {
    title: "Total Employees",
    value: 1284,
    previousValue: 1210,
    target: 1300,
    color: "primary",
    description: "Global headcount across all regions",
  },
  {
    title: "Open Positions",
    value: 46,
    previousValue: 52,
    target: 40,
    color: "secondary",
    description: "Active requisitions company-wide",
  },
  {
    title: "Monthly Payroll",
    value: 3_780_000,
    previousValue: 3_650_000,
    target: 4_000_000,
    color: "success",
    description: "Gross payroll for current month",
  },
  {
    title: "Countries",
    value: 12,
    previousValue: 10,
    target: 15,
    color: "info",
    description: "Operating countries globally",
  },
];

// Mini charts data for KPI row
export const payrollTrend6m = [
  { month: "May", value: 3_650_000 },
  { month: "Jun", value: 3_690_000 },
  { month: "Jul", value: 3_720_000 },
  { month: "Aug", value: 3_740_000 },
  { month: "Sep", value: 3_760_000 },
  { month: "Oct", value: 3_780_000 },
];

export const openPositionsByDept = [
  { name: "Engineering", value: 18 },
  { name: "Sales", value: 10 },
  { name: "Operations", value: 7 },
  { name: "Marketing", value: 6 },
  { name: "HR", value: 3 },
  { name: "Finance", value: 2 },
];

// Additional KPIs to display with the same style
export const extraKpis = [
  {
    title: "Avg Time to Hire",
    value: 32,
    previousValue: 36,
    target: 28,
    unit: " days",
    color: "warning",
    description: "Average days from requisition to hire",
  },
  {
    title: "Employee Satisfaction",
    value: 84,
    previousValue: 81,
    target: 90,
    unit: "%",
    color: "info",
    description: "Overall satisfaction from latest survey",
  },
  {
    title: "Attrition Rate",
    value: 12.4,
    previousValue: 13.1,
    target: 10,
    unit: "%",
    color: "error",
    description: "Annualized voluntary turnover",
  },
  {
    title: "Training Completion",
    value: 76,
    previousValue: 70,
    target: 85,
    unit: "%",
    color: "primary",
    description: "Mandatory training completion rate",
  },
  {
    title: "Overtime Hours",
    value: 1_240,
    previousValue: 1_320,
    target: 1_000,
    color: "secondary",
    description: "Total overtime hours this month",
  },
  {
    title: "Absence Rate",
    value: 3.2,
    previousValue: 3.6,
    target: 2.5,
    unit: "%",
    color: "warning",
    description: "Unplanned absence as % of scheduled hours",
  },
  {
    title: "Benefits Cost",
    value: 920_000,
    previousValue: 910_000,
    target: 950_000,
    color: "success",
    description: "Current month employer benefits cost",
  },
  {
    title: "Diversity Index",
    value: 74,
    previousValue: 72,
    target: 80,
    unit: "%",
    color: "info",
    description: "Composite diversity representation score",
  },
];
