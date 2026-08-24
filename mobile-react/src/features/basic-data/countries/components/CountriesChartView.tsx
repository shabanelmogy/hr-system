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
import type { Country } from '../types/country';
import {
  getCountryChartSummary,
  prepareCountryCoverageData,
  prepareCountryCurrencyData,
  prepareCountryStatesData,
  prepareCountryTimelineData,
} from './chart-view/country-chart-data';

interface CountriesChartViewProps {
  countries: readonly Country[];
  totalCount: number;
}

export function CountriesChartView({ countries, totalCount }: CountriesChartViewProps) {
  const { i18n, t } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;

  if (countries.length === 0) {
    return <AppStateView message={t('countries.charts.noData')} state="empty" />;
  }

  const summary = getCountryChartSummary(countries);
  const emptyLabel = t('countries.charts.noSeriesData');

  return (
    <View style={styles.root}>
      <AppChartSummary items={[
        { key: 'matching', label: t('countries.charts.totalMatching'), value: totalCount },
        { key: 'loaded', label: t('countries.charts.visibleCountries'), value: countries.length },
        { key: 'states', label: t('countries.charts.visibleStates'), value: summary.states },
        { key: 'currencies', label: t('countries.charts.visibleCurrencies'), value: summary.currencies },
      ]} />
      <AppChartCard title={t('countries.charts.statesByCountry')}>
        <AppHorizontalBarChart
          data={prepareCountryStatesData(countries, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('countries.charts.statesCoverage')}>
        <AppRingChart
          centerLabel={t('countries.charts.visibleCountries')}
          data={prepareCountryCoverageData(countries, {
            withStates: t('countries.charts.withStates'),
            withoutStates: t('countries.charts.withoutStates'),
          })}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('countries.charts.currencies')}>
        <AppVerticalBarChart
          data={prepareCountryCurrencyData(countries)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
      <AppChartCard title={t('countries.charts.createdTimeline')}>
        <AppVerticalBarChart
          data={prepareCountryTimelineData(countries, language)}
          emptyLabel={emptyLabel}
        />
      </AppChartCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8, paddingHorizontal: 2, paddingBottom: 2 },
});
