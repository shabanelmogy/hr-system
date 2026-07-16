export type BarOrientation = "vertical" | "horizontal";
export type RechartsBarLayout = "horizontal" | "vertical";

export const getBarChartLayout = (orientation: BarOrientation): RechartsBarLayout =>
  orientation === "horizontal" ? "vertical" : "horizontal";
