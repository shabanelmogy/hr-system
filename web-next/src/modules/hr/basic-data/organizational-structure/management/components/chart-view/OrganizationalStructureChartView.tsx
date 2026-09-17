"use client";

import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import BarChart from "@/shared/components/charts/cartesian/BarChart";
import { COLOR_PALETTES } from "@/shared/components/charts/palette";

interface OrganizationalStructureChartViewProps {
  data: Array<{ name: string; value: number }>;
  loading: boolean;
}

export default function OrganizationalStructureChartView({
  data,
  loading,
}: OrganizationalStructureChartViewProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden", p: { xs: 0.5, md: 1 }, width: "100%" }}>
      <BarChart
        data={data}
        title={t("organizationalStructure.chart.title")}
        subtitle={t("organizationalStructure.chart.pageScope")}
        xKey="name"
        yKey="value"
        fullHeight
        compact
        colors={COLOR_PALETTES.primary}
        loading={loading}
        formatValue={(value) => String(value)}
        height={280}
      />
    </Box>
  );
}
