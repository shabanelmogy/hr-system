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
import type { State } from '../types/state';
import {
  getStateChartSummary,
  prepareStateCountryData,
  prepareStateDistrictCoverageData,
  prepareStateDistrictData,
  prepareStateTimelineData,
} from './chart-view/state-chart-data';

interface StatesChartViewProps {
  states: readonly State[];
  totalCount: number;
}

export function StatesChartView({ states, totalCount }: StatesChartViewProps) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  if (states.length === 0) {
    return <AppStateView message={t('states.charts.noData')} state="empty" />;
  }

  const summary = getStateChartSummary(states);
  const countryData = prepareStateCountryData(states, language);
  const emptyLabel = t('states.charts.noSeriesData');

  return (
    <View style={styles.root}>
      <AppChartSummary items={[
        { key: 'matching', label: t('states.charts.totalMatching'), value: totalCount },
        { key: 'loaded', label: t('states.charts.visibleStates'), value: states.length },
        { key: 'countries', label: t('states.charts.visibleCountries'), value: summary.countries },
        { key: 'districts', label: t('states.charts.visibleDistricts'), value: summary.districts },
      ]} />
      <AppChartCard title={t('states.charts.statesByCountry')}>
        <AppHorizontalBarChart data={countryData} emptyLabel={emptyLabel} />
      </AppChartCard>
      <AppChartCard title={t('states.charts.districtCoverage')}>
        <AppRingChart
          centerLabel={t('states.charts.visibleStates')}
          data={prepareStateDistrictCoverageData(states, {
            withDistricts: t('states.charts.withDistricts'),
            withoutDistricts: t('states.charts.withoutDistricts'),
          })}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('states.charts.districtsByState')}>
        <AppHorizontalBarChart
          data={prepareStateDistrictData(states, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('states.charts.createdTimeline')}>
        <AppVerticalBarChart
          data={prepareStateTimelineData(states, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8, paddingHorizontal: 2, paddingBottom: 2 },
});
