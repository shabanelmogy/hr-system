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
  const chartGridItemSx = {
    display: "flex",
    height: "100%",
    minHeight: { xs: 280, md: 0 },
    minWidth: 0,
    "& > *": { width: "100%", height: "100%" },
  } as const;

  return (
    <Box
      sx={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        px: { xs: 0.5, md: 0.75 },
        pt: 0.5,
        width: "100%",
        minWidth: 0,
      }}
    >
      <Alert severity="info" sx={{ flexShrink: 0, mb: 0.75, py: 0 }}>
        {t("states.charts.pageScope")}
      </Alert>

      <Box sx={{ flexShrink: 0 }}>
        <SummaryCards
          totalMatchingStates={totalCount}
          visibleStates={states.length}
          visibleCountries={countryData.length}
          visibleDistricts={visibleDistricts}
        />
      </Box>

      <Grid
        container
        spacing={0.75}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          alignContent: { xs: "start", md: "stretch" },
        }}
      >
        <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
          <CountryBarChart data={countryData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
          <CountryPieChart data={countryData} colors={colors} />
        </Grid>

        <Grid
          size={{ xs: 12, md: timelineData.length > 0 ? 6 : 12 }}
          sx={chartGridItemSx}
        >
          <DistrictsChart data={districtData} />
        </Grid>

        {timelineData.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
            <TimelineChart data={timelineData} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StatesChartView;
