import { useMediaQuery } from "@mui/material";

export const useChartMotion = (): boolean =>
  !useMediaQuery("(prefers-reduced-motion: reduce)", { noSsr: true });
