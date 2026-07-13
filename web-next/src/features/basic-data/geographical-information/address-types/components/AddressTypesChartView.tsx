import { Box, Grid } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AddressType } from '../types/AddressType';
import {
  ChartLegend,
  EmptyChartState,
  getChartColors,
  getCompleteAddressTypes,
  getRecentAddressTypes,
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
} from './chart-view';

interface AddressTypesChartViewProps {
  items: AddressType[];
  loading: boolean;
  onAdd?: () => void;
}

const AddressTypesChartView: React.FC<AddressTypesChartViewProps> = ({
  items,
  loading,
  onAdd,
}) => {
  const { t } = useTranslation();

  // Handle loading state
  if (loading) {
    return <LoadingChartState t={t} />;
  }

  // Handle empty state
  if (!items || items.length === 0) {
    return <EmptyChartState t={t} onAdd={onAdd} />;
  }

  // Prepare chart data
  const initialLetterData = prepareInitialLetterData(items);
  const languageData = prepareLanguageData(items);
  const nameLengthData = prepareNameLengthData(items);
  const timelineData = prepareTimelineData(items);
  const colors = getChartColors();

  // Calculate summary metrics
  const totalAddressTypes = items.length;
  const completeAddressTypes = getCompleteAddressTypes(items);
  const recentAddressTypes = getRecentAddressTypes(items);
  const averageNameLength = items.reduce((sum, item) => {
    const maxLength = Math.max(
      item.nameAr?.length || 0,
      item.nameEn?.length || 0
    );
    return sum + maxLength;
  }, 0) / items.length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Summary Cards */}
      <SummaryCards
        totalAddressTypes={totalAddressTypes}
        completeAddressTypes={completeAddressTypes}
        recentAddressTypes={recentAddressTypes}
        averageNameLength={averageNameLength}
        t={t}
      />

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Address Types by Initial Letter */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InitialLetterChart data={initialLetterData} t={t} />
        </Grid>

        {/* Language Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <LanguageDistributionChart data={languageData} t={t} />
        </Grid>

        {/* Name Length Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <NameLengthChart data={nameLengthData} t={t} />
        </Grid>

        {/* Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TimelineChart data={timelineData} t={t} />
        </Grid>
      </Grid>

      {/* Legend */}
      <ChartLegend data={initialLetterData} colors={colors} />
    </Box>
  );
};

export default AddressTypesChartView;
