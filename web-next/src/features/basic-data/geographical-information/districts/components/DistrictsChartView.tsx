import { Box, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { DistrictListItem } from "../types/District";
import {
  StateBarChart,
  StatePieChart,
  DistrictsChart,
  EmptyChartDistrict,
  getChartColors,
  LoadingChartDistrict,
  prepareStateData,
  prepareDistrictData,
  prepareTimelineData,
  SummaryCards,
  TimelineChart,
} from "./chart-view";

interface DistrictsChartViewProps {
  districts: DistrictListItem[];
  totalCount: number;
  loading: boolean;
  onAdd?: () => void;
}

const DistrictsChartView = ({
  districts,
  totalCount,
  loading,
  onAdd,
}: DistrictsChartViewProps) => {
  const { i18n } = useTranslation();
  const theme = useTheme();

  if (loading) return <LoadingChartDistrict />;
  if (districts.length === 0) return <EmptyChartDistrict onAdd={onAdd} />;

  const language = i18n.resolvedLanguage;
  const stateData = prepareStateData(districts, language);
  const districtData = prepareDistrictData(districts, language);
  const timelineData = prepareTimelineData(districts);
  const colors = getChartColors(theme.palette.mode);
  const visibleDistricts = districts.reduce((total, state) => total + state.addressesCount, 0);
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
      <Box sx={{ flexShrink: 0 }}>
        <SummaryCards
          totalMatchingDistricts={totalCount}
          visibleDistricts={districts.length}
          visibleStates={stateData.length}
          visibleAddresses={visibleDistricts}
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
          <StateBarChart data={stateData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
          <StatePieChart data={stateData} colors={colors} />
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

export default DistrictsChartView;
