import { Box, Grid } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { District } from '../types/District';
import {
  ChartLegend,
  DistrictCodeChart,
  EmptyChartState,
  getChartColors,
  getActiveDistrictsCount,
  getAverageDistrictsPerState,
  getDistrictsWithCodesCount,
  getTotalDistrictsCount,
  getUniqueStatesCount,
  LoadingChartState,
  prepareDistrictCodeData,
  prepareStateData,
  prepareTimelineData,
  StateBarChart,
  StatePieChart,
  SummaryCards,
  TimelineChart,
} from './chart-view';

interface DistrictsChartViewProps {
  districts: District[];
  loading: boolean;
  onAdd?: () => void;
}

const DistrictsChartView: React.FC<DistrictsChartViewProps> = ({
  districts,
  loading,
  onAdd,
}) => {
  const { t } = useTranslation();

  // Handle loading state
  if (loading) {
    return <LoadingChartState t={t} />;
  }

  // Handle empty state
  if (!districts || districts.length === 0) {
    return <EmptyChartState t={t} onAdd={onAdd} />;
  }

  // Prepare chart data
  const stateData = prepareStateData(districts);
  const codeData = prepareDistrictCodeData(districts);
  const timelineData = prepareTimelineData(districts);
  const colors = getChartColors();

  // Calculate summary metrics
  const totalDistricts = getTotalDistrictsCount(districts);
  const totalStates = getUniqueStatesCount(districts);
  const totalCodes = getDistrictsWithCodesCount(districts);
  const activeDistricts = getActiveDistrictsCount(districts);
  const avgPerState = getAverageDistrictsPerState(districts);

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Cards */}
      <SummaryCards
        totalDistricts={totalDistricts}
        totalStates={totalStates}
        totalCodes={totalCodes}
        activeDistricts={activeDistricts}
        avgPerState={avgPerState}
        t={t}
      />

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Districts by State - Bar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StateBarChart data={stateData} t={t} />
        </Grid>

        {/* Districts by State - Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <StatePieChart data={stateData} colors={colors} t={t} />
        </Grid>

        {/* District Code Prefixes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <DistrictCodeChart data={codeData} t={t} />
        </Grid>

        {/* Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TimelineChart data={timelineData} t={t} />
        </Grid>
      </Grid>

      {/* Legend */}
      <ChartLegend data={stateData} colors={colors} />
    </Box>
  );
};

export default DistrictsChartView;
