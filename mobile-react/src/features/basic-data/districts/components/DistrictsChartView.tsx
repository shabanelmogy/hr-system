import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AppChartCard,
  AppChartSummary,
  AppHorizontalBarChart,
  AppRingChart,
  AppStateView,
  AppVerticalBarChart,
} from '@/src/shared/components';
import type { District } from '../types/district';
import {
  getDistrictChartSummary,
  prepareDistrictStateData,
  prepareDistrictAddressCoverageData,
  prepareDistrictAddressData,
  prepareDistrictTimelineData,
} from './chart-view/district-chart-data';

interface DistrictsChartViewProps {
  districts: readonly District[];
  totalCount: number;
}

export function DistrictsChartView({ districts, totalCount }: DistrictsChartViewProps) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  if (districts.length === 0) {
    return <AppStateView message={t('districts.charts.noData')} state="empty" />;
  }

  const summary = getDistrictChartSummary(districts);
  const stateData = prepareDistrictStateData(districts, language);
  const emptyLabel = t('districts.charts.noSeriesData');

  return (
    <View style={styles.root}>
      <AppChartSummary items={[
        { key: 'matching', label: t('districts.charts.totalMatching'), value: totalCount },
        { key: 'loaded', label: t('districts.charts.visibleDistricts'), value: districts.length },
        { key: 'states', label: t('districts.charts.visibleStates'), value: summary.states },
        { key: 'addresses', label: t('districts.charts.visibleAddresses'), value: summary.addresses },
      ]} />
      <AppChartCard title={t('districts.charts.districtsByState')}>
        <AppHorizontalBarChart data={stateData} emptyLabel={emptyLabel} />
      </AppChartCard>
      <AppChartCard title={t('districts.charts.addressCoverage')}>
        <AppRingChart
          centerLabel={t('districts.charts.visibleDistricts')}
          data={prepareDistrictAddressCoverageData(districts, {
            withAddresses: t('districts.charts.withAddresses'),
            withoutAddresses: t('districts.charts.withoutAddresses'),
          })}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('districts.charts.addressesByDistrict')}>
        <AppHorizontalBarChart
          data={prepareDistrictAddressData(districts, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('districts.charts.createdTimeline')}>
        <AppVerticalBarChart
          data={prepareDistrictTimelineData(districts, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8, paddingHorizontal: 2, paddingBottom: 2 },
});
