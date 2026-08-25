import { Box, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { AddressType } from "../types/AddressType";
import {
  EmptyChartState,
  getChartColors,
  InitialLetterChart,
  LanguageDistributionChart,
  LoadingChartState,
  NameLengthChart,
  prepareInitialLetterData,
  prepareLanguageData,
  prepareNameLengthData,
  prepareTimelineData,
  SummaryCards,
  TimelineChart,
} from "./chart-view";

interface AddressTypesChartViewProps {
  items: AddressType[];
  totalCount: number;
  loading: boolean;
  onAdd?: () => void;
}

/** Directly follows the States chart container and uses the Address Type data contracts. */
export default function AddressTypesChartView({
  items,
  totalCount,
  loading,
  onAdd,
}: AddressTypesChartViewProps) {
  const theme = useTheme();

  if (loading) return <LoadingChartState />;
  if (items.length === 0) return <EmptyChartState onAdd={onAdd} />;

  const initialLetterData = prepareInitialLetterData(items);
  const languageData = prepareLanguageData(items);
  const nameLengthData = prepareNameLengthData(items);
  const timelineData = prepareTimelineData(items);
  const colors = getChartColors(theme.palette.mode);
  const visibleWithAddresses = items.filter((item) => item.addressesCount > 0).length;
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
          totalMatchingAddressTypes={totalCount}
          visibleAddressTypes={items.length}
          visibleWithAddresses={visibleWithAddresses}
          visibleWithoutAddresses={items.length - visibleWithAddresses}
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
          <InitialLetterChart data={initialLetterData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
          <LanguageDistributionChart data={languageData} colors={colors} />
        </Grid>

        <Grid
          size={{ xs: 12, md: timelineData.length > 0 ? 6 : 12 }}
          sx={chartGridItemSx}
        >
          <NameLengthChart data={nameLengthData} />
        </Grid>

        {timelineData.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }} sx={chartGridItemSx}>
            <TimelineChart data={timelineData} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
