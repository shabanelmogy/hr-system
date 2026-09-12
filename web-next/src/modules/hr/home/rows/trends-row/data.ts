// Trends Row data
export const monthlyTrend = [
  { month: "Jan", headcount: 1100, hires: 45, attrition: 18 },
  { month: "Feb", headcount: 1120, hires: 38, attrition: 20 },
  { month: "Mar", headcount: 1145, hires: 52, attrition: 22 },
  { month: "Apr", headcount: 1170, hires: 49, attrition: 24 },
  { month: "May", headcount: 1195, hires: 56, attrition: 28 },
  { month: "Jun", headcount: 1210, hires: 44, attrition: 32 },
  { month: "Jul", headcount: 1235, hires: 60, attrition: 35 },
  { month: "Aug", headcount: 1250, hires: 58, attrition: 40 },
  { month: "Sep", headcount: 1265, hires: 55, attrition: 36 },
  { month: "Oct", headcount: 1278, hires: 50, attrition: 42 },
  { month: "Nov", headcount: 1284, hires: 62, attrition: 48 },
  { month: "Dec", headcount: 1290, hires: 48, attrition: 40 },
];

export const monthlySeriesKeys = [
  { key: "headcount", name: "Headcount" },
  { key: "hires", name: "Hires" },
  { key: "attrition", name: "Attrition" },
];

export const departmentDistribution = [
  { name: "Engineering", value: 420 },
  { name: "Sales", value: 240 },
  { name: "Operations", value: 200 },
  { name: "HR", value: 80 },
  { name: "Marketing", value: 160 },
  { name: "Finance", value: 184 },
];

// Derived metric: Monthly Net Adds (Hires - Attrition)
export const monthlyNetAdds = monthlyTrend.map(({ month, hires, attrition }) => ({
  month,
  net: hires - attrition,
}));
