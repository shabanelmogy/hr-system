import { Box, Grid } from '@mui/material';
import React from 'react';
import { Country } from '../types/Country';
import {
  ChartLegend,
  CurrencyChart,
  EmptyChartState,
  getChartColors,
  getTotalStatesCount,
  LoadingChartState,
  prepareCurrencyData,
  prepareRegionData,
  prepareStatesData,
  prepareTimelineData,
  RegionBarChart,
  RegionPieChart,
  StatesChart,
  SummaryCards,
  TimelineChart,
} from './chart-view';

interface CountriesChartViewProps {
  countries: Country[];
  loading: boolean;
  onAdd?: () => void;
}

const CountriesChartView: React.FC<CountriesChartViewProps> = ({
  countries,
  loading,
  onAdd,
}) => {

  if (loading) {
    return <LoadingChartState />;
  }

  if (!countries || countries.length === 0) {
    return <EmptyChartState onAdd={onAdd} />;
  }

  const regionData = prepareRegionData(countries);
  const currencyData = prepareCurrencyData(countries);
  const timelineData = prepareTimelineData(countries);
  const statesData = prepareStatesData(countries);
  const colors = getChartColors();

  const totalCountries = countries.length;
  const totalRegions = regionData.length;
  const totalCurrencies = currencyData.length;
  const totalStates = getTotalStatesCount(countries);
  const avgPerRegion = Math.round(totalCountries / totalRegions);

  return (
    <Box sx={{ width: "100%" }}>
      <SummaryCards
        totalCountries={totalCountries}
        totalRegions={totalRegions}
        totalCurrencies={totalCurrencies}
        totalStates={totalStates}
        avgPerRegion={avgPerRegion}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RegionBarChart data={regionData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <RegionPieChart data={regionData} colors={colors} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <StatesChart data={statesData} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CurrencyChart data={currencyData} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TimelineChart data={timelineData} />
        </Grid>
      </Grid>

      <ChartLegend data={regionData} colors={colors} />
    </Box>
  );
};

export default CountriesChartView;