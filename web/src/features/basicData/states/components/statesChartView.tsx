import { Box, Grid } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { State } from '../types/State';
import {
  ChartLegend,
  CountryBarChart,
  CountryPieChart,
  EmptyChartState,
  getChartColors,
  LoadingChartState,
  prepareCountryData,
  prepareStateDistributionData,
  prepareTimelineData,
  StateDistributionChart,
  SummaryCards,
  TimelineChart,
} from './chartView';

interface StatesChartViewProps {
  states: State[];
  loading: boolean;
  onAdd?: () => void;
}

const StatesChartView: React.FC<StatesChartViewProps> = ({
  states,
  loading,
  onAdd,
}) => {
  const { t } = useTranslation();

  // Handle loading state
  if (loading) {
    return <LoadingChartState t={t} />;
  }

  // Handle empty state
  if (!states || states.length === 0) {
    return <EmptyChartState t={t} onAdd={onAdd} />;
  }

  // Prepare chart data
  const countryData = prepareCountryData(states);
  const distributionData = prepareStateDistributionData(states);
  const timelineData = prepareTimelineData(states);
  const colors = getChartColors();

  // Calculate summary metrics
  const totalStates = states.length;
  const totalCountries = countryData.length;
  const avgStatesPerCountry = totalCountries > 0 ? Math.round(totalStates / totalCountries) : 0;
  
  // Calculate completion rate based on data quality
  const completedStates = states.filter(state => 
    state.nameEn && state.nameAr && state.code && state.countryId
  ).length;
  const completionRate = totalStates > 0 ? Math.round((completedStates / totalStates) * 100) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Cards */}
      <SummaryCards
        totalStates={totalStates}
        totalCountries={totalCountries}
        avgStatesPerCountry={avgStatesPerCountry}
        completionRate={completionRate}
        t={t}
      />

      {/* Charts */}
      <Grid container spacing={3}>
        {/* States by Country - Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CountryBarChart data={countryData} t={t} />
        </Grid>

        {/* States by Country - Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <CountryPieChart data={countryData} colors={colors} t={t} />
        </Grid>

        {/* State Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StateDistributionChart data={distributionData} t={t} />
        </Grid>

        {/* Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TimelineChart data={timelineData} t={t} />
        </Grid>
      </Grid>

      {/* Legend */}
      <ChartLegend data={countryData} colors={colors} />
    </Box>
  );
};

export default StatesChartView;
