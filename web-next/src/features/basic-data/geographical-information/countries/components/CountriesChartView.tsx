import { Alert, Box, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { CountryListItem } from "../types/Country";
import { CountryCardViewPagination } from "./card-view";
import {
  CurrencyChart,
  EmptyChartState,
  getChartColors,
  getTotalStatesCount,
  LoadingChartState,
  prepareCurrencyData,
  prepareStatesCoverageData,
  prepareStatesData,
  prepareTimelineData,
  StatesCoverageChart,
  StatesChart,
  SummaryCards,
  TimelineChart,
} from "./chart-view";

interface CountriesChartViewProps {
  countries: CountryListItem[];
  totalCount: number;
  loading: boolean;
  onAdd?: () => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const CountriesChartView: React.FC<CountriesChartViewProps> = ({
  countries,
  totalCount,
  loading,
  onAdd,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  if (loading) {
    return <LoadingChartState />;
  }

  if (!countries || countries.length === 0) {
    return <EmptyChartState onAdd={onAdd} />;
  }

  const currencyData = prepareCurrencyData(countries);
  const timelineData = prepareTimelineData(countries);
  const statesData = prepareStatesData(countries, i18n.resolvedLanguage);
  const statesCoverageData = prepareStatesCoverageData(countries, {
    withStates: t("countries.charts.withStates"),
    withoutStates: t("countries.charts.withoutStates"),
  });
  const colors = getChartColors(theme.palette.mode);

  const visibleCountries = countries.length;
  const visibleCurrencies = currencyData.length;
  const visibleStates = getTotalStatesCount(countries);

  return (
    <Box sx={{ width: "100%" }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        {t("countries.charts.pageScope")}
      </Alert>

      <SummaryCards
        totalMatchingCountries={totalCount}
        visibleCountries={visibleCountries}
        visibleCurrencies={visibleCurrencies}
        visibleStates={visibleStates}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatesChart data={statesData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <StatesCoverageChart data={statesCoverageData} colors={colors} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CurrencyChart data={currencyData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TimelineChart data={timelineData} />
        </Grid>
      </Grid>

      <CountryCardViewPagination
        page={page}
        rowsPerPage={pageSize}
        totalItems={totalCount}
        itemsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event: SelectChangeEvent<number>) =>
          onPageSizeChange(Number(event.target.value))
        }
      />
    </Box>
  );
};

export default CountriesChartView;
