import { Alert, Box, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { StateListItem } from "../types/State";
import {
  CountryBarChart,
  CountryPieChart,
  DistrictsChart,
  EmptyChartState,
  getChartColors,
  LoadingChartState,
  prepareCountryData,
  prepareDistrictData,
  prepareTimelineData,
  SummaryCards,
  TimelineChart,
} from "./chart-view";

interface StatesChartViewProps {
  states: StateListItem[];
  totalCount: number;
  loading: boolean;
  onAdd?: () => void;
}

const StatesChartView = ({
  states,
  totalCount,
  loading,
  onAdd,
}: StatesChartViewProps) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  if (loading) return <LoadingChartState />;
  if (states.length === 0) return <EmptyChartState onAdd={onAdd} />;

  const language = i18n.resolvedLanguage;
  const countryData = prepareCountryData(states, language);
  const districtData = prepareDistrictData(states, language);
  const timelineData = prepareTimelineData(states);
  const colors = getChartColors(theme.palette.mode);
  const visibleDistricts = states.reduce((total, state) => total + state.districtsCount, 0);

  return (
    <Box sx={{ boxSizing: "border-box", p: { xs: 1, md: 1.5 }, width: "100%" }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        {t("states.charts.pageScope")}
      </Alert>

      <SummaryCards
        totalMatchingStates={totalCount}
        visibleStates={states.length}
        visibleCountries={countryData.length}
        visibleDistricts={visibleDistricts}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CountryBarChart data={countryData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CountryPieChart data={countryData} colors={colors} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DistrictsChart data={districtData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TimelineChart data={timelineData} />
        </Grid>
      </Grid>

    </Box>
  );
};

export default StatesChartView;
